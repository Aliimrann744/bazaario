import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import api from '../lib/api';
import ListingGrid, { ListingGridSkeleton } from '../components/marketplace/ListingGrid';
import { EmptyState } from '../components/ui/Primitives';
import { useFavourites } from '../store/favourites';

export default function Favourites() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const ids = useFavourites((s) => s.ids);

  const load = () => { setLoading(true); api.get('/favourites').then(({ data }) => setItems(data.items)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  // Reflect un-favouriting done elsewhere
  useEffect(() => { setItems((prev) => prev.filter((i) => ids.has(i.publicId))); }, [ids]);

  return (
    <div className="container-page py-8">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">Your favourites</h1>
      <p className="mt-1 text-muted">Listings you've saved for later.</p>
      <div className="mt-6">
        {loading ? <ListingGridSkeleton count={8} />
          : items.length === 0 ? <EmptyState icon={Heart} title="No favourites yet" subtitle="Tap the heart on any listing to save it here." action={<Link to="/search" className="btn-primary">Browse listings</Link>} />
            : <ListingGrid listings={items} />}
      </div>
    </div>
  );
}
