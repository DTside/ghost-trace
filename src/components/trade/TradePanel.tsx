'use client';
import { TrendingUp, TrendingDown, Minus, Plus, Clock, DollarSign, Activity, History, ChevronDown, Monitor, Wallet, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTradeStore } from '@/store/useTradeStore';

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ (Перенес наверх, чтобы убрать красную строку) ---

const ActiveItem = ({ trade }: any) => {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, Math.ceil((trade.endTime - Date.now()) / 1000)));

  useEffect(() => {
    const i = setInterval(() => {
        const s = Math.ceil((trade.endTime - Date.now()) / 1000);
        setTimeLeft(s > 0 ? s : 0);
    }, 1000);
    return () => clearInterval(i);
  }, [trade.endTime]);

  return (
    <div className="bg-[#262b34] p-3 rounded-lg border-l-4 flex justify-between items-center relative overflow-hidden animate-in slide-in-from-left-2" 
         style={{ borderLeftColor: trade.direction === 'call' ? '#0faf59' : '#ff443a' }}>
        <div className="relative z-10">
            <div className="flex items-center gap-2">
                <span className={`text-xs font-black ${trade.direction==='call'?'text-green-400':'text-red-400'}`}>{trade.direction.toUpperCase()}</span>
                <span className="text-xs font-bold text-white">${trade.amount}</span>
            </div>
            <span className="text-[10px] text-gray-500 font-bold">{trade.asset}</span>
        </div>
        <div className="text-sm font-mono font-black text-white bg-black/20 px-2 py-0.5 rounded relative z-10">
            00:{timeLeft<10?`0${timeLeft}`:timeLeft}
        </div>
    </div>
  );
};

