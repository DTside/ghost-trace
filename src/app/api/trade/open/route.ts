import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Если accountType не пришел, ставим 'demo'
    const { asset, amount, direction, duration, entryPrice, accountType = 'demo' } = body;

    // ID строго со скрина image_be3f23.png (исправил опечатку 40h6 -> 40b6)
    const TEST_USER_ID = '5223055e-5885-40b6-9494-c482ba748050';

    const balanceField = accountType === 'demo' ? 'balance_demo' : 'balance_live';

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('balance_demo, balance_live')
      .eq('id', TEST_USER_ID)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Профиль не найден' }, { status: 404 });
    }

    const currentBalance = Number(profile[balanceField as keyof typeof profile] || 0);

    if (currentBalance < amount) {
      return NextResponse.json({ 
        error: `Недостаточно средств. Баланс: ${currentBalance}, Ставка: ${amount}` 
      }, { status: 400 });
    }

    const newBalance = currentBalance - amount;

    // Списываем деньги
    await supabaseAdmin.from('profiles').update({ [balanceField]: newBalance }).eq('id', TEST_USER_ID);

    // Создаем сделку
    const expiresAt = new Date(Date.now() + duration * 1000);
    const { data: trade } = await supabaseAdmin.from('trades').insert({
      user_id: TEST_USER_ID,
      asset_name: asset,
      amount,
      entry_price: entryPrice,
      direction,
      account_type: accountType,
      status: 'open',
      expires_at: expiresAt.toISOString(),
    }).select().single();

    return NextResponse.json({ success: true, tradeId: trade.id, newBalance });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}