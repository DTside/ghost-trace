'use client';
import { useState, useEffect, useRef } from 'react'; // useRef
import { createClient } from '@supabase/supabase-js';
import { Sidebar } from '@/components/layout/Sidebar';
import { Settings, Save, Shield, Volume2, Globe, Check, Lock, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { useTradeStore } from '@/store/useTradeStore';
import { MobileNav } from '@/components/layout/MobileNav';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const TEST_USER_ID = '5223055e-5885-40b6-9494-c482ba748050';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>({ full_name: '', email: '', two_factor_status: 'disabled' });
  const { soundEnabled, toggleSound } = useTradeStore() as any;
  
  // Ref для хранения предыдущего состояния
  const prevProfile = useRef<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('id', TEST_USER_ID).single();
        if (data) {
            setProfile(data);
            prevProfile.current = data; // Запоминаем
            toggleSound(TEST_USER_ID, data.settings_sound);
        }
    };
    fetchProfile();

    const channel = supabase.channel('settings-realtime')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${TEST_USER_ID}` }, 
        (payload) => {
            const newData = payload.new;
            const oldData = prevProfile.current;

            setProfile((prev: any) => ({ ...prev, ...newData }));
            
            // Уведомляем ТОЛЬКО если статус 2FA реально изменился
            if (oldData && newData.two_factor_status === 'enabled' && oldData.two_factor_status !== 'enabled') {
                toast.success('2FA Аутентификация активирована!');
            }
            
            prevProfile.current = newData; // Обновляем память
        })
        .subscribe();

    return () => { channel.unsubscribe(); };
  }, []);

  const handleSaveName = async () => {
    if (!profile.full_name.trim()) return toast.error('Имя не может быть пустым');
    setLoading(true);
    const { error } = await supabase.from('profiles').update({ full_name: profile.full_name }).eq('id', TEST_USER_ID);
    setLoading(false);
    if (error) toast.error('Ошибка'); else toast.success('Сохранено');
  };

  const handleRequest2FA = async () => {
      if (profile.two_factor_status === 'enabled') return;
      if (profile.two_factor_status === 'pending') return toast.info('Заявка уже на рассмотрении');
      if (confirm('Подключить 2FA?')) {
          const { error } = await supabase.from('profiles').update({ two_factor_status: 'pending' }).eq('id', TEST_USER_ID);
          if (!error) { setProfile({ ...profile, two_factor_status: 'pending' }); toast.success('Заявка отправлена'); }
      }
  };

  return (
    <div className="flex h-screen bg-[#0d1117] text-white font-sans overflow-hidden">
      <div className="hidden md:block"><Sidebar /></div>
      <MobileNav />
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-24 md:p-8">
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-black mb-6 md:mb-8 flex items-center gap-3"><Settings className="text-gray-400"/> Настройки</h1>
            <div className="bg-[#1c2028] rounded-2xl border border-[#2a2e39] p-6 mb-6">
                <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2"><User size={20}/> Личные данные</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Отображаемое имя</label>
                        <input value={profile.full_name || ''} onChange={(e) => setProfile({...profile, full_name: e.target.value})} className="w-full bg-[#12161c] border border-[#2a323d] rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none font-bold transition-all" placeholder="Ваше имя"/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email (ID)</label>
                        <input value={TEST_USER_ID} disabled className="w-full bg-[#12161c]/50 border border-[#2a323d] rounded-xl px-4 py-3 text-gray-500 font-mono text-xs cursor-not-allowed" />
                    </div>
                </div>
                <button onClick={handleSaveName} disabled={loading} className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all">{loading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Сохранить</button>
            </div>
            <div className="bg-[#1c2028] rounded-2xl border border-[#2a2e39] overflow-hidden">
                <div onClick={() => toggleSound(TEST_USER_ID, !soundEnabled)} className="p-5 border-b border-[#2a2e39] flex items-center justify-between hover:bg-[#262b34] transition-colors cursor-pointer select-none">
                    <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><Volume2 size={20}/></div><div><div className="font-bold text-sm text-white">Звуки</div><div className="text-[11px] text-gray-500">Эффекты сделок</div></div></div>
                    <div className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${soundEnabled ? 'bg-green-500' : 'bg-[#343a46]'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm ${soundEnabled ? 'right-1' : 'left-1'}`}></div></div>
                </div>
                <div onClick={handleRequest2FA} className="p-5 border-b border-[#2a2e39] flex items-center justify-between hover:bg-[#262b34] transition-colors cursor-pointer select-none">
                    <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500"><Shield size={20}/></div><div><div className="font-bold text-sm text-white">2FA Защита</div><div className="text-[11px] text-gray-500">Google Authenticator</div></div></div>
                    {profile.two_factor_status === 'enabled' ? <span className="flex items-center gap-1 text-green-500 text-[10px] font-black uppercase bg-green-500/10 px-2 py-1 rounded"><Check size={12}/> Вкл</span> : profile.two_factor_status === 'pending' ? <span className="flex items-center gap-1 text-yellow-500 text-[10px] font-black uppercase bg-yellow-500/10 px-2 py-1 rounded"><Loader2 className="animate-spin" size={12}/> Ждем</span> : <span className="flex items-center gap-1 text-gray-400 text-[10px] font-black uppercase bg-gray-500/10 px-2 py-1 rounded"><Lock size={12}/> Выкл</span>}
                </div>
                <div className="p-5 flex items-center justify-between hover:bg-[#262b34] transition-colors cursor-pointer">
                    <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500"><Globe size={20}/></div><div><div className="font-bold text-sm text-white">Язык</div><div className="text-[11px] text-gray-500">Русский</div></div></div>
                    <div className="text-xs font-bold text-gray-500 uppercase bg-[#0d1117] px-3 py-1 rounded border border-[#2a2e39]">RU</div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}