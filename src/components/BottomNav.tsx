import React from 'react';
import { CheckSquare, Settings, BarChart2, ShoppingBag } from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '@nanostores/react';
import { t } from '../stores/i18n';

const BottomNav = ({ currentPath }: { currentPath: string }) => {
  const dict = useStore(t);
  
  const navItems = [
    { href: '/', label: dict.nav_goals, icon: CheckSquare },
    { href: '/progress', label: dict.nav_progress, icon: BarChart2 },
    { href: '/shop', label: dict.nav_shop || dict.config_tab_shop, icon: ShoppingBag },
    { href: '/config', label: dict.nav_config, icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 safe-area-bottom z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-20 px-4">
        {navItems.map((item) => {
          const isActive = currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <a
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center justify-center w-20 h-14 rounded-xl transition-all duration-200 active:scale-95",
                isActive 
                  ? "bg-blue-50 border-2 border-blue-200 text-blue-600 shadow-[0_4px_0_#BFDBFE] mb-1" 
                  : "text-gray-400 hover:bg-gray-50 border-2 border-transparent hover:border-gray-100"
              )}
              title={item.label}
            >
              <Icon size={28} strokeWidth={isActive ? 3 : 2.5} />
            </a>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;