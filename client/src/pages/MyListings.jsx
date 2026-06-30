import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LayoutList, MoreVertical, CheckCircle2, RefreshCw, Power, PlusCircle } from 'lucide-react';
import api, { apiError } from '../lib/api';
import { priceLabel, timeAgo } from '../lib/format';
import { EmptyState, Skeleton } from '../components/ui/Primitives';

const TABS = [
  { key: '', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'PENDING_REVIEW', label: 'Pending' },
  { key: 'SOLD', label: 'Sold' },
  { key: 'EXPIRED', label: 'Expired' },
  { key: 'DEACTIVATED', label: 'Inactive' },
];

const STATE_STYLES = {
  ACTIVE: 'bg-emerald-50 text-emerald-700', PENDING_REVIEW: 'bg-amber-50 text-amber-700',
  SOLD: 'bg-slate-100 text-slate-600', EXPIRED: 'bg-rose-50 text-rose-600',
  DEACTIVATED: 'bg-slate-100 text-slate-500', REJECTED: 'bg-rose-50 text-rose-600',
};

export default function MyListings() {
  const [tab, setTab] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => { setLoading(true); api.get('/me/listings', { params: tab ? { state: tab } : {} }).then(({ data }) => setItems(data.items)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, [tab]);

  const act = async (publicId, action) => {
    try { await api.post(`/listings/${publicId}/${action}`); toast.success('Updated'); load(); }
    catch (e) { toast.error(apiError(e)); }
  };

  return (
    <div className="container-page py-8">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">My listings</h1><p className="mt-1 text-muted">Manage everything you've posted.</p></div>
        <Link to="/post" className="btn-accent"><PlusCircle className="h-4 w-4" /> Post ad</Link>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => <button key={t.key} onClick={() => setTab(t.key)} className={`chip whitespace-nowrap ${tab === t.key ? 'chip-active' : ''}`}>{t.label}</button>)}
      </div>

      <div className="mt-5 space-y-3">
        {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-card" />)
          : items.length === 0 ? <EmptyState icon={LayoutList} title="Nothing here yet" subtitle="Post your first ad to start selling." action={<Link to="/post" className="btn-primary">Post an ad</Link>} />
            : items.map((l) => (
              <div key={l.publicId} className="card flex flex-col gap-4 p-3.5 sm:flex-row sm:items-center">
                <Link to={`/listing/${l.publicId}`} className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {l.thumbnail ? <img src={l.thumbnail} alt="" className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`badge ${STATE_STYLES[l.state] || 'bg-slate-100 text-slate-600'}`}>{l.state.replace('_', ' ')}</span>
                      {l.isFeatured && <span className="badge-featured">Featured</span>}
                    </div>
                    <h3 className="mt-1 truncate font-semibold text-ink">{l.title}</h3>
                    <p className="text-sm font-bold text-brand-700">{priceLabel(l)}</p>
                    <p className="mt-0.5 text-xs text-muted">{l.viewCount} views · {l.favouriteCount} saves · {timeAgo(l.publishedAt || l.createdAt)}</p>
                  </div>
                </Link>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {l.state === 'ACTIVE' && <button onClick={() => act(l.publicId, 'mark-sold')} className="btn-outline py-2 text-xs"><CheckCircle2 className="h-3.5 w-3.5" /> Mark sold</button>}
                  {(l.state === 'EXPIRED' || l.state === 'DEACTIVATED') && <button onClick={() => act(l.publicId, 'renew')} className="btn-outline py-2 text-xs"><RefreshCw className="h-3.5 w-3.5" /> Renew</button>}
                  {l.state === 'ACTIVE' && <button onClick={() => act(l.publicId, 'deactivate')} className="btn-outline py-2 text-xs"><Power className="h-3.5 w-3.5" /> Deactivate</button>}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
