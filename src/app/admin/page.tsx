'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Shield, UserCheck, Check, X, ArrowDownLeft, ArrowUpRight, FileText, Lock, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Тот самый ID админа (твой)
const TEST_USER_ID = '5223055e-5885-40b6-9494-c482ba748050';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'finance' | 'kyc' | 'security'>('kyc');
  const [isAuthorized, setIsAuthorized] = useState(false); // Флаг доступа
  
  // Явно указываем типы, чтобы TS не ругался
  const [data, setData] = useState<{
      deposits: any[],
      withdrawals: any[],
      verifications: any[],
      security: any[]
  }>({ deposits: [], withdrawals: [], verifications: [], security: [] });
  
  const [selectedKyc, setSelectedKyc] = useState<any>(null);

  useEffect(() => {
    // 1. ПРОВЕРКА ПРАВ АДМИНА
    const checkAccess = async () => {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', TEST_USER_ID).single();
        
        if (profile && profile.role === 'admin') {
            setIsAuthorized(true); // Разрешаем доступ
            fetchAll(); // Грузим данные
            
            // Подписки
            const subs = [
                supabase.channel('a1').on('postgres_changes', { event: '*', schema: 'public', table: 'deposits' }, fetchAll).subscribe(),
                supabase.channel('a2').on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, fetchAll).subscribe(),
                supabase.channel('a3').on('postgres_changes', { event: '*', schema: 'public', table: 'verifications' }, fetchAll).subscribe(),
                supabase.channel('a4').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchAll).subscribe(),
            ];
            return () => { subs.forEach(s => s.unsubscribe()); };
        } else {
            toast.error("Доступ запрещен");
            router.push('/'); // Выкидываем, если не админ
        }
    };

    checkAccess();
  }, []);

  const fetchAll = async () => {
    const d = await supabase.from('deposits').select('*').order('created_at', { ascending: false });
    const w = await supabase.from('withdrawals').select('*').order('created_at', { ascending: false });
    const v = await supabase.from('verifications').select('*').order('created_at', { ascending: false });
    const p = await supabase.from('profiles').select('*').eq('two_factor_status', 'pending');
    
    setData({ 
        deposits: d.data || [], 
        withdrawals: w.data || [], 
        verifications: v.data || [], 
        security: p.data || [] 
    });
  };

  // --- ЛОГИКА 2FA ---
  const handle2FA = async (userId: string, action: 'approve' | 'reject') => {
      if (!confirm(action === 'approve' ? 'Включить 2FA?' : 'Отклонить?')) return;
      const newStatus = action === 'approve' ? 'enabled' : 'disabled';
      await supabase.from('profiles').update({ two_factor_status: newStatus }).eq('id', userId);
      toast.success(action === 'approve' ? '2FA Включена' : 'Отклонено');
  };

  // --- ЛОГИКА KYC ---
  const handleKyc = async (id: string, userId: string, level: number, status: string) => {
      if (!confirm(status === 'verified' ? 'Одобрить?' : 'Отклонить?')) return;
      await supabase.from('verifications').update({ status }).eq('id', id);
      
      const newStatus = status === 'verified' ? (level === 3 ? 'verified_full' : 'verified') : 'rejected';
      // Если отклоняем, уровень не повышаем (оставляем как есть или 1)
      const newLevel = status === 'verified' ? level : 1; 

      await supabase.from('profiles').update({ verification_status: newStatus, verification_level: newLevel }).eq('id', userId);
      toast.success('Статус обновлен');
      setSelectedKyc(null);
  };

  // --- ЛОГИКА ФИНАНСОВ ---
  const approveDeposit = async (id: string, userId: string, amount: number) => {
      if (!confirm(`Зачислить $${amount}?`)) return;
      await supabase.from('deposits').update({ status: 'approved' }).eq('id', id);
      const { data: user } = await supabase.from('profiles').select('balance_real').eq('id', userId).single();
      if (user) await supabase.from('profiles').update({ balance_real: user.balance_real + amount }).eq('id', userId);
      toast.success('Зачислено');
  };

  const approveWithdrawal = async (id: string) => {
      if (!confirm('Выплачено?')) return;
      await supabase.from('withdrawals').update({ status: 'paid' }).eq('id', id);
      toast.success('Подтверждено');
  };

  // Если доступ еще не подтвержден — показываем лоадер
  if (!isAuthorized) {
      return (
          <div className="h-screen w-screen bg-[#0d1117] flex flex-col items-center justify-center text-white font-sans">
              <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
              <h2 className="text-xl font-bold uppercase tracking-widest">Ghost Trace Admin</h2>
              <p className="text-gray-500 text-xs mt-2">Checking privileges...</p>
          </div>
      );
  }

  // Интерфейс Админки
  return (
    <div className="flex h-screen bg-[#0d1117] text-white font-sans overflow-hidden">
      <Toaster position="top-right" theme="dark" />
      
      {/* SIDEBAR */}
      <div className="w-64 bg-[#10161e] border-r border-[#19202a] p-6 flex flex-col gap-2 shrink-0 z-20">
         <h1 className="text-xl font-black uppercase text-blue-500 mb-8 tracking-widest">Admin Panel</h1>
         <TabBtn active={activeTab === 'kyc'} onClick={() => setActiveTab('kyc')} icon={<UserCheck size={16}/>} label="Верификация" count={data.verifications.filter((x: any) => x.status === 'pending').length} />
         <TabBtn active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={<Shield size={16}/>} label="Финансы" count={data.deposits.filter((x: any) => x.status === 'pending').length} />
         <TabBtn active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<Lock size={16}/>} label="Безопасность" count={data.security.length} />
      </div>

      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-[#0d1117]">
          
          {/* SECURITY */}
          {activeTab === 'security' && (
              <div className="max-w-4xl">
                  <h2 className="text-xl font-black mb-6 text-white flex items-center gap-2"><Lock className="text-orange-500"/> Запросы на 2FA</h2>
                  {data.security.length === 0 ? <EmptyState text="Нет активных запросов"/> : (
                      <div className="grid gap-4">
                          {data.security.map((u: any) => (
                              <div key={u.id} className="bg-[#161b22] p-5 rounded-xl border border-[#2a323d] flex justify-between items-center shadow-lg">
                                  <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold border border-orange-500/20">2FA</div>
                                      <div><div className="font-bold text-white text-lg">{u.full_name || 'Пользователь'}</div><div className="text-xs text-gray-500 font-mono">ID: {u.id}</div></div>
                                  </div>
                                  <div className="flex gap-3">
                                      <button onClick={() => handle2FA(u.id, 'approve')} className="bg-green-600 hover:bg-green-500 px-6 py-2.5 rounded-lg text-xs font-bold uppercase transition-colors text-white">Включить</button>
                                      <button onClick={() => handle2FA(u.id, 'reject')} className="bg-[#2a323d] hover:bg-red-900/50 text-red-400 border border-red-500/20 px-6 py-2.5 rounded-lg text-xs font-bold uppercase transition-colors">Отклонить</button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          )}

          {/* KYC */}
          {activeTab === 'kyc' && (
              <div className="grid grid-cols-3 gap-6 h-full">
                  <div className="col-span-1 flex flex-col gap-2 overflow-y-auto pr-2 pb-10 max-h-[85vh]">
                      {data.verifications.map((v: any) => (
                          <button key={v.id} onClick={() => setSelectedKyc(v)} className={`p-4 rounded-xl border text-left transition-all ${selectedKyc?.id === v.id ? 'bg-[#2a323d] border-blue-500 shadow-md' : 'bg-[#161b22] border-[#2a323d] hover:border-gray-500'}`}>
                              <div className="flex justify-between mb-1"><span className="font-bold text-sm text-white">{v.full_name}</span><span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-1.5 rounded">LVL {v.level}</span></div>
                              <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${v.status === 'pending' ? 'text-yellow-500 bg-yellow-500/10' : v.status === 'verified' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>{v.status}</span>
                          </button>
                      ))}
                  </div>
                  <div className="col-span-2 bg-[#161b22] rounded-2xl border border-[#2a323d] p-6 h-full overflow-y-auto max-h-[85vh]">
                      {selectedKyc ? (
                          <div className="space-y-6">
                              <div className="flex justify-between items-start border-b border-[#2a323d] pb-4">
                                  <div><h2 className="text-2xl font-black text-white">{selectedKyc.full_name}</h2><div className="flex gap-4 mt-2 text-xs text-gray-400 font-mono"><span>DOC: {selectedKyc.doc_number}</span><span>COUNTRY: {selectedKyc.country}</span></div></div>
                                  {selectedKyc.status === 'pending' && (
                                      <div className="flex gap-3"><button onClick={() => handleKyc(selectedKyc.id, selectedKyc.user_id, selectedKyc.level, 'verified')} className="bg-green-600 px-6 py-2 rounded-lg font-bold text-xs uppercase hover:bg-green-500 text-white">Одобрить</button><button onClick={() => handleKyc(selectedKyc.id, selectedKyc.user_id, selectedKyc.level, 'rejected')} className="bg-red-600 px-6 py-2 rounded-lg font-bold text-xs uppercase hover:bg-red-500 text-white">Отклонить</button></div>
                                  )}
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  {selectedKyc.level === 3 ? <div className="col-span-2"><span className="text-xs font-bold text-gray-500 uppercase block mb-2">Адрес</span><img src={selectedKyc.front_image} className="w-full rounded-lg border border-[#2a323d] bg-black/50" /></div> : <><div className="col-span-1"><span className="text-xs font-bold text-gray-500 uppercase block mb-2">Лицевая</span><img src={selectedKyc.front_image} className="w-full rounded-lg border border-[#2a323d] bg-black/50" /></div><div className="col-span-1"><span className="text-xs font-bold text-gray-500 uppercase block mb-2">Обратная</span><img src={selectedKyc.back_image} className="w-full rounded-lg border border-[#2a323d] bg-black/50" /></div><div className="col-span-2"><span className="text-xs font-bold text-gray-500 uppercase block mb-2">Селфи</span><img src={selectedKyc.selfie_image} className="h-64 mx-auto rounded-lg border border-[#2a323d] bg-black/50 object-contain" /></div></>}
                              </div>
                          </div>
                      ) : <EmptyState text="Выберите заявку"/>}
                  </div>
              </div>
          )}

          {/* FINANCE */}
          {activeTab === 'finance' && (
              <div className="grid grid-cols-2 gap-6">
                  <div className="bg-[#161b22] p-5 rounded-2xl border border-[#2a323d]"><h3 className="text-green-400 font-bold mb-4 uppercase text-sm border-b border-[#2a323d] pb-2 flex items-center gap-2"><ArrowDownLeft size={16}/> Входящие</h3><div className="space-y-2 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">{data.deposits.map((d: any) => (<div key={d.id} className="bg-[#0d1117] p-3 rounded-lg border border-[#2a2e39] flex justify-between items-center group hover:border-gray-600 transition-colors"><div><div className="font-black text-white text-lg">${d.amount}</div><div className="text-[10px] text-gray-500">{d.network}</div></div>{d.status === 'pending' ? <button onClick={() => approveDeposit(d.id, d.user_id, d.amount)} className="bg-green-600 px-4 py-1.5 rounded text-[10px] font-bold uppercase hover:bg-green-500 text-white">Одобрить</button> : <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${d.status==='approved'?'bg-green-500/10 text-green-500':'bg-red-500/10 text-red-500'}`}>{d.status}</span>}</div>))}</div></div>
                  <div className="bg-[#161b22] p-5 rounded-2xl border border-[#2a323d]"><h3 className="text-orange-400 font-bold mb-4 uppercase text-sm border-b border-[#2a323d] pb-2 flex items-center gap-2"><ArrowUpRight size={16}/> Исходящие</h3><div className="space-y-2 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">{data.withdrawals.map((w: any) => (<div key={w.id} className="bg-[#0d1117] p-3 rounded-lg border border-[#2a2e39] group hover:border-gray-600 transition-colors"><div className="flex justify-between mb-1"><div className="font-black text-white text-lg">${w.amount}</div><span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${w.status==='pending'?'bg-yellow-500/10 text-yellow-500':w.status==='paid'?'bg-green-500/10 text-green-500':'bg-red-500/10 text-red-500'}`}>{w.status}</span></div><div className="text-[10px] text-gray-500 bg-[#1c2028] p-2 rounded font-mono break-all border border-[#2a323d]">{w.wallet_address}</div>{w.status === 'pending' && <button onClick={() => approveWithdrawal(w.id)} className="bg-orange-600 w-full py-2 rounded text-[10px] font-bold uppercase mt-2 hover:bg-orange-500 text-white">Выплатить</button>}</div>))}</div></div>
              </div>
          )}
      </div>
    </div>
  );
}

const TabBtn = ({ active, onClick, icon, label, count }: any) => (<button onClick={onClick} className={`w-full p-3 rounded-xl font-bold text-xs uppercase text-left flex items-center gap-3 transition-all mb-2 ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:bg-[#1c242f] hover:text-white'}`}>{icon} <span className="flex-1">{label}</span>{count > 0 && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full shadow-sm">{count}</span>}</button>);
const EmptyState = ({text}:any) => (<div className="flex flex-col items-center justify-center py-20 border border-[#2a2e39] rounded-2xl border-dashed"><FileText size={48} className="mb-4 opacity-20"/><p className="text-gray-500 font-bold uppercase text-sm tracking-widest">{text}</p></div>);