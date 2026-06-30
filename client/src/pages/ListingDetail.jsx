import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Heart, Share2, Flag, MessageCircle, MapPin, Eye, Clock, ShieldAlert,
  ChevronRight, Tag, Sparkles, BadgeCheck, Send,
} from 'lucide-react';
import api, { apiError } from '../lib/api';
import { priceLabel, timeAgo } from '../lib/format';
import { useAuth } from '../store/auth';
import { useFavourites } from '../store/favourites';
import Gallery from '../components/marketplace/Gallery';
import SellerCard from '../components/marketplace/SellerCard';
import ListingCard from '../components/marketplace/ListingCard';
import Modal from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Primitives';

const REPORT_REASONS = ['Fraud or scam', 'Prohibited item', 'Duplicate listing', 'Wrong category', 'Offensive content', 'Other'];

export default function ListingDetail() {
  const { publicId } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const { isFav, toggle } = useFavourites();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/listings/${publicId}`).then(({ data }) => setListing(data.listing)).catch(() => setListing(null)).finally(() => setLoading(false));
  }, [publicId]);

  const startChat = async (template) => {
    if (!user) { nav('/login', { state: { from: `/listing/${publicId}` } }); return; }
    setContacting(true);
    try {
      const { data } = await api.post('/conversations', { listingPublicId: publicId });
      if (template) await api.post(`/conversations/${data.conversation.id}/messages`, { body: template });
      nav(`/chat/${data.conversation.id}`);
    } catch (e) { toast.error(apiError(e)); } finally { setContacting(false); }
  };

  const share = async () => {
    const url = window.location.href;
    try { if (navigator.share) await navigator.share({ title: listing.title, url }); else { await navigator.clipboard.writeText(url); toast.success('Link copied'); } }
    catch { /* cancelled */ }
  };

  const submitReport = async () => {
    if (!user) { nav('/login'); return; }
    if (!reason) { toast.error('Select a reason'); return; }
    try {
      await api.post('/reports', { targetType: 'listing', targetId: listing.publicId, reason, detail });
      toast.success('Report submitted. Thank you.');
      setReportOpen(false); setReason(''); setDetail('');
    } catch (e) { toast.error(apiError(e)); }
  };

  if (loading) return <DetailSkeleton />;
  if (!listing) return <div className="container-page py-20 text-center"><h2 className="text-xl font-bold">Listing not found</h2><Link to="/" className="btn-primary mt-4">Back home</Link></div>;

  const fav = isFav(listing.publicId);

  return (
    <div className="container-page py-6">
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-muted">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="h-4 w-4" />
        {listing.category && <Link to={`/search?categoryId=${listing.category.id}`} className="hover:text-brand-600">{listing.category.label}</Link>}
        <ChevronRight className="h-4 w-4" />
        <span className="truncate font-medium text-ink">{listing.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left */}
        <div className="space-y-6">
          <Gallery media={listing.media} title={listing.title} />

          {/* Title + price */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-3xl font-extrabold tracking-tight text-brand-700">{priceLabel(listing)}</span>
                  {listing.isFeatured && <span className="badge-featured"><Sparkles className="h-3 w-3" /> Featured</span>}
                </div>
                <h1 className="mt-2 text-xl font-bold text-ink sm:text-2xl">{listing.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {listing.location?.name}</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {timeAgo(listing.publishedAt)}</span>
                  <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {listing.viewCount} views</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggle(listing.publicId)} className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${fav ? 'border-rose-200 bg-rose-50 text-rose-500' : 'border-line text-ink hover:border-brand-200'}`}><Heart className={`h-5 w-5 ${fav ? 'fill-rose-500' : ''}`} /></button>
                <button onClick={share} className="flex h-11 w-11 items-center justify-center rounded-xl border border-line text-ink hover:border-brand-200"><Share2 className="h-5 w-5" /></button>
              </div>
            </div>

            <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-muted">
              <Tag className="h-3.5 w-3.5" /> Ad ID: {listing.publicId}
            </span>
          </motion.div>

          {/* Attributes */}
          {listing.attributesDisplay?.length > 0 && (
            <div className="card p-5 sm:p-6">
              <h2 className="mb-4 font-display text-lg font-bold text-ink">Details</h2>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                {listing.attributesDisplay.map((a) => (
                  <div key={a.key} className="border-b border-line pb-2.5">
                    <dt className="text-xs text-muted">{a.label}</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-ink">{a.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Description */}
          <div className="card p-5 sm:p-6">
            <h2 className="mb-3 font-display text-lg font-bold text-ink">Description</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{listing.description}</p>
            <button onClick={() => setReportOpen(true)} className="mt-5 flex items-center gap-1.5 text-sm font-medium text-muted hover:text-rose-500"><Flag className="h-4 w-4" /> Report this ad</button>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {/* Contact CTA */}
          <div className="card p-5">
            <p className="text-sm font-semibold text-ink">Interested? Contact the seller</p>
            <button onClick={() => startChat(`Hi, is this still available? — ${listing.title}`)} disabled={contacting} className="btn-primary mt-3 w-full">
              <MessageCircle className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} /> {contacting ? 'Starting…' : 'Chat with seller'}
            </button>
            <button onClick={() => startChat(`Hi, I'd like to make an offer for "${listing.title}".`)} className="btn-outline mt-2 w-full"><Send className="h-4 w-4" /> Make an offer</button>
          </div>

          <SellerCard seller={listing.seller} stats={{ activeListings: undefined }} />

          {/* Safety */}
          <div className="rounded-card border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-amber-800"><ShieldAlert className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} /> Safety tips</div>
            <ul className="mt-2 space-y-1 text-xs leading-relaxed text-amber-800/90">
              <li>• Meet in a public place &amp; inspect the item before paying.</li>
              <li>• Never pay in advance, including for delivery.</li>
              <li>• Keep all conversations inside Bazaario chat.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Similar */}
      {listing.similar?.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 font-display text-2xl font-extrabold tracking-tight text-ink">Similar listings</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {listing.similar.slice(0, 8).map((l, i) => <ListingCard key={l.publicId} listing={l} index={i} />)}
          </div>
        </section>
      )}

      {/* Report modal */}
      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title="Report this ad">
        <div className="space-y-2">
          {REPORT_REASONS.map((r) => (
            <button key={r} onClick={() => setReason(r)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm ${reason === r ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line'}`}>
              {r} {reason === r && <BadgeCheck className="h-4 w-4" />}
            </button>
          ))}
        </div>
        <textarea value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Add details (optional)" className="input mt-3 min-h-[80px]" />
        <button onClick={submitReport} className="btn-primary mt-4 w-full">Submit report</button>
      </Modal>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="container-page grid gap-6 py-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Skeleton className="aspect-[16/10] w-full rounded-card" />
        <Skeleton className="h-40 w-full rounded-card" />
        <Skeleton className="h-48 w-full rounded-card" />
      </div>
      <div className="space-y-4"><Skeleton className="h-36 w-full rounded-card" /><Skeleton className="h-44 w-full rounded-card" /></div>
    </div>
  );
}
