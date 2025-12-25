'use client';
import { Home, BarChart2, Wallet, User, Settings, HelpCircle, LogOut, Send } from 'lucide-react'; // Добавил Send
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export const Sidebar = () => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const TEST_USER_ID = '5223055e-5885-40b6-9494-c482ba748050';

  useEffect(() => {
    const channel = supabase.channel('profile-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${TEST_USER_ID}` }, 
      (payload) => {
        const { verification_status, verification_level } = payload.new;
        if (verification_status === 'verified' && verification_level === 2) toast.success("Документы одобрены! (Уровень 2)");
        if (verification_status === 'verified_full' && verification_level === 3) toast.success("Адрес подтвержден! (Уровень 3)");
        if (verification_status === 'rejected') toast.error("Верификация отклонена");
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, []);

  return (
    <aside className="w-[70px] h-full bg-[#10161e] border-r border-[#19202a] flex flex-col items-center py-6 z-50 shrink-0">
      <div className="mb-8">
        {/* ЛОГОТИП */}
        <div className="w-10 h-10 border border-blue-500/30 bg-blue-500/10 rounded-xl flex items-center justify-center font-black text-blue-500 text-xl shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            G
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-4 w-full px-3">
        <NavItem icon={<BarChart2 size={24} />} active={isActive('/trade')} href="/trade" tooltip="Торговля" />
        <NavItem icon={<User size={24} />} active={isActive('/profile')} href="/profile" tooltip="Профиль" />
        <NavItem icon={<Wallet size={24} />} active={isActive('/wallet')} href="/wallet" tooltip="Кошелек" />
        <NavItem icon={<Settings size={24} />} active={isActive('/settings')} href="/settings" tooltip="Настройки" />
      </nav>

      <div className="flex flex-col gap-4 w-full px-3 mb-4">
        
        {/* КНОПКА TELEGRAM */}
        <a 
            href="https://t.me/ghosttrace" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full aspect-square flex items-center justify-center rounded-xl text-blue-400 hover:text-white hover:bg-blue-600 transition-all relative group"
        >
            <Send size={24} className="-ml-0.5 mt-0.5" /> {/* Небольшое смещение для визуального центра */}
            <div className="absolute left-full ml-4 bg-[#2a323d] text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-[#3e4552] z-50">
                Telegram канал
            </div>
        </a>

        <NavItem icon={<HelpCircle size={24} />} active={isActive('/help')} href="/help" tooltip="Помощь" />
        
        <button className="w-full aspect-square flex items-center justify-center text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
            <LogOut size={24} />
        </button>
      </div>
    </aside>
  );
};

const NavItem = ({ icon, active, href, tooltip }: any) => (
  <Link href={href} className={`w-full aspect-square flex items-center justify-center rounded-xl transition-all relative group ${active ? 'bg-[#2a323d] text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-[#1c242f]'}`}>
    {icon}
    <div className="absolute left-full ml-4 bg-[#2a323d] text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-[#3e4552] z-50">
        {tooltip}
    </div>
  </Link>
);