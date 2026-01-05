'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, Wallet, User, Settings } from 'lucide-react';

export const MobileNav = () => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#161b22] border-t border-[#2a2e39] flex items-center justify-around z-50 px-2 pb-safe">
      <NavItem 
        icon={<BarChart2 size={20} />} 
        label="Торговля" 
        href="/trade" 
        active={isActive('/trade')} 
      />
      <NavItem 
        icon={<Wallet size={20} />} 
        label="Кошелек" 
        href="/wallet" 
        active={isActive('/wallet')} 
      />
      <NavItem 
        icon={<User size={20} />} 
        label="Профиль" 
        href="/profile" 
        active={isActive('/profile')} 
      />
      <NavItem 
        icon={<Settings size={20} />} 
        label="Меню" 
        href="/settings" 
        active={isActive('/settings')} 
      />
    </div>
  );
};

const NavItem = ({ icon, label, href, active }: any) => (
  <Link 
    href={href} 
    className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
      active ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'
    }`}
  >
    {icon}
    <span className="text-[10px] font-bold">{label}</span>
  </Link>
);