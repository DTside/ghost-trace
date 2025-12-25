import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fetch from 'cross-fetch';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Используй SERVICE_ROLE_KEY для обхода защит
);

async function processTrades() {
  // 1. Берем все открытые сделки, время которых истекло
  const { data: trades, error } = await supabase
    .from('trades')
    .select('*')
    .eq('status', 'open')
    .lte('expires_at', new Date().toISOString());

  if (error) return console.error('DB Error:', error);
  if (!trades || trades.length === 0) return;

  for (const trade of trades) {
    console.log(`Проверяем сделку: ${trade.id} (${trade.asset_name})`);

    // 2. Получаем актуальную цену с Binance
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${trade.asset_name}`);
    const { price } = await res.json();
    const currentPrice = parseFloat(price);

    // 3. Логика выигрыша
    let isWin = false;
    if (trade.direction === 'call' && currentPrice > trade.entry_price) isWin = true;
    if (trade.direction === 'put' && currentPrice < trade.entry_price) isWin = true;

    const finalStatus = isWin ? 'win' : 'loss';

    // 4. Обновляем статус сделки
    await supabase
      .from('trades')
      .update({ status: finalStatus, exit_price: currentPrice })
      .eq('id', trade.id);

    // 5. Если победа, начисляем "фантики"
    if (isWin) {
      const payout = trade.amount * 1.82; // 82% доходность
      const field = trade.account_type === 'demo' ? 'balance_demo' : 'balance_live';
      
      // Вызываем RPC функцию в Supabase (создадим ее ниже)
      await supabase.rpc('update_user_balance', {
        user_id: trade.user_id,
        amount_to_add: payout,
        balance_field: field
      });
    }

    console.log(`Сделка ${trade.id} закрыта: ${finalStatus.toUpperCase()}`);
  }
}

// Запуск каждые 2 секунды
console.log("🚀 Торговый движок запущен...");
setInterval(processTrades, 2000);