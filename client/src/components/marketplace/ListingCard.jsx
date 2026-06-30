import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MapPin, Sparkles, ImageOff } from 'lucide-react';
import { useState } from 'react';
import { priceLabel, timeAgo } from '../../lib/format';
import { useFavourites } from '../../store/favourites';

export default function ListingCard({ listing, index = 0 }) {
  const { isFav, toggle } = useFavourites();
  const [imgOk, setImgOk] = useState(true);
  const fav = isFav(listing.publicId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.3) }}
      whileHover={{ y: -6 }}
      className="group relative"
    >
      <Link to={`/listing/${listing.publicId}`} className="block">
        <div className="card overflow-hidden transition-shadow duration-300 group-hover:shadow-hover">
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
            {listing.thumbnail && imgOk ? (
              <img
                src={listing.thumbnail}
                alt={listing.title}
                loading="lazy"
                onError={() => setImgOk(false)}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-300"><ImageOff className="h-10 w-10" /></div>
            )}
            {listing.isFeatured && (
              <span className="badge-featured absolute left-2.5 top-2.5">
                <Sparkles className="h-3 w-3" /> Featured
              </span>
            )}
            <button
              onClick={(e) => { e.preventDefault(); toggle(listing.publicId); }}
              aria-label="Save"
              className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition hover:scale-110 hover:text-rose-500"
            >
              <Heart className={`h-4.5 w-4.5 ${fav ? 'fill-rose-500 text-rose-500' : ''}`} style={{ width: 18, height: 18 }} />
            </button>
          </div>

          <div className="p-3.5">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-lg font-extrabold tracking-tight text-brand-700">{priceLabel(listing)}</p>
              {listing.condition && (
                <span className="badge bg-slate-100 capitalize text-slate-600">{String(listing.condition).replace('_', ' ')}</span>
              )}
            </div>
            <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-ink">{listing.title}</h3>
            <div className="mt-2.5 flex items-center justify-between text-xs text-muted">
              <span className="flex items-center gap-1 truncate"><MapPin className="h-3.5 w-3.5 shrink-0" />{listing.city || '—'}</span>
              <span className="shrink-0">{timeAgo(listing.publishedAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
