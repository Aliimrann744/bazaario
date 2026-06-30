import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import SearchBar from '../components/marketplace/SearchBar';
import CategoryGrid from '../components/marketplace/CategoryGrid';
import ListingGrid, { ListingGridSkeleton } from '../components/marketplace/ListingGrid';
import ListingCard from '../components/marketplace/ListingCard';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [fresh, setFresh] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/categories'),
      api.get('/search', { params: { featured: true, sort: 'newest', limit: 8 } }),
      api.get('/search', { params: { sort: 'newest', limit: 16 } }),
    ]).then(([c, f, n]) => {
      setCategories(c.data.items);
      setFeatured(f.data.items);
      setFresh(n.data.items);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-mesh">
        <div className="container-page relative py-12 sm:py-16 lg:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white/70 px-3 py-1 text-xs font-semibold text-brand-700 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Pakistan's Premium Marketplace
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Buy & sell <span className="bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent">almost anything</span>, locally.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted sm:text-lg">
              Cars, mobiles, property, electronics, jobs and more — from verified sellers across Pakistan.
            </p>
            <div className="mx-auto mt-8 max-w-2xl"><SearchBar size="lg" /></div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-brand-600" /> Verified sellers</span>
              <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-accent-500" /> Instant chat</span>
              <span className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-brand-600" /> Best local deals</span>
            </div>
          </motion.div>
        </div>
        {/* floating decorative orbs */}
        <div className="pointer-events-none absolute -left-16 top-10 h-40 w-40 animate-floaty rounded-full bg-brand-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-44 w-44 animate-floaty rounded-full bg-accent-300/30 blur-3xl" style={{ animationDelay: '1.5s' }} />
      </section>

      <div className="container-page space-y-12 py-10">
        {/* Categories */}
        <section>
          <SectionHead title="Browse categories" subtitle="Find exactly what you're looking for" />
          {loading ? <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-7">{Array.from({ length: 14 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
            : <CategoryGrid categories={categories} />}
        </section>

        {/* Featured */}
        {(loading || featured.length > 0) && (
          <section>
            <SectionHead title={<span className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent-500" /> Featured listings</span>} subtitle="Premium picks from top sellers" to="/search?featured=true" />
            {loading ? <ListingGridSkeleton count={4} /> : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                {featured.map((l, i) => <ListingCard key={l.publicId} listing={l} index={i} />)}
              </div>
            )}
          </section>
        )}

        {/* Promo strip */}
        <section className="overflow-hidden rounded-card bg-brand-gradient p-1">
          <div className="flex flex-col items-center justify-between gap-4 rounded-[14px] bg-brand-gradient px-6 py-8 text-white sm:flex-row sm:px-10">
            <div>
              <h3 className="font-display text-2xl font-extrabold">Have something to sell?</h3>
              <p className="mt-1 text-white/85">List it in under 3 minutes and reach buyers near you.</p>
            </div>
            <Link to="/post" className="btn bg-white text-brand-700 hover:-translate-y-0.5 hover:shadow-hover">Post your ad <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>

        {/* Fresh */}
        <section>
          <SectionHead title="Fresh listings" subtitle="The latest from across Pakistan" to="/search?sort=newest" />
          {loading ? <ListingGridSkeleton count={8} /> : <ListingGrid listings={fresh} />}
        </section>
      </div>
    </div>
  );
}

function SectionHead({ title, subtitle, to }) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <div>
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {to && <Link to={to} className="hidden items-center gap-1 text-sm font-semibold text-brand-600 hover:gap-2 sm:flex">See all <ArrowRight className="h-4 w-4" /></Link>}
    </div>
  );
}
