'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Sidebar } from '@/components/layout/Sidebar';
import { User, ShieldCheck, Wallet, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2, XCircle, ChevronRight, Shield, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { MobileNav } from '@/components/layout/MobileNav';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const TEST_USER_ID = '5223055e-5885-40b6-9494-c482ba748050';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'deposits' | 'withdrawals'>('deposits');
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ totalDeposit: 0, totalWithdraw: 0 });

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('profile-realtime').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${TEST_USER_ID}` }, (payload) => setProfile(payload.new)).subscribe();
    return () => { channel.unsubscribe(); };
  }, []);

  const fetchData = async () => {
    const { data: user } = await supabase.from('profiles').select('*').eq('id', TEST_USER_ID).single();
    if (user) setProfile(user);
    const { data: deps } = await supabase.from('deposits').select('*').eq('user_id', TEST_USER_ID).order('created_at', { ascending: false });
    if (deps) {
        setDeposits(deps);
        setStats(prev => ({ ...prev, totalDeposit: deps.filter((d: any) => d.status === 'approved').reduce((acc, curr) => acc + Number(curr.amount), 0) }));
    }
    const { data: wds } = await supabase.from('withdrawals').select('*').eq('user_id', TEST_USER_ID).order('created_at', { ascending: false });
    if (wds) {
        setWithdrawals(wds);
        setStats(prev => ({ ...prev, totalWithdraw: wds.filter((d: any) => d.status === 'paid').reduce((acc, curr) => acc + Number(curr.amount), 0) }));
    }
  };

  const renderVerificationBadge = () => {
      const status = profile?.verification_status;
      const level = profile?.verification_level || 1;
      if (status === 'verified_full' || level === 3) return <span className="bg-green-500/10 text-green-500 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-green-500/20 flex items-center gap-1"><ShieldCheck size={12} /> Level 3 (Full)</span>;
      if (status === 'pending') return <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-yellow-500/20 flex items-center gap-1"><Clock size={12} /> На проверке</span>;
      if (status === 'rejected') return <Link href="/verification" className="bg-red-500/10 text-red-500 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-red-500/20 flex items-center gap-1"><XCircle size={12} /> Отклонено <ChevronRight size={10}/></Link>;
      if (status === 'verified' || level === 2) return <div className="flex items-center gap-2"><span className="bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-blue-500/20 flex items-center gap-1"><Shield size={10} /> Level 2</span><Link href="/verification" className="bg-green-500/10 text-green-500 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-green-500/20 hover:bg-green-500/20 flex items-center gap-1 animate-pulse">Апгрейд <ChevronRight size={10}/></Link></div>;
      return <Link href="/verification" className="bg-red-500/10 text-red-500 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-red-500/20 flex items-center gap-1"><AlertCircle size={12}/> Не верифицирован <ChevronRight size={10}/></Link>;
  };

  return (
    <div className="flex h-screen w-screen bg-[#0d1117] overflow-hidden text-white font-sans selection:bg-blue-500/30">
      <div className="hidden md:block"><Sidebar /></div>
      <MobileNav />
      
      <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar p-4 pb-24 md:p-8">
        <div className="max-w-5xl mx-auto w-full">
            <h1 className="text-2xl md:text-3xl font-black mb-6 md:mb-8">Личный кабинет</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                <div className="md:col-span-2 bg-[#1c2028] rounded-2xl p-6 border border-[#2a2e39] flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden text-center sm:text-left">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none"></div>
                    <div className="w-24 h-24 rounded-full bg-[#2a323d] flex items-center justify-center border-4 border-[#1c2028] shadow-xl relative z-10 shrink-0">
                        <User size={40} className="text-gray-400"/>
                        {profile?.verification_level >= 2 && <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1.5 border-4 border-[#1c2028]"><ShieldCheck size={14} className="text-white fill-green-500 stroke-white"/></div>}
                    </div>
                    <div className="relative z-10 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-2 mb-2">
                            <h2 className="text-2xl font-bold text-white">Trader #5223</h2>
                            {renderVerificationBadge()}
                        </div>
                        <p className="text-gray-500 text-sm font-mono mb-4 flex items-center justify-center sm:justify-start gap-2">ID: {TEST_USER_ID}</p>
                        <div className="flex justify-center sm:justify-start gap-3">
                            <Link href="/trade" className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg font-bold text-xs uppercase transition-colors">Торговать</Link>
                            <button className="bg-[#2a323d] hover:bg-[#343a46] px-5 py-2 rounded-lg font-bold text-xs uppercase transition-colors text-gray-300">Настройки</button>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1c2028] rounded-2xl p-6 border border-[#2a2e39] flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
                    <span className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2"><Wallet size={14}/> Реальный баланс</span>
                    <div className="text-4xl font-black text-white mb-1">${profile?.balance_real?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}</div>
                    <div className="flex justify-between text-[10px] font-bold uppercase mt-4">
                        <div className="text-green-500">Ввод: ${stats.totalDeposit}</div>
                        <div className="text-orange-500">Вывод: ${stats.totalWithdraw}</div>
                    </div>
                </div>
            </div>

            <div className="bg-[#1c2028] rounded-2xl border border-[#2a2e39] overflow-hidden min-h-[400px]">
                <div className="flex border-b border-[#2a2e39]">
                    <button onClick={() => setActiveTab('deposits')} className={`flex-1 md:flex-none px-4 md:px-8 py-4 text-xs md:text-sm font-bold uppercase transition-colors relative ${activeTab === 'deposits' ? 'text-blue-400 bg-[#262b34]' : 'text-gray-500'}`}>История пополнений{activeTab === 'deposits' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>}</button>
                    <button onClick={() => setActiveTab('withdrawals')} className={`flex-1 md:flex-none px-4 md:px-8 py-4 text-xs md:text-sm font-bold uppercase transition-colors relative ${activeTab === 'withdrawals' ? 'text-blue-400 bg-[#262b34]' : 'text-gray-500'}`}>История выводов{activeTab === 'withdrawals' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>}</button>
                </div>

                <div className="p-4 overflow-x-auto">
                    <div className="min-w-[600px] flex flex-col gap-2">
                        <div className="grid grid-cols-5 px-4 py-2 text-[10px] font-bold text-gray-500 uppercase">
                            <div className="col-span-1">Тип / ID</div><div className="col-span-1">Метод</div><div className="col-span-1">Дата</div><div className="col-span-1 text-right">Сумма</div><div className="col-span-1 text-right">Статус</div>
                        </div>
                        {activeTab === 'deposits' && (deposits.length > 0 ? deposits.map(d => (
                            <div key={d.id} className="grid grid-cols-5 items-center px-4 py-3 bg-[#262b34]/50 rounded-xl border border-[#2a2e39]">
                                <div className="col-span-1 flex items-center gap-3"><ArrowDownLeft size={16} className="text-green-500"/><span className="text-[9px] font-mono">#{d.id.slice(0,8)}</span></div>
                                <div className="col-span-1 text-xs text-gray-300 font-bold">{d.network}</div>
                                <div className="col-span-1 text-xs text-gray-500">{new Date(d.created_at).toLocaleDateString()}</div>
                                <div className="col-span-1 text-right text-sm font-black text-white">+${d.amount}</div>
                                <div className="col-span-1 flex justify-end"><StatusBadge status={d.status}/></div>
                            </div>
                        )) : <EmptyState />)}
                        {activeTab === 'withdrawals' && (withdrawals.length > 0 ? withdrawals.map(w => (
                            <div key={w.id} className="grid grid-cols-5 items-center px-4 py-3 bg-[#262b34]/50 rounded-xl border border-[#2a2e39]">
                                <div className="col-span-1 flex items-center gap-3"><ArrowUpRight size={16} className="text-orange-500"/><span className="text-[9px] font-mono">#{w.id.slice(0,8)}</span></div>
                                <div className="col-span-1 flex flex-col"><span className="text-xs text-gray-300 font-bold">{w.network}</span><span className="text-[9px] text-gray-600 font-mono truncate w-20">{w.wallet_address}</span></div>
                                <div className="col-span-1 text-xs text-gray-500">{new Date(w.created_at).toLocaleDateString()}</div>
                                <div className="col-span-1 text-right text-sm font-black text-white">-${w.amount}</div>
                                <div className="col-span-1 flex justify-end"><StatusBadge status={w.status}/></div>
                            </div>
                        )) : <EmptyState />)}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'approved' || status === 'paid') return <span className="flex items-center gap-1 bg-green-500/10 text-green-500 px-2 py-1 rounded text-[9px] font-bold uppercase border border-green-500/20"><CheckCircle2 size={10}/> OK</span>;
    if (status === 'rejected') return <span className="flex items-center gap-1 bg-red-500/10 text-red-500 px-2 py-1 rounded text-[9px] font-bold uppercase border border-red-500/20"><XCircle size={10}/> NO</span>;
    return <span className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-[9px] font-bold uppercase border border-yellow-500/20"><Clock size={10}/> Wait</span>;
};
const EmptyState = () => (<div className="py-10 text-center text-gray-500 text-xs">Нет данных</div>);