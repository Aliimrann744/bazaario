import { NavLink } from 'react-router-dom';
import { Home, Search, PlusCircle, Heart, MessageCircle } from 'lucide-react';

const tabs = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/post', icon: PlusCircle, label: 'Sell', primary: true },
  { to: '/favourites', icon: Heart, label: 'Saved' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
];

export default function MobileTabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur-lg sm:hidden">
      <div className="grid grid-cols-5">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end}
            className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${isActive ? 'text-brand-600' : 'text-muted'}`}>
            {t.primary ? (
              <span className="-mt-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-gradient text-white shadow-glow"><t.icon className="h-6 w-6" /></span>
            ) : (
              <t.icon className="h-5.5 w-5.5" style={{ width: 22, height: 22 }} />
            )}
            <span className={t.primary ? 'mt-0' : ''}>{t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
