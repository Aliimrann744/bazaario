import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, X, Tag, Loader2 } from 'lucide-react';
import api from '../../lib/api';

export default function SearchBar({ size = 'lg' }) {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [loc, setLoc] = useState(() => JSON.parse(localStorage.getItem('bz_loc') || 'null'));
  const [sug, setSug] = useState(null);
  const [locOpen, setLocOpen] = useState(false);
  const [locResults, setLocResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) { setSug(null); setLocOpen(false); } };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    if (!q || q.length < 2) { setSug(null); return; }
    const t = setTimeout(async () => {
      try { const { data } = await api.get('/search/suggest', { params: { q } }); setSug(data); } catch { /* ignore */ }
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  const searchLoc = async (term) => {
    setBusy(true);
    try { const { data } = await api.get('/locations/suggest', { params: { q: term } }); setLocResults(data.items); }
    finally { setBusy(false); }
  };

  const pickLoc = (l) => {
    const v = l ? { id: l.id, name: l.name } : null;
    setLoc(v); setLocOpen(false);
    if (v) localStorage.setItem('bz_loc', JSON.stringify(v)); else localStorage.removeItem('bz_loc');
  };

  const submit = (overrideQ, categoryId) => {
    const params = new URLSearchParams();
    const term = overrideQ ?? q;
    if (term) params.set('q', term);
    if (categoryId) params.set('categoryId', categoryId);
    if (loc) params.set('locationId', loc.id);
    nav(`/search?${params.toString()}`);
    setSug(null);
  };

  const tall = size === 'lg';

  return (
    <div ref={wrapRef} className="relative w-full">
      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className={`flex w-full items-stretch overflow-visible rounded-2xl bg-white shadow-glow ring-1 ring-line ${tall ? 'h-14' : 'h-11'}`}
      >
        {/* Location picker */}
        <div className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => { setLocOpen((o) => !o); if (!locResults.length) searchLoc(''); }}
            className={`flex h-full items-center gap-2 rounded-l-2xl border-r border-line px-4 text-sm font-medium text-ink hover:bg-slate-50 ${tall ? 'min-w-[160px]' : 'min-w-[130px]'}`}
          >
            <MapPin className="h-4 w-4 text-brand-600" />
            <span className="truncate">{loc?.name || 'All Pakistan'}</span>
          </button>
          {locOpen && (
            <div className="absolute left-0 top-[calc(100%+8px)] z-30 w-72 rounded-2xl border border-line bg-white p-2 shadow-hover">
              <input autoFocus className="input mb-2" placeholder="Search city or area…" onChange={(e) => searchLoc(e.target.value)} />
              <button onClick={() => pickLoc(null)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-50">
                <MapPin className="h-4 w-4 text-muted" /> All Pakistan
              </button>
              <div className="max-h-60 overflow-y-auto">
                {busy && <div className="px-3 py-2 text-sm text-muted">Searching…</div>}
                {locResults.map((l) => (
                  <button key={l.id} onClick={() => pickLoc(l)} className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-brand-50">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    <span><span className="font-medium">{l.name}</span><span className="block text-xs text-muted">{l.path}</span></span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Query input */}
        <div className="relative flex flex-1 items-center">
          <Search className="pointer-events-none absolute left-4 h-5 w-5 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search cars, mobiles, property, jobs…"
            className="h-full w-full bg-transparent pl-12 pr-10 text-sm outline-none placeholder:text-slate-400"
          />
          {q && <button type="button" onClick={() => setQ('')} className="absolute right-3 text-muted hover:text-ink"><X className="h-4 w-4" /></button>}
        </div>

        <button type="submit" className={`m-1.5 flex items-center gap-2 rounded-xl bg-brand-gradient px-5 font-semibold text-white transition hover:shadow-hover ${tall ? '' : 'px-4 text-sm'}`}>
          <Search className="h-4 w-4" /> <span className="hidden sm:inline">Search</span>
        </button>
      </form>

      {/* Suggestions */}
      {sug && (q.length >= 2) && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl border border-line bg-white shadow-hover">
          {sug.categories?.length > 0 && (
            <div className="border-b border-line p-2">
              <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted">Categories</p>
              {sug.categories.map((c) => (
                <button key={c.id} onClick={() => submit('', c.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-brand-50">
                  <Tag className="h-4 w-4 text-brand-600" /> {c.label}
                </button>
              ))}
            </div>
          )}
          {sug.queries?.length > 0 && (
            <div className="p-2">
              {sug.queries.map((t) => (
                <button key={t} onClick={() => submit(t)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50">
                  <Search className="h-4 w-4 text-muted" /> {t}
                </button>
              ))}
            </div>
          )}
          {busy && <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}
        </div>
      )}
    </div>
  );
}
