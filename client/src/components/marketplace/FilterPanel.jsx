import { useState } from 'react';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';

/**
 * Renders search filters dynamically from the `facets` returned by GET /search.
 * No per-category filter logic is hard-coded — facets are derived server-side
 * from schema `facetable` fields.
 */
export default function FilterPanel({ facets = {}, params, onChange, onClear }) {
  const [minP, setMinP] = useState(params.minPrice || '');
  const [maxP, setMaxP] = useState(params.maxPrice || '');

  const setMulti = (key, value) => {
    const cur = (params[key] ? String(params[key]).split(',') : []);
    const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
    onChange({ [key]: next.length ? next.join(',') : undefined });
  };
  const isOn = (key, value) => (params[key] ? String(params[key]).split(',').includes(value) : false);

  const applyPrice = () => onChange({ minPrice: minP || undefined, maxPrice: maxP || undefined });

  const activeCount = Object.keys(params).filter((k) => ['minPrice', 'maxPrice', 'condition', 'priceType', 'featured'].includes(k) || facets[k]).filter((k) => params[k]).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-bold text-ink"><SlidersHorizontal className="h-4.5 w-4.5 text-brand-600" style={{ width: 18, height: 18 }} /> Filters</h3>
        {activeCount > 0 && <button onClick={onClear} className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:underline"><X className="h-3.5 w-3.5" /> Clear</button>}
      </div>

      {/* Price */}
      <Section title="Price (Rs)">
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min" value={minP} onChange={(e) => setMinP(e.target.value)} className="input py-2 text-sm" />
          <span className="text-muted">–</span>
          <input type="number" placeholder="Max" value={maxP} onChange={(e) => setMaxP(e.target.value)} className="input py-2 text-sm" />
        </div>
        <button onClick={applyPrice} className="btn-outline mt-2 w-full py-2 text-sm">Apply price</button>
      </Section>

      {/* Featured */}
      <Section title="Promotion">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" checked={params.featured === 'true'} onChange={(e) => onChange({ featured: e.target.checked ? 'true' : undefined })} className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500" />
          Featured only
        </label>
      </Section>

      {/* Dynamic facets */}
      {Object.entries(facets).map(([key, facet]) => (
        <Section key={key} title={facet.label} collapsible defaultOpen={['condition', 'make_id', 'brand_id'].includes(key)}>
          <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
            {facet.values.map((v) => (
              <label key={v.value} className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-1.5 py-1 text-sm hover:bg-slate-50">
                <span className="flex items-center gap-2.5">
                  <input type="checkbox" checked={isOn(key, v.value)} onChange={() => setMulti(key, v.value)} className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500" />
                  <span className="text-ink">{v.label}</span>
                </span>
                <span className="text-xs text-muted">{v.count}</span>
              </label>
            ))}
          </div>
        </Section>
      ))}
    </div>
  );
}

function Section({ title, children, collapsible = false, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-line pt-4 first:border-t-0 first:pt-0">
      <button type="button" onClick={() => collapsible && setOpen((o) => !o)} className={`mb-2.5 flex w-full items-center justify-between ${collapsible ? '' : 'cursor-default'}`}>
        <span className="text-sm font-bold text-ink">{title}</span>
        {collapsible && <ChevronDown className={`h-4 w-4 text-muted transition-transform ${open ? '' : '-rotate-90'}`} />}
      </button>
      {open && children}
    </div>
  );
}
