'use client';
import { BarChart2, Wallet, User, Settings, HelpCircle, LogOut, Send } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// --- Инициализация Supabase (упрощенная для Sidebar) ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isConfigured = SUPABASE_URL && SUPABASE_KEY && SUPABASE_URL.startsWith('http');
const supabase = isConfigured ? createClient(SUPABASE_URL!, SUPABASE_KEY!) : null;

export const Sidebar = () => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const TEST_USER_ID = '5223055e-5885-40b6-9494-c482ba748050';
  const prevState = useRef<any>(null);

  useEffect(() => {
    if (!supabase) return;
    
    const fetchInitial = async () => {
        const { data } = await supabase!.from('profiles').select('*').eq('id', TEST_USER_ID).single();
        if (data) prevState.current = data;
    };
    fetchInitial();

    const channel = supabase.channel('sidebar-global')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${TEST_USER_ID}` }, 
      (payload) => {
        const newData = payload.new;
        const oldData = prevState.current; 

        if (!oldData) { prevState.current = newData; return; }

        if (newData.verification_status !== oldData.verification_status) {
             if (newData.verification_status === 'verified' && newData.verification_level === 2) toast.success("Документы одобрены! (Уровень 2)");
             if (newData.verification_status === 'verified_full' && newData.verification_level === 3) toast.success("Адрес подтвержден! (Уровень 3)");
             if (newData.verification_status === 'rejected') toast.error("Верификация отклонена.");
        }

        if (newData.balance_real > oldData.balance_real) {
             const diff = newData.balance_real - oldData.balance_real;
             // toast.success(`Баланс пополнен на $${diff.toLocaleString()}!`); // Можно включить, если нужно
        }
        prevState.current = newData;
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, []);

  return (
    // ДОБАВЛЕНО: hidden md:flex (Скрывает на мобильных, показывает на десктопе)
    <aside className="hidden md:flex w-[70px] h-full bg-[#10161e] border-r border-[#19202a] flex-col items-center py-6 z-50 shrink-0">
      <div className="mb-8">
        <div className="w-10 h-10 border border-blue-500/30 bg-blue-500/10 rounded-xl flex items-center justify-center font-black text-blue-500 text-xl shadow-[0_0_15px_rgba(59,130,246,0.3)]">G</div>
      </div>

      <nav className="flex-1 flex flex-col gap-4 w-full px-3">
        <NavItem icon={<BarChart2 size={24} />} active={isActive('/trade')} href="/trade" tooltip="Торговля" />
        <NavItem icon={<User size={24} />} active={isActive('/profile')} href="/profile" tooltip="Профиль" />
        <NavItem icon={<Wallet size={24} />} active={isActive('/wallet')} href="/wallet" tooltip="Кошелек" />
        <NavItem icon={<Settings size={24} />} active={isActive('/settings')} href="/settings" tooltip="Настройки" />
      </nav>

      <div className="flex flex-col gap-4 w-full px-3 mb-4">
        <a href="https://t.me/ghosttrace" target="_blank" rel="noopener noreferrer" className="w-full aspect-square flex items-center justify-center rounded-xl text-blue-400 hover:text-white hover:bg-blue-600 transition-all relative group">
            <Send size={24} className="-ml-0.5 mt-0.5" />
        </a>
        <NavItem icon={<HelpCircle size={24} />} active={isActive('/help')} href="/help" tooltip="Помощь" />
        <button className="w-full aspect-square flex items-center justify-center text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"><LogOut size={24} /></button>
      </div>
    </aside>
  );
};

const NavItem = ({ icon, active, href }: any) => (
  <Link href={href} className={`w-full aspect-square flex items-center justify-center rounded-xl transition-all relative group ${active ? 'bg-[#2a323d] text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-[#1c242f]'}`}>
    {icon}
  </Link>
);