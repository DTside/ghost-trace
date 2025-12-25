'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Sidebar } from '@/components/layout/Sidebar';
import { Settings, Save, Shield, Volume2, Globe, Check, Lock, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { useTradeStore } from '@/store/useTradeStore';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const TEST_USER_ID = '5223055e-5885-40b6-9494-c482ba748050';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>({ full_name: '', email: '', two_factor_status: 'disabled' });
  const { soundEnabled, toggleSound } = useTradeStore() as any;

  useEffect(() => {
    // 1. Загружаем реальные данные профиля
    const fetchProfile = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('id', TEST_USER_ID).single();
        if (data) {
            setProfile(data);
            toggleSound(TEST_USER_ID, data.settings_sound); // Синхронизируем звук
        }
    };
    fetchProfile();

    // 2. Слушаем изменения (если админ подтвердит 2FA, тут обновится само)
    const channel = supabase.channel('settings-realtime')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${TEST_USER_ID}` }, 
        (payload) => {
            setProfile((prev: any) => ({ ...prev, ...payload.new }));
            if (payload.new.two_factor_status === 'enabled') toast.success('2FA Аутентификация активирована!');
        })
        .subscribe();

    return () => { channel.unsubscribe(); };
  }, []);

  // Сохранение имени в БД
  const handleSaveName = async () => {
    if (!profile.full_name.trim()) return toast.error('Имя не может быть пустым');
    
    setLoading(true);
    const { error } = await supabase.from('profiles').update({ full_name: profile.full_name }).eq('id', TEST_USER_ID);
    setLoading(false);
    
    if (error) toast.error('Ошибка сохранения');
    else toast.success('Имя профиля обновлено');
  };

  // Запрос на 2FA
  const handleRequest2FA = async () => {
      if (profile.two_factor_status === 'enabled') return;
      if (profile.two_factor_status === 'pending') return toast.info('Заявка уже на рассмотрении');

      if (confirm('Отправить заявку на подключение 2FA? Администратор проверит ваш аккаунт.')) {
          const { error } = await supabase.from('profiles').update({ two_factor_status: 'pending' }).eq('id', TEST_USER_ID);
          if (!error) {
              setProfile({ ...profile, two_factor_status: 'pending' });
              toast.success('Заявка отправлена администратору');
          }
      }
  };

  return (
    <div className="flex h-screen bg-[#0d1117] text-white font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-black mb-8 flex items-center gap-3"><Settings className="text-gray-400"/> Настройки</h1>

            {/* БЛОК ПРОФИЛЯ */}
            <div className="bg-[#1c2028] rounded-2xl border border-[#2a2e39] p-6 mb-6">
                <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2"><User size={20}/> Личные данные</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Отображаемое имя</label>
                        <input 
                            value={profile.full_name || ''} 
                            onChange={(e) => setProfile({...profile, full_name: e.target.value})} 
                            className="w-full bg-[#12161c] border border-[#2a323d] rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none font-bold transition-all placeholder:text-gray-700" 
                            placeholder="Ваше имя"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email (ID)</label>
                        <input 
                            value={TEST_USER_ID} 
                            disabled 
                            className="w-full bg-[#12161c]/50 border border-[#2a323d] rounded-xl px-4 py-3 text-gray-500 font-mono text-xs cursor-not-allowed" 
                        />
                    </div>
                </div>
                <button onClick={handleSaveName} disabled={loading} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold text-xs uppercase flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-900/20">
                    {loading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Сохранить изменения
                </button>
            </div>

            {/* БЛОК БЕЗОПАСНОСТИ И НАСТРОЕК */}
            <div className="bg-[#1c2028] rounded-2xl border border-[#2a2e39] overflow-hidden">
                
                {/* Звук */}
                <div onClick={() => toggleSound(TEST_USER_ID, !soundEnabled)} className="p-5 border-b border-[#2a2e39] flex items-center justify-between hover:bg-[#262b34] transition-colors cursor-pointer select-none group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform"><Volume2 size={20}/></div>
                        <div><div className="font-bold text-sm text-white">Звуковые эффекты</div><div className="text-[11px] text-gray-500">Звуки при открытии и закрытии сделок</div></div>
                    </div>
                    <div className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${soundEnabled ? 'bg-green-500' : 'bg-[#343a46]'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm ${soundEnabled ? 'right-1' : 'left-1'}`}></div>
                    </div>
                </div>

                {/* 2FA */}
                <div onClick={handleRequest2FA} className="p-5 border-b border-[#2a2e39] flex items-center justify-between hover:bg-[#262b34] transition-colors cursor-pointer select-none group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform"><Shield size={20}/></div>
                        <div><div className="font-bold text-sm text-white">Двухфакторная защита (2FA)</div><div className="text-[11px] text-gray-500">Дополнительный уровень безопасности</div></div>
                    </div>
                    
                    {profile.two_factor_status === 'enabled' ? (
                        <span className="flex items-center gap-1.5 text-green-500 text-[10px] font-black uppercase bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20"><Check size={12}/> Активно</span>
                    ) : profile.two_factor_status === 'pending' ? (
                        <span className="flex items-center gap-1.5 text-yellow-500 text-[10px] font-black uppercase bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20"><Loader2 className="animate-spin" size={12}/> Ожидает</span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-gray-400 text-[10px] font-black uppercase bg-gray-500/10 px-3 py-1.5 rounded-lg border border-gray-500/20 group-hover:bg-gray-500/20 transition-colors"><Lock size={12}/> Подключить</span>
                    )}
                </div>

                {/* Язык */}
                <div className="p-5 flex items-center justify-between hover:bg-[#262b34] transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform"><Globe size={20}/></div>
                        <div><div className="font-bold text-sm text-white">Язык интерфейса</div><div className="text-[11px] text-gray-500">Русский</div></div>
                    </div>
                    <div className="text-xs font-bold text-gray-500 uppercase bg-[#0d1117] px-3 py-1 rounded border border-[#2a2e39]">RU</div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}