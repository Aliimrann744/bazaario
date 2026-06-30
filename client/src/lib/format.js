// Money is stored in minor units (paisa). Display as Rs with grouping.
export function formatPkr(amountMinor, { compact = false } = {}) {
  const rupees = Number(amountMinor || 0) / 100;
  if (compact) {
    if (rupees >= 1e7) return `Rs ${(rupees / 1e7).toFixed(rupees % 1e7 === 0 ? 0 : 2)} Cr`;
    if (rupees >= 1e5) return `Rs ${(rupees / 1e5).toFixed(rupees % 1e5 === 0 ? 0 : 2)} Lac`;
    if (rupees >= 1e3) return `Rs ${(rupees / 1e3).toFixed(0)}k`;
  }
  return `Rs ${rupees.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
}

export function priceLabel(listing) {
  const { priceType, priceMinor } = listing;
  if (priceType === 'free') return 'Free';
  if (priceType === 'contact_for_price') return 'Contact for price';
  if (!priceMinor && (priceType === 'contact_for_price')) return 'Contact for price';
  return formatPkr(priceMinor);
}

export function timeAgo(date) {
  if (!date) return '';
  const d = new Date(date);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h} hr ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  const mo = Math.floor(days / 30); if (mo < 12) return `${mo} month${mo > 1 ? 's' : ''} ago`;
  return `${Math.floor(mo / 12)} yr ago`;
}

export function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}