const HistoryItem = ({ trade }: any) => {
  const isWin = trade.outcome === 'win';
  return (
    <div className="bg-[#262b34] p-2 rounded border-l-2 flex justify-between items-center opacity-80 hover:opacity-100 transition-all hover:bg-[#2d333f]" 
         style={{ borderLeftColor: isWin ? '#0faf59' : '#ff443a' }}>
        <div>
            <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black ${trade.direction==='call'?'text-green-400':'text-red-400'}`}>{trade.direction.toUpperCase()}</span>
                <span className="text-[10px] font-bold text-white">${trade.amount}</span>
            </div>
            <span className="text-[9px] text-gray-500">{new Date(trade.createdAt).toLocaleTimeString()}</span>
        </div>
        <div className={`text-[10px] font-black px-2 py-0.5 rounded ${isWin?'text-green-400 bg-green-400/10 border border-green-500/20':'text-red-400 bg-red-400/10 border border-red-500/20'}`}>
            {isWin ? `+$${trade.profit}` : '$0'}
        </div>
    </div>
  );
};

// --- ОСНОВНОЙ КОМПОНЕНТ ---

export const TradePanel = () => {
  const { currentPrice, addTrade, currentAsset, balanceDemo, balanceReal, accountType, setAccountType, resetDemoBalance, activeTrades, history } = useTradeStore() as any;
  
  const [amount, setAmount] = useState(100);
  const [duration, setDuration] = useState(10);
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [isBalanceOpen, setIsBalanceOpen] = useState(false);
  
  const TEST_USER_ID = '5223055e-5885-40b6-9494-c482ba748050';
  
  const currentBalance = accountType === 'demo' ? balanceDemo : balanceReal;

  const handleTrade = async (direction: 'call' | 'put') => {
    if (currentPrice === 0) return;
    if (currentBalance < amount) {
        alert("Недостаточно средств!");
        return;
    }
    
    const createdAt = Date.now();
    const trade = { 
        id: crypto.randomUUID(), 
        asset: currentAsset.id || 'BTCUSDT', 
        price: currentPrice, direction, amount, duration, createdAt, 
        endTime: createdAt + (duration * 1000),
        accountType 
    };
    addTrade(trade, TEST_USER_ID);
    setTab('active');
  };

  // Фильтруем списки под текущий счет
  const filteredHistory = history.filter((t: any) => t.accountType === accountType);
  const filteredActive = activeTrades.filter((t: any) => t.accountType === accountType);

  return (
    <aside className="w-[340px] h-full bg-[#1c2028] border-l border-[#2a2e39] flex flex-col shrink-0 relative z-20">
      
      {/* ВЫБОР СЧЕТА */}
      <div className="p-4 border-b border-[#2a2e39] bg-[#1c2028] relative z-30">
        <button 
            onClick={() => setIsBalanceOpen(!isBalanceOpen)}
            className="w-full bg-[#262b34] p-4 rounded-xl border border-[#333a47] relative overflow-hidden shadow-lg group hover:border-blue-500/50 transition-all text-left"
        >
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${accountType === 'demo' ? 'from-blue-600 to-cyan-400' : 'from-green-600 to-emerald-400'}`}></div>
            <div className="flex justify-between items-end">
                <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest flex items-center gap-1 mb-1">
                        {accountType === 'demo' ? 'Demo Balance' : 'Live Balance'} <ChevronDown size={10}/>
                    </span>
                    <span className={`text-2xl font-black font-mono tracking-tight transition-colors ${accountType === 'demo' ? 'text-blue-100 group-hover:text-blue-400' : 'text-green-100 group-hover:text-green-400'}`}>
                        ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                </div>
                <div className={`text-[9px] font-black px-2 py-1 rounded border uppercase ${accountType === 'demo' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                    {accountType === 'demo' ? 'Demo' : 'Real'}
                </div>
            </div>
        </button>

        {/* ВЫПАДАШКА */}
        {isBalanceOpen && (
            <div className="absolute top-[85px] left-4 right-4 bg-[#262b34] border border-[#333a47] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-3 border-b border-[#333a47] bg-[#1e232d]">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Выберите счет</span>
                </div>
                
                <button 
                    onClick={() => { setAccountType('real'); setIsBalanceOpen(false); }}
                    className="w-full p-3 flex items-center justify-between hover:bg-[#343a46] border-b border-[#333a47]/50 group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500"><Wallet size={16}/></div>
                        <div className="text-left">
                            <span className="text-xs font-bold text-white block group-hover:text-green-400 transition-colors">Real Account</span>
                            <span className="text-[10px] text-gray-500">Live trading</span>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-white">${balanceReal.toLocaleString()}</span>
                </button>

                <div className="w-full p-3 flex items-center justify-between hover:bg-[#343a46] group cursor-pointer" onClick={() => { setAccountType('demo'); setIsBalanceOpen(false); }}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500"><Monitor size={16}/></div>
                        <div className="text-left">
                            <span className="text-xs font-bold text-white block group-hover:text-blue-400 transition-colors">Demo Account</span>
                            <span className="text-[10px] text-gray-500">Practice</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-400">${balanceDemo.toLocaleString()}</span>
                        <button 
                            onClick={(e) => { e.stopPropagation(); resetDemoBalance(TEST_USER_ID); }}
                            className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                            title="Сбросить до $10,000"
                        >
                            <RefreshCw size={12} />
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
        {/* ВРЕМЯ И СУММА */}
        <div className="flex gap-2">
            <div className="bg-[#262b34] rounded-xl border border-[#333a47] p-2 flex-1 hover:border-gray-500 transition-colors">
                <span className="text-[10px] font-bold text-gray-500 block mb-1 flex items-center gap-1"><Clock size={10}/> Время</span>
                <div className="flex items-center justify-between">
                    <button onClick={() => setDuration(Math.max(5, duration - 5))} className="w-6 h-6 bg-[#343a46] rounded text-white flex items-center justify-center hover:bg-[#3e4552]">-</button>
                    <span className="font-black text-white text-sm">{duration}s</span>
                    <button onClick={() => setDuration(Math.min(60, duration + 5))} className="w-6 h-6 bg-[#343a46] rounded text-white flex items-center justify-center hover:bg-[#3e4552]">+</button>
                </div>
            </div>
            <div className="bg-[#262b34] rounded-xl border border-[#333a47] p-2 flex-1 hover:border-gray-500 transition-colors">
                <span className="text-[10px] font-bold text-gray-500 block mb-1 flex items-center gap-1"><DollarSign size={10}/> Сумма</span>
                <div className="flex items-center justify-between">
                    <button onClick={() => setAmount(Math.max(10, amount - 10))} className="w-6 h-6 bg-[#343a46] rounded text-white flex items-center justify-center hover:bg-[#3e4552]">-</button>
                    <span className="font-black text-white text-sm">${amount}</span>
                    <button onClick={() => setAmount(amount + 10)} className="w-6 h-6 bg-[#343a46] rounded text-white flex items-center justify-center hover:bg-[#3e4552]">+</button>
                </div>
            </div>
        </div>

        {/* КНОПКИ */}
        <div className="grid grid-cols-2 gap-2">
            <button onClick={() => handleTrade('call')} className="bg-[#0faf59] h-14 rounded-xl flex items-center justify-center gap-2 hover:bg-[#12c465] active:translate-y-0.5 transition-all shadow-[0_4px_0_0_#0a7d3f] active:shadow-none active:mt-1 active:mb-[-4px]">
                <div className="flex flex-col items-start leading-none">
                    <span className="text-[9px] text-green-100 font-bold uppercase mb-0.5">Выше</span>
                    <span className="text-xl font-black text-white">CALL</span>
                </div>
                <TrendingUp className="text-white/80" size={24} />
            </button>
            <button onClick={() => handleTrade('put')} className="bg-[#ff443a] h-14 rounded-xl flex items-center justify-center gap-2 hover:bg-[#ff5c53] active:translate-y-0.5 transition-all shadow-[0_4px_0_0_#c4261d] active:shadow-none active:mt-1 active:mb-[-4px]">
                <div className="flex flex-col items-start leading-none">
                    <span className="text-[9px] text-red-100 font-bold uppercase mb-0.5">Ниже</span>
                    <span className="text-xl font-black text-white">PUT</span>
                </div>
                <TrendingDown className="text-white/80" size={24} />
            </button>
        </div>

        {/* СПИСОК СДЕЛОК */}
        <div className="mt-4 flex-1 flex flex-col">
             <div className="flex border-b border-[#2a2e39] mb-2">
                <button onClick={() => setTab('active')} className={`flex-1 pb-2 text-[10px] font-bold uppercase flex items-center justify-center gap-1 ${tab === 'active' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>
                    <Activity size={12}/> Открытые ({filteredActive.length})
                </button>
                <button onClick={() => setTab('history')} className={`flex-1 pb-2 text-[10px] font-bold uppercase flex items-center justify-center gap-1 ${tab === 'history' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>
                    <History size={12}/> История
                </button>
             </div>

             <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1">
                {tab === 'active' ? (
                    filteredActive.length === 0 ? <div className="text-center text-[10px] text-gray-600 py-10">Нет открытых сделок</div> :
                    filteredActive.map((t: any) => <ActiveItem key={t.id} trade={t} />)
                ) : (
                    filteredHistory.length === 0 ? <div className="text-center text-[10px] text-gray-600 py-10">История пуста</div> :
                    filteredHistory.map((t: any) => <HistoryItem key={t.id} trade={t} />)
                )}
            </div>
        </div>
      </div>
    </aside>
  );
};  