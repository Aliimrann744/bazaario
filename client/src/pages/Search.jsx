import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, ChevronRight, Frown, ArrowUpDown } from 'lucide-react';
import api from '../lib/api';
import ListingGrid, { ListingGridSkeleton } from '../components/marketplace/ListingGrid';
import FilterPanel from '../components/marketplace/FilterPanel';
import Modal from '../components/ui/Modal';
import { EmptyState } from '../components/ui/Primitives';

const SORTS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function Search() {
  const [sp, setSp] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const params = useMemo(() => Object.fromEntries(sp.entries()), [sp]);
  const paramKey = sp.toString();

  // Fetch category label for breadcrumb context
  useEffect(() => {
    if (params.categoryId) api.get(`/categories/${params.categoryId}`).then(({ data }) => setCategory(data.category)).catch(() => setCategory(null));
    else setCategory(null);
  }, [params.categoryId]);

  // Main search
  useEffect(() => {
    setLoading(true);
    api.get('/search', { params: { ...params } })
      .then(({ data }) => { setData(data); setItems(data.items); })
      .finally(() => setLoading(false));
  }, [paramKey]); // eslint-disable-line

  const update = useCallback((patch) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => { if (v == null || v === '') next.delete(k); else next.set(k, v); });
    next.delete('cursor');
    setSp(next, { replace: false });
  }, [sp, setSp]);

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (params.q) next.set('q', params.q);
    if (params.categoryId) next.set('categoryId', params.categoryId);
    if (params.locationId) next.set('locationId', params.locationId);
    setSp(next);
  };

  const loadMore = async () => {
    if (!data?.nextCursor) return;
    setLoadingMore(true);
    try {
      const { data: more } = await api.get('/search', { params: { ...params, cursor: data.nextCursor } });
      setItems((prev) => [...prev, ...more.items]);
      setData((d) => ({ ...d, nextCursor: more.nextCursor }));
    } finally { setLoadingMore(false); }
  };

  const facets = data?.facets || {};

  return (
    <div className="container-page py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="h-4 w-4" />
        {category ? <span className="font-medium text-ink">{category.label}</span> : <span className="font-medium text-ink">{params.q ? `“${params.q}”` : 'All listings'}</span>}
      </nav>

      <div className="flex items-start gap-6">
        {/* Desktop sidebar */}
        <aside className="sticky top-24 hidden w-64 shrink-0 lg:block">
          <div className="card p-5">
            <FilterPanel facets={facets} params={params} onChange={update} onClear={clearFilters} />
          </div>
        </aside>

        {/* Results */}
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {loading ? 'Searching…' : <><span className="font-bold text-ink">{data?.total ?? 0}</span> result{(data?.total ?? 0) === 1 ? '' : 's'}{category ? ` in ${category.label}` : ''}</>}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setSheetOpen(true)} className="btn-outline py-2 lg:hidden"><SlidersHorizontal className="h-4 w-4" /> Filters</button>
              <div className="relative">
                <ArrowUpDown className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted" />
                <select value={params.sort || 'relevance'} onChange={(e) => update({ sort: e.target.value })} className="input appearance-none py-2 pl-9 pr-8 text-sm font-medium">
                  {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {loading ? <ListingGridSkeleton count={9} />
            : items.length === 0 ? (
              <EmptyState icon={Frown} title="No listings found" subtitle="Try removing some filters or searching a different term." action={<button onClick={clearFilters} className="btn-primary">Clear filters</button>} />
            ) : (
              <>
                <ListingGrid listings={items} />
                {data?.nextCursor && (
                  <div className="mt-8 flex justify-center">
                    <button onClick={loadMore} disabled={loadingMore} className="btn-outline px-8">{loadingMore ? 'Loading…' : 'Load more'}</button>
                  </div>
                )}
              </>
            )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <Modal open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filters" maxWidth="max-w-md">
        <FilterPanel facets={facets} params={params} onChange={(p) => update(p)} onClear={clearFilters} />
        <button onClick={() => setSheetOpen(false)} className="btn-primary mt-5 w-full">Show {data?.total ?? 0} results</button>
      </Modal>
    </div>
  );
}
