import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Heart, MessageCircle, PlusCircle, User, LogOut, LayoutList, ChevronDown, Menu } from 'lucide-react';
import SearchBar from '../marketplace/SearchBar';
import { Avatar } from '../ui/Primitives';
import { useAuth } from '../../store/auth';

function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"><path d="M5 8h14l-1.2 9.2A2 2 0 0 1 15.8 19H8.2a2 2 0 0 1-2-1.8L5 8Z"/><path d="M8.5 8a3.5 3.5 0 0 1 7 0"/></svg>
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight text-ink">Bazaar<span className="text-brand-600">io</span></span>
    </Link>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [menu, setMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-lg">
      <div className="container-page flex h-16 items-center gap-3 sm:gap-5">
        <Logo />
        <div className="hidden flex-1 md:block"><SearchBar size="sm" /></div>
        <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2 md:flex-none">
          <NavLink to="/favourites" className="hidden rounded-xl p-2.5 text-ink hover:bg-slate-100 sm:block" title="Favourites"><Heart className="h-5 w-5" /></NavLink>
          <NavLink to="/chat" className="hidden rounded-xl p-2.5 text-ink hover:bg-slate-100 sm:block" title="Chat"><MessageCircle className="h-5 w-5" /></NavLink>

          {user ? (
            <div className="relative">
              <button onClick={() => setMenu((m) => !m)} onBlur={() => setTimeout(() => setMenu(false), 150)} className="flex items-center gap-1.5 rounded-xl border border-line py-1 pl-1 pr-2 hover:border-brand-200">
                <Avatar src={user.avatarUrl} name={user.name} size={30} />
                <ChevronDown className="h-4 w-4 text-muted" />
              </button>
              {menu && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-56 overflow-hidden rounded-2xl border border-line bg-white py-1.5 shadow-hover">
                  <div className="border-b border-line px-4 py-2.5">
                    <p className="truncate font-semibold text-ink">{user.name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                  <MenuLink to="/my-listings" icon={LayoutList}>My Listings</MenuLink>
                  <MenuLink to="/favourites" icon={Heart}>Favourites</MenuLink>
                  <MenuLink to="/chat" icon={MessageCircle}>Messages</MenuLink>
                  <MenuLink to="/account" icon={User}>Account</MenuLink>
                  <button onMouseDown={() => { logout(); nav('/'); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50"><LogOut className="h-4 w-4" /> Log out</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-ghost hidden sm:inline-flex"><User className="h-4 w-4" /> Login</Link>
          )}

          <Link to="/post" className="btn-accent whitespace-nowrap !px-3 sm:!px-4">
            <PlusCircle className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} /> <span className="hidden sm:inline">Post Ad</span><span className="sm:hidden">Sell</span>
          </Link>
        </div>
      </div>
      {/* Mobile search */}
      <div className="container-page pb-3 md:hidden"><SearchBar size="sm" /></div>
    </header>
  );
}

function MenuLink({ to, icon: Icon, children }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-slate-50"><Icon className="h-4 w-4 text-muted" /> {children}</Link>
  );
}
