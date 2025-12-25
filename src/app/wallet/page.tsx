'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Sidebar } from '@/components/layout/Sidebar';
import { Wallet, ArrowDownLeft, ArrowUpRight, CreditCard, History, Zap, RefreshCw } from 'lucide-react';
import { DepositModal } from '@/components/trade/DepositModal';
import { WithdrawModal } from '@/components/trade/WithdrawModal';
import { useTradeStore } from '@/store/useTradeStore'; // Для сброса демо

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const TEST_USER_ID = '5223055e-5885-40b6-9494-c482ba748050';

export default function WalletPage() {
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const { resetDemoBalance } = useTradeStore() as any;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: user } = await supabase.from('profiles').select('*').eq('id', TEST_USER_ID).single();
    if (user) setProfile(user);

    // Объединяем депозиты и выводы в один список
    const { data: deps } = await supabase.from('deposits').select('*, type:status').eq('user_id', TEST_USER_ID).order('created_at', { ascending: false }).limit(5);
    const { data: wds } = await supabase.from('withdrawals').select('*, type:status').eq('user_id', TEST_USER_ID).order('created_at', { ascending: false }).limit(5);
    
    // Простая склейка для демо (в реальности нужна сортировка)
    const combined = [
        ...(deps || []).map((d: any) => ({ ...d, type: 'deposit' })),
        ...(wds || []).map((w: any) => ({ ...w, type: 'withdraw' }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    setTransactions(combined);
  };

  return (
    <div className="flex h-screen bg-[#0d1117] text-white font-sans overflow-hidden">
      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} />
      
      <Sidebar />
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-black mb-8 flex items-center gap-3"><Wallet className="text-blue-500"/> Мой кошелек</h1>

            {/* CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {/* REAL ACCOUNT */}
                <div className="bg-gradient-to-br from-[#1c2028] to-[#161a22] p-6 rounded-2xl border border-[#2a2e39] relative overflow-hidden group hover:border-green-500/50 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Wallet size={120}/></div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Real Account</span>
                    <div className="text-4xl font-black text-white mb-6">
                        ${profile?.balance_real?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setIsDepositOpen(true)} className="flex-1 bg-green-600 hover:bg-green-500 h-10 rounded-lg font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2">
                            <ArrowDownLeft size={16}/> Пополнить
                        </button>
                        <button onClick={() => setIsWithdrawOpen(true)} className="flex-1 bg-[#2a323d] hover:bg-[#343a46] h-10 rounded-lg font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2">
                            <ArrowUpRight size={16}/> Вывести
                        </button>
                    </div>
                </div>

                {/* DEMO ACCOUNT */}
                <div className="bg-gradient-to-br from-[#1c2028] to-[#161a22] p-6 rounded-2xl border border-[#2a2e39] relative overflow-hidden group hover:border-blue-500/50 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><CreditCard size={120}/></div>
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1 block">Demo Account</span>
                    <div className="text-4xl font-black text-white mb-6">
                        ${profile?.balance_demo?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => { resetDemoBalance(TEST_USER_ID); setTimeout(fetchData, 500); }} className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 h-10 rounded-lg font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2 border border-blue-500/30">
                            <RefreshCw size={16}/> Обновить баланс до $10,000
                        </button>
                    </div>
                </div>
            </div>

            {/* TRANSACTIONS */}
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><History size={20} className="text-gray-500"/> Последние операции</h2>
            <div className="bg-[#1c2028] rounded-2xl border border-[#2a2e39] overflow-hidden">
                {transactions.length > 0 ? transactions.map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border-b border-[#2a2e39] last:border-0 hover:bg-[#262b34] transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                {t.type === 'deposit' ? <ArrowDownLeft size={20}/> : <ArrowUpRight size={20}/>}
                            </div>
                            <div>
                                <div className="font-bold text-sm text-white uppercase">{t.type === 'deposit' ? 'Пополнение' : 'Вывод средств'}</div>
                                <div className="text-[10px] text-gray-500">{new Date(t.created_at).toLocaleString()}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`font-black text-sm ${t.type === 'deposit' ? 'text-green-400' : 'text-white'}`}>
                                {t.type === 'deposit' ? '+' : '-'}${t.amount}
                            </div>
                            <div className="text-[10px] uppercase font-bold text-gray-500">{t.status}</div>
                        </div>
                    </div>
                )) : (
                    <div className="p-8 text-center text-gray-600 text-sm">История операций пуста</div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}