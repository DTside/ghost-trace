'use client';
import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// --- НАСТРОЙКА SUPABASE ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isConfigured = 
    SUPABASE_URL && 
    SUPABASE_KEY && 
    SUPABASE_URL.startsWith('http');

const supabase = isConfigured 
    ? createClient(SUPABASE_URL!, SUPABASE_KEY!) 
    : null;

const SOUND_URLS = {
  open: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  win: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  loss: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
};

// --- СПИСОК АКТИВОВ ---
export const ASSETS = [
  // CRYPTO
  { id: 'BTCUSDT', name: 'Bitcoin', label: 'BTC/USDT (OTC)', payout: 92, category: 'Crypto' },
  { id: 'ETHUSDT', name: 'Ethereum', label: 'ETH/USDT (OTC)', payout: 89, category: 'Crypto' },
  { id: 'LTCUSDT', name: 'Litecoin', label: 'LTC/USDT (OTC)', payout: 85, category: 'Crypto' },
  { id: 'BNBUSDT', name: 'Binance Coin', label: 'BNB/USDT (OTC)', payout: 82, category: 'Crypto' },
  { id: 'SOLUSDT', name: 'Solana', label: 'SOL/USDT (OTC)', payout: 88, category: 'Crypto' },
  { id: 'XRPUSDT', name: 'Ripple', label: 'XRP/USDT (OTC)', payout: 80, category: 'Crypto' },
  { id: 'ADAUSDT', name: 'Cardano', label: 'ADA/USDT (OTC)', payout: 78, category: 'Crypto' },
  { id: 'DOGEUSDT', name: 'Dogecoin', label: 'DOGE/USDT (OTC)', payout: 90, category: 'Crypto' },
  { id: 'SHIBUSDT', name: 'Shiba Inu', label: 'SHIB/USDT (OTC)', payout: 95, category: 'Crypto' },
  { id: 'MATICUSDT', name: 'Polygon', label: 'MATIC/USDT (OTC)', payout: 81, category: 'Crypto' },
  // FOREX
  { id: 'EURUSD', name: 'Euro / USD', label: 'EUR/USD (OTC)', payout: 91, category: 'Forex' },
  { id: 'GBPUSD', name: 'Pound / USD', label: 'GBP/USD (OTC)', payout: 88, category: 'Forex' },
  { id: 'USDJPY', name: 'USD / Yen', label: 'USD/JPY (OTC)', payout: 87, category: 'Forex' },
  { id: 'AUDCAD', name: 'Aus / Can Dollar', label: 'AUD/CAD (OTC)', payout: 85, category: 'Forex' },
  { id: 'USDCHF', name: 'USD / Franc', label: 'USD/CHF (OTC)', payout: 84, category: 'Forex' },
  { id: 'EURJPY', name: 'Euro / Yen', label: 'EUR/JPY (OTC)', payout: 86, category: 'Forex' },
  { id: 'NZDUSD', name: 'NZ / US Dollar', label: 'NZD/USD (OTC)', payout: 82, category: 'Forex' },
  // STOCKS
  { id: 'AAPL', name: 'Apple Inc.', label: 'Apple (OTC)', payout: 85, category: 'Stocks' },
  { id: 'TSLA', name: 'Tesla Inc.', label: 'Tesla (OTC)', payout: 93, category: 'Stocks' },
  { id: 'AMZN', name: 'Amazon', label: 'Amazon (OTC)', payout: 84, category: 'Stocks' },
  { id: 'MSFT', name: 'Microsoft', label: 'Microsoft (OTC)', payout: 82, category: 'Stocks' },
  { id: 'GOOGL', name: 'Google', label: 'Google (OTC)', payout: 80, category: 'Stocks' },
  { id: 'NFLX', name: 'Netflix', label: 'Netflix (OTC)', payout: 88, category: 'Stocks' },
  { id: 'NVDA', name: 'NVIDIA', label: 'NVIDIA (OTC)', payout: 94, category: 'Stocks' },
  { id: 'META', name: 'Meta (FB)', label: 'Meta (OTC)', payout: 83, category: 'Stocks' },
  { id: 'BABA', name: 'Alibaba', label: 'Alibaba (OTC)', payout: 79, category: 'Stocks' },
  // COMMODITIES
  { id: 'XAUUSD', name: 'Gold', label: 'Gold / USD (OTC)', payout: 90, category: 'Commodities' },
  { id: 'XAGUSD', name: 'Silver', label: 'Silver / USD (OTC)', payout: 88, category: 'Commodities' },
  { id: 'UKBRENT', name: 'Brent Oil', label: 'Brent Oil (OTC)', payout: 85, category: 'Commodities' },
];

export const useTradeStore = create((set, get: any) => ({
  currentPrice: 0,
  currentAsset: ASSETS[0], 
  balanceDemo: 10000,
  balanceReal: 0,
  accountType: 'demo',
  soundEnabled: true,
  activeTrades: [],
  history: [],
  isOffline: !isConfigured,

  setCurrentPrice: (price: number) => set({ currentPrice: price }),
  setAsset: (id: string) => set({ currentAsset: ASSETS.find(a => a.id === id) || ASSETS[0] }),
  setAccountType: (type: 'demo' | 'real') => set({ accountType: type }),
  
  // Безопасное выполнение (Fire & Forget)
  safeDbAction: async (action: () => Promise<void>) => {
      const { isOffline } = get();
      if (isOffline || !supabase) return;
      try { await action(); } catch (e) { console.warn("DB silent fail"); }
  },

  toggleSound: async (userId: string, enabled: boolean) => {
      set({ soundEnabled: enabled });
      get().safeDbAction(async () => await supabase!.from('profiles').update({ settings_sound: enabled }).eq('id', userId));
  },

  playSound: (type: 'open' | 'win' | 'loss') => {
      const { soundEnabled } = get();
      if (!soundEnabled) return;
      if (typeof window !== 'undefined') {
        try {
            const audio = new Audio(SOUND_URLS[type]);
            audio.volume = 0.5;
            audio.play().catch(() => {});
        } catch (e) {}
      }
  },

  resetDemoBalance: async (userId: string) => {
    set({ balanceDemo: 10000 });
    toast.success("Демо-счет восстановлен");
    get().safeDbAction(async () => await supabase!.from('profiles').update({ balance_demo: 10000 }).eq('id', userId));
  },

  createDeposit: async ({ userId, network, amount, walletTo }: any) => {
    if (!supabase) { toast.error("База данных недоступна"); return; }
    try {
        const { error } = await supabase.from('deposits').insert({ user_id: userId, network, amount, wallet_to: walletTo });
        if(error) throw error;
    } catch(e) { throw e; }
  },

  requestWithdrawal: async ({ userId, amount, network, address }: any) => {
    const { balanceReal } = get();
    if (balanceReal < amount) { toast.error("Недостаточно средств"); return false; }
    set({ balanceReal: balanceReal - amount });
    if (!supabase) return true;
    try {
        await supabase.from('profiles').update({ balance_real: balanceReal - amount }).eq('id', userId);
        const { error } = await supabase.from('withdrawals').insert({ user_id: userId, amount, network, wallet_address: address });
        if (error) throw error;
        toast.success("Заявка создана"); 
        return true;
    } catch (e) {
        set({ balanceReal }); 
        toast.error("Ошибка сети");
        return false;
    }
  },

  addTrade: async (trade: any, userId: string) => {
    const { accountType, balanceDemo, balanceReal, playSound } = get();
    playSound('open');
    
    // Принудительно конвертируем в числа (на всякий случай)
    const tradeAmount = Number(trade.amount);
    const tradeDuration = Number(trade.duration);
    
    // Обновляем баланс UI
    if (accountType === 'demo') set({ balanceDemo: balanceDemo - tradeAmount });
    else set({ balanceReal: balanceReal - tradeAmount });
    
    // Считаем время
    const startTime = Date.now();
    const endTime = startTime + (tradeDuration * 1000);

    const newTrade = { 
        ...trade, 
        amount: tradeAmount,
        duration: tradeDuration,
        createdAt: startTime, 
        endTime 
    };

    set((state: any) => ({ activeTrades: [newTrade, ...state.activeTrades] }));
    
    // БД
    get().safeDbAction(async () => {
        await supabase!.from('trades').insert({ 
            id: trade.id, user_id: userId, asset: trade.asset, amount: tradeAmount, direction: trade.direction, 
            entry_price: trade.price, duration: tradeDuration, created_at: new Date(startTime).toISOString(), 
            status: 'open', outcome: 'pending', account_type: accountType 
        });
    });
  },

  subscribeToData: async (userId: string) => {
    // 1. Initial Load
    get().safeDbAction(async () => {
        const profile = await supabase!.from('profiles').select('balance_demo, balance_real, settings_sound').eq('id', userId).single();
        if (profile.data) {
            set({ 
                balanceDemo: Number(profile.data.balance_demo) || 10000,
                balanceReal: Number(profile.data.balance_real) || 0,
                soundEnabled: profile.data.settings_sound ?? true
            });
        }
        const trades = await supabase!.from('trades').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (trades.data) {
            const active: any[] = []; const hist: any[] = [];
            trades.data.forEach((t: any) => {
                const createdAt = new Date(t.created_at).getTime();
                const duration = Number(t.duration);
                const endTime = createdAt + (duration * 1000); // Пересчитываем endTime
                
                const item = { 
                    id: t.id, price: t.entry_price, direction: t.direction, amount: t.amount, duration, 
                    createdAt, endTime, asset: t.asset, profit: t.profit, outcome: t.outcome, accountType: t.account_type 
                };
                if (t.status === 'open') active.push(item); else hist.push(item);
            });
            set({ activeTrades: active, history: hist });
        }
    });

    // 2. WORKER (Исправленная версия)
    const workerInterval = setInterval(() => {
        const { activeTrades, currentPrice, playSound, accountType, balanceDemo, balanceReal } = get();
        const now = Date.now();
        
        // Сделки, время которых вышло
        const expired = activeTrades.filter((t: any) => now >= t.endTime);

        if (expired.length === 0) return; // Экономим ресурсы

        let profitDemo = 0;
        let profitReal = 0;
        const newHistoryItems: any[] = [];

        // Проходимся по истекшим
        expired.forEach((t: any) => {
            const isWin = (t.direction === 'call' && currentPrice > t.price) || (t.direction === 'put' && currentPrice < t.price);
            const payoutPercent = ASSETS.find(a => a.id === t.asset)?.payout || 80;
            const profit = isWin ? t.amount * (payoutPercent / 100) + t.amount : 0;
            const outcome = isWin ? 'win' : 'loss';

            // Эффекты
            if (isWin) {
                playSound('win');
                toast.success(`+$${(profit - t.amount).toFixed(2)}`, { description: `${t.asset}` });
            } else {
                playSound('loss');
                toast.error(`-$${t.amount}`, { description: `${t.asset}` });
            }

            if (t.accountType === 'demo') profitDemo += profit;
            else profitReal += profit;

            newHistoryItems.push({ ...t, profit: Math.round(profit * 100)/100, outcome });

            // Отправляем в базу БЕЗ await и .catch, чтобы не стопорить цикл
            if (supabase) {
                // Используем IIFE для изоляции промиса
                (async () => {
                    try {
                        await supabase.from('trades').update({ status: 'closed', profit: profit, outcome: outcome }).eq('id', t.id);
                    } catch (e) { /* ignore network error */ }
                })();
            }
        });

        // Обновляем состояние UI (убираем старые, добавляем в историю, обновляем баланс)
        set((state: any) => ({
            activeTrades: state.activeTrades.filter((t: any) => now < t.endTime),
            history: [...newHistoryItems, ...state.history],
            balanceDemo: state.balanceDemo + profitDemo,
            balanceReal: state.balanceReal + profitReal
        }));

        // Синхронизация баланса (тоже изолированно)
        if (supabase && (profitDemo > 0 || profitReal > 0)) {
            (async () => {
                try {
                    const { data } = await supabase.from('profiles').select('balance_demo, balance_real').eq('id', userId).single();
                    if (data) {
                        await supabase.from('profiles').update({ 
                            balance_demo: data.balance_demo + profitDemo,
                            balance_real: data.balance_real + profitReal 
                        }).eq('id', userId);
                    }
                } catch (e) { /* ignore */ }
            })();
        }

    }, 1000);

    let sub: any = { unsubscribe: () => {} };
    if (supabase) {
        sub = supabase.channel('main-room').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, (payload) => {
            set({ balanceReal: Number(payload.new.balance_real) }); // Обновляем только реал баланс извне
        }).subscribe();
    }

    return { unsubscribe: () => { clearInterval(workerInterval); sub.unsubscribe(); } };
  },
}));