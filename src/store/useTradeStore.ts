'use client';
import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SOUND_URLS = {
  open: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  win: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  loss: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
};

export const ASSETS = [
  { id: 'BTCUSDT', name: 'Bitcoin', label: 'BTC/USDT (OTC)', payout: 92 },
  { id: 'ETHUSDT', name: 'Ethereum', label: 'ETH/USDT (OTC)', payout: 89 },
  { id: 'BNBUSDT', name: 'Binance Coin', label: 'BNB/USDT (OTC)', payout: 85 },
  { id: 'SOLUSDT', name: 'Solana', label: 'SOL/USDT (OTC)', payout: 88 },
  { id: 'DOGEUSDT', name: 'Dogecoin', label: 'DOGE/USDT (OTC)', payout: 90 },
  { id: 'LTCUSDT', name: 'Litecoin', label: 'LTC/USDT (OTC)', payout: 79 },
  { id: 'SHIBUSDT', name: 'Shiba Inu', label: 'SHIB/USDT (OTC)', payout: 95 },
];

export const useTradeStore = create((set, get: any) => ({
  currentPrice: 0,
  currentAsset: ASSETS[0],
  
  balanceDemo: 10000,
  balanceReal: 0,
  accountType: 'demo',
  
  // НАСТРОЙКИ
  soundEnabled: true, // <--- Новое состояние

  activeTrades: [],
  history: [],

  setCurrentPrice: (price: number) => set({ currentPrice: price }),
  setAsset: (id: string) => set({ currentAsset: ASSETS.find(a => a.id === id) || ASSETS[0] }),
  setAccountType: (type: 'demo' | 'real') => set({ accountType: type }),
  
  // Переключение звука
  toggleSound: async (userId: string, enabled: boolean) => {
      set({ soundEnabled: enabled });
      await supabase.from('profiles').update({ settings_sound: enabled }).eq('id', userId);
  },

  // Проигрывание звука с проверкой
  playSound: (type: 'open' | 'win' | 'loss') => {
      const { soundEnabled } = get();
      if (!soundEnabled) return; // Если звук выключен - выходим
      
      if (typeof window !== 'undefined') {
        const audio = new Audio(SOUND_URLS[type]);
        audio.volume = 0.5;
        audio.play().catch(() => {});
      }
  },

  resetDemoBalance: async (userId: string) => {
    set({ balanceDemo: 10000 });
    await supabase.from('profiles').update({ balance_demo: 10000 }).eq('id', userId);
    toast.success("Демо-счет восстановлен");
  },

  createDeposit: async ({ userId, network, amount, walletTo }: any) => {
    const { error } = await supabase.from('deposits').insert({ user_id: userId, network, amount, wallet_to: walletTo });
    if(error) toast.error("Ошибка"); else toast.success("Заявка создана");
  },

  requestWithdrawal: async ({ userId, amount, network, address }: any) => {
    const { balanceReal } = get();
    if (balanceReal < amount) { toast.error("Недостаточно средств"); return false; }
    set({ balanceReal: balanceReal - amount });
    await supabase.from('profiles').update({ balance_real: balanceReal - amount }).eq('id', userId);
    const { error } = await supabase.from('withdrawals').insert({ user_id: userId, amount, network, wallet_address: address });
    if (error) { set({ balanceReal }); return false; }
    toast.success("Заявка на вывод создана"); return true;
  },

  addTrade: async (trade: any, userId: string) => {
    get().playSound('open'); // Используем функцию из стора
    const { accountType, balanceDemo, balanceReal } = get();
    if (accountType === 'demo') set({ balanceDemo: balanceDemo - trade.amount });
    else set({ balanceReal: balanceReal - trade.amount });
    set((state: any) => ({ activeTrades: [trade, ...state.activeTrades] }));
    await supabase.from('trades').insert({ id: trade.id, user_id: userId, asset: trade.asset, amount: trade.amount, direction: trade.direction, entry_price: trade.price, duration: trade.duration, created_at: new Date(trade.createdAt).toISOString(), status: 'open', outcome: 'pending', account_type: accountType });
  },

  subscribeToData: async (userId: string) => {
    const profile = await supabase.from('profiles').select('balance_demo, balance_real, settings_sound').eq('id', userId).single();
    if (profile.data) {
        set({ 
            balanceDemo: Number(profile.data.balance_demo),
            balanceReal: Number(profile.data.balance_real),
            soundEnabled: profile.data.settings_sound // Грузим настройку
        });
    }

    const trades = await supabase.from('trades').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (trades.data) {
      const active: any[] = [];
      const hist: any[] = [];
      trades.data.forEach((t: any) => {
        const item = { id: t.id, price: t.entry_price, direction: t.direction, amount: t.amount, duration: t.duration, createdAt: new Date(t.created_at).getTime(), endTime: new Date(t.created_at).getTime() + (t.duration * 1000), asset: t.asset, profit: t.profit, outcome: t.outcome, accountType: t.account_type };
        if (t.status === 'open') active.push(item); else hist.push(item);
      });
      set({ activeTrades: active, history: hist });
    }

    const workerInterval = setInterval(async () => {
        const { activeTrades, currentPrice, playSound } = get(); // Берем playSound
        const now = Date.now();
        const expired = activeTrades.filter((t: any) => now >= t.endTime);

        for (const t of expired) {
            const isWin = (t.direction === 'call' && currentPrice > t.price) || (t.direction === 'put' && currentPrice < t.price);
            const payoutPercent = ASSETS.find(a => a.id === t.asset)?.payout || 80;
            const profit = isWin ? t.amount * (payoutPercent / 100) + t.amount : 0;
            const outcome = isWin ? 'win' : 'loss';

            if (isWin) {
                playSound('win');
                toast.success(`+$${(profit - t.amount).toFixed(2)}`, { description: `${t.asset}` });
            } else {
                playSound('loss');
                toast.error(`-$${t.amount}`, { description: `${t.asset}` });
            }

            set((state: any) => {
                const isDemo = t.accountType === 'demo';
                return {
                    activeTrades: state.activeTrades.filter((at: any) => at.id !== t.id),
                    history: [{ ...t, profit: Math.round(profit * 100)/100, outcome }, ...state.history],
                    balanceDemo: isDemo ? state.balanceDemo + profit : state.balanceDemo,
                    balanceReal: !isDemo ? state.balanceReal + profit : state.balanceReal
                };
            });

            await supabase.from('trades').update({ status: 'closed', profit: profit, outcome: outcome }).eq('id', t.id);
            const { data: user } = await supabase.from('profiles').select('balance_demo, balance_real').eq('id', userId).single();
            if (user) {
                if (t.accountType === 'demo') await supabase.from('profiles').update({ balance_demo: user.balance_demo + profit }).eq('id', userId);
                else await supabase.from('profiles').update({ balance_real: user.balance_real + profit }).eq('id', userId);
            }
        }
    }, 1000);

    const sub = supabase.channel('main-room').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, (payload) => set({ balanceDemo: Number(payload.new.balance_demo), balanceReal: Number(payload.new.balance_real) })).subscribe();
    return { unsubscribe: () => { clearInterval(workerInterval); sub.unsubscribe(); } };
  },
}));