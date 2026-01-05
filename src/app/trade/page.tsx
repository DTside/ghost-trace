'use client';
import { useEffect, useState } from 'react';
import TradingChart from '@/components/TradingChart';
import { Sidebar } from '@/components/layout/Sidebar';
import { TradePanel } from '@/components/trade/TradePanel';
import { useTradeStore, ASSETS } from '@/store/useTradeStore';
import { ChevronDown, Zap, Search, Star, User, LogOut, Wallet } from 'lucide-react';
import { DepositModal } from '@/components/trade/DepositModal';
import { WithdrawModal } from '@/components/trade/WithdrawModal';
import { MobileNav } from '@/components/layout/MobileNav';

export default function TradePage() {
  const { subscribeToData, currentAsset, setAsset } = useTradeStore() as any;
  
  const [isAssetOpen, setIsAssetOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  
  const TEST_USER_ID = '5223055e-5885-40b6-9494-c482ba748050';

  useEffect(() => {
    const init = async () => { await subscribeToData(TEST_USER_ID); };
    init();
  }, []);

  const filteredAssets = ASSETS.filter((a: any) => 
    a.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen bg-[#0d1117] overflow-hidden text-white font-sans selection:bg-blue-500/30">
      
      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} />

      {/* SIDEBAR (Скрыт на мобильных) */}
      <div className="hidden md:block h-full">
          <Sidebar />
      </div>
      
      {/* MOBILE NAV (Виден только на мобильных) */}
      <MobileNav />

      <div className="flex-1 flex flex-col h-full min-w-0 pb-16 md:pb-0"> {/* Отступ снизу для мобильного меню */}
         
         {/* ХЕДЕР */}
         <header className="h-[60px] bg-[#10161e] border-b border-[#19202a] flex items-center justify-between px-4 md:px-6 z-50 relative shrink-0">
            
            {/* АКТИВЫ */}
            <div className="flex items-center gap-2 relative">
                <div className="relative">
                    <button 
                        onClick={() => setIsAssetOpen(!isAssetOpen)}
                        className="flex items-center gap-2 md:gap-3 bg-[#1c242f] hover:bg-[#252d3a] border border-[#2a323d] rounded-lg px-3 py-1.5 transition-all min-w-[140px] md:min-w-[200px]"
                    >
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold text-sm md:text-lg">₿</div>
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-xs md:text-sm font-bold text-white">{currentAsset.label}</span>
                            <span className="text-[9px] md:text-[10px] text-gray-400">{currentAsset.name}</span>
                        </div>
                        <ChevronDown size={14} className={`ml-auto text-gray-500 transition-transform ${isAssetOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isAssetOpen && (
                        <div className="absolute top-full left-0 mt-2 w-[300px] md:w-[350px] bg-[#1e232d] border border-[#2a323d] rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-3 border-b border-[#2a323d]">
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
                                    <input 
                                        type="text" 
                                        placeholder="Поиск валют..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-[#161b22] border border-[#2a323d] rounded-lg py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                {filteredAssets.length > 0 ? filteredAssets.map((asset: any) => (
                                    <button
                                        key={asset.id}
                                        onClick={() => { setAsset(asset.id); setIsAssetOpen(false); }}
                                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#2a323d] transition-colors border-b border-[#2a323d]/50 last:border-0 group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Star size={14} className="text-gray-600 group-hover:text-yellow-500 transition-colors" />
                                            <div className="flex flex-col items-start">
                                                <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{asset.label}</span>
                                                <span className="text-[10px] text-gray-500">{asset.name}</span>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-black px-2 py-1 rounded border ${asset.payout >= 90 ? 'text-orange-400 bg-orange-400/10 border-orange-400/20' : 'text-green-400 bg-green-400/10 border-green-400/20'}`}>
                                            {asset.payout}%
                                        </span>
                                    </button>
                                )) : <div className="p-4 text-center text-xs text-gray-500">Ничего не найдено</div>}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-start px-1 md:px-2 hidden sm:flex">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Выплата</span>
                      <span className="text-lg md:text-xl font-black text-green-400 leading-none">{currentAsset.payout}%</span>
                </div>
            </div>

            {/* ПРАВАЯ ЧАСТЬ */}
            <div className="flex items-center gap-2 md:gap-3">
                <button 
                    onClick={() => setIsDepositOpen(true)}
                    className="bg-[#007aff] px-3 md:px-6 py-2 rounded-xl font-black text-[10px] md:text-[11px] flex items-center gap-1 md:gap-2 uppercase shadow-lg shadow-blue-500/20 hover:bg-[#006ee6] active:scale-95 transition-all"
                >
                    <Zap size={14} fill="currentColor" /> <span className="hidden sm:inline">Пополнить счет</span><span className="sm:hidden">Пополнить</span>
                </button>

                <div className="relative">
                    <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#2a323d] hover:bg-[#343a46] flex items-center justify-center text-gray-300 border border-[#3e4552] transition-colors">
                        <User size={18} />
                    </button>
                    {isUserMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-[#1e232d] border border-[#2a323d] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                             <div className="p-4 border-b border-[#2a323d] bg-[#262b34]">
                                <span className="text-xs font-bold text-white block">Trader #5223</span>
                                <span className="text-[10px] text-green-400 font-bold bg-green-400/10 px-1.5 py-0.5 rounded mt-1 inline-block">VERIFIED</span>
                             </div>
                             <button onClick={() => { setIsWithdrawOpen(true); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-gray-300 hover:text-white hover:bg-[#2a323d] flex items-center gap-3 transition-colors">
                                <Wallet size={16} className="text-orange-500"/> Вывести средства
                             </button>
                             <button className="w-full text-left px-4 py-3 text-xs font-bold text-red-400 hover:bg-[#2a323d] flex items-center gap-3 transition-colors border-t border-[#2a323d]">
                                <LogOut size={16}/> Выйти
                             </button>
                        </div>
                    )}
                </div>
            </div>
         </header>

        {/* ГРАФИК И ПАНЕЛЬ (Адаптивный flex) */}
        <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden bg-[#0d1117]">
          {/* График - занимает все место, но на мобильных имеет мин. высоту */}
          <div className="flex-1 relative bg-[#10161e] shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] min-h-[450px] lg:min-h-0 order-1 lg:order-1">
            <TradingChart />
          </div>
          
          {/* Панель - снизу на мобильных, справа на десктопе */}
          <div className="w-full lg:w-[320px] bg-[#161b22] border-t lg:border-t-0 lg:border-l border-[#2a2e39] z-20 order-2 lg:order-2 shrink-0">
             <TradePanel />
          </div>
        </div>

      </div>
    </div>
  );
}