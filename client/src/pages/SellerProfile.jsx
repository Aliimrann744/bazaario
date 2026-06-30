import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BadgeCheck, Store, Calendar, Package } from 'lucide-react';
import api from '../lib/api';
import { Avatar, EmptyState, Skeleton } from '../components/ui/Primitives';
import ListingGrid, { ListingGridSkeleton } from '../components/marketplace/ListingGrid';

export default function SellerProfile() {
  const { publicId } = useParams();
  const [data, setData] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/users/${publicId}`),
      api.get(`/users/${publicId}/listings`),
    ]).then(([u, l]) => { setData(u.data); setListings(l.data.items); }).finally(() => setLoading(false));
  }, [publicId]);

  if (loading) return <div className="container-page py-8"><Skeleton className="h-40 w-full rounded-card" /><div className="mt-6"><ListingGridSkeleton count={4} /></div></div>;
  if (!data) return <div className="container-page py-20 text-center"><h2 className="text-xl font-bold">Seller not found</h2></div>;

  const { user, stats } = data;

  return (
    <div className="container-page py-8">
      <div className="card overflow-hidden">
        <div className="h-28 bg-brand-gradient" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="rounded-full ring-4 ring-white"><Avatar src={user.avatarUrl} name={user.name} size={96} /></div>
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-extrabold text-ink">{user.businessName || user.name}</h1>
                  {user.trustTier === 'VERIFIED' && <BadgeCheck className="h-5 w-5 text-brand-600" />}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                  {user.isBusiness && <span className="flex items-center gap-1"><Store className="h-4 w-4" /> Business seller</span>}
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Joined {new Date(user.memberSince).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })}</span>
                  <span className="flex items-center gap-1"><Package className="h-4 w-4" /> {stats.activeListings} active ads</span>
                </div>
              </div>
            </div>
          </div>
          {user.bio && <p className="mt-4 max-w-2xl text-sm text-slate-600">{user.bio}</p>}
        </div>
      </div>

      <h2 className="mb-4 mt-8 font-display text-xl font-extrabold text-ink">Active listings</h2>
      {listings.length === 0 ? <EmptyState icon={Package} title="No active listings" subtitle="This seller has no active ads right now." /> : <ListingGrid listings={listings} />}
    </div>
  );
}
