import { Link } from 'react-router-dom';
import { BadgeCheck, Store, Clock, ChevronRight } from 'lucide-react';
import { Avatar } from '../ui/Primitives';
import { timeAgo } from '../../lib/format';

export default function SellerCard({ seller, stats }) {
  if (!seller) return null;
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <Avatar src={seller.avatarUrl} name={seller.name} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="truncate font-bold text-ink">{seller.businessName || seller.name}</h4>
            {seller.trustTier === 'VERIFIED' && <BadgeCheck className="h-4.5 w-4.5 shrink-0 text-brand-600" style={{ width: 18, height: 18 }} />}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            {seller.isBusiness && <span className="flex items-center gap-1"><Store className="h-3.5 w-3.5" /> Business</span>}
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Member since {new Date(seller.memberSince).getFullYear()}</span>
          </div>
        </div>
      </div>

      {seller.bio && <p className="mt-3 line-clamp-2 text-sm text-muted">{seller.bio}</p>}

      <div className="mt-4 flex items-center gap-2">
        {seller.isPhoneVerified && <span className="badge-verified"><BadgeCheck className="h-3.5 w-3.5" /> Phone verified</span>}
        {stats?.activeListings != null && <span className="badge bg-slate-100 text-slate-600">{stats.activeListings} active ads</span>}
      </div>

      <Link to={`/seller/${seller.publicId}`} className="btn-outline mt-4 w-full">
        View profile <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
