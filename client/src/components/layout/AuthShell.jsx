import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Users, Sparkles } from 'lucide-react';

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="container-page grid min-h-[calc(100vh-4rem)] items-center gap-8 py-10 lg:grid-cols-2">
      {/* Brand panel */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative hidden overflow-hidden rounded-3xl bg-brand-gradient p-10 text-white lg:block">
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"><path d="M5 8h14l-1.2 9.2A2 2 0 0 1 15.8 19H8.2a2 2 0 0 1-2-1.8L5 8Z"/><path d="M8.5 8a3.5 3.5 0 0 1 7 0"/></svg>
            </span>
            <span className="font-display text-2xl font-extrabold">Bazaario</span>
          </Link>
          <h2 className="mt-12 font-display text-4xl font-extrabold leading-tight">Pakistan's premium<br />local marketplace.</h2>
          <p className="mt-3 max-w-sm text-white/85">Join thousands of buyers and sellers trading safely across the country.</p>
          <ul className="mt-10 space-y-4">
            {[[ShieldCheck, 'Verified sellers & secure chat'], [Zap, 'Post an ad in under 3 minutes'], [Users, 'Reach buyers near you']].map(([Icon, t]) => (
              <li key={t} className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15"><Icon className="h-5 w-5" /></span><span className="font-medium">{t}</span></li>
            ))}
          </ul>
        </div>
        <div className="absolute -bottom-16 -right-10 h-56 w-56 animate-floaty rounded-full bg-white/10 blur-2xl" />
        <Sparkles className="absolute right-10 top-10 h-8 w-8 text-white/30" />
      </motion.div>

      {/* Form panel */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-md">
        <div className="card p-7 sm:p-8">
          <h1 className="font-display text-2xl font-extrabold text-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </motion.div>
    </div>
  );
}
