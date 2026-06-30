import { Link } from 'react-router-dom';
import { ShieldCheck, Smartphone, Apple } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="container-page grid grid-cols-2 gap-8 py-12 md:grid-cols-5">
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"><path d="M5 8h14l-1.2 9.2A2 2 0 0 1 15.8 19H8.2a2 2 0 0 1-2-1.8L5 8Z"/><path d="M8.5 8a3.5 3.5 0 0 1 7 0"/></svg>
            </span>
            <span className="font-display text-xl font-extrabold text-ink">Bazaario</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted">Pakistan's premium marketplace to buy and sell cars, mobiles, property, electronics and more — safely and locally.</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-brand-700">
            <ShieldCheck className="h-4 w-4" /> Verified sellers · Secure chat · Safe trade tips
          </div>
        </div>
        <FooterCol title="Marketplace" links={[['Cars', '/search?categoryId=vehicles.cars'], ['Mobiles', '/search?categoryId=mobiles.mobile_phones'], ['Property', '/search?categoryId=property_for_sale.houses'], ['Jobs', '/search?categoryId=jobs']]} />
        <FooterCol title="Company" links={[['About', '#'], ['Careers', '#'], ['Safety', '#'], ['Terms', '#']]} />
        <FooterCol title="Help" links={[['Support', '#'], ['Prohibited Items', '#'], ['Privacy', '#'], ['Contact', '#']]} />
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-sm text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Bazaario. Built as an independent marketplace implementation.</p>
          <div className="flex gap-2">
            <span className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs"><Smartphone className="h-4 w-4" /> Android</span>
            <span className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs"><Apple className="h-4 w-4" /> iOS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-bold text-ink">{title}</h4>
      <ul className="space-y-2">
        {links.map(([label, to]) => (
          <li key={label}><Link to={to} className="text-sm text-muted transition-colors hover:text-brand-600">{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
