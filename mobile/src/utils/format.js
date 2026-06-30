// Formatting helpers shared across the app. Mirrors the web client's format utils.

// Money is stored on the server in MINOR units (paisa). Divide by 100 and group.
export function formatPkr(amountMinor, opts = {}) {
  const { withSymbol = true } = opts;
  const n = Number(amountMinor || 0) / 100;
  const grouped = Math.round(n).toLocaleString('en-US');
  return withSymbol ? `Rs ${grouped}` : grouped;
}

// Compact money for tight spaces: Rs 71.5 Lac / Rs 1.2 Crore.
export function formatPkrCompact(amountMinor) {
  const n = Number(amountMinor || 0) / 100;
  if (n >= 10000000) return `Rs ${trimZeros(n / 10000000)} Cr`;
  if (n >= 100000) return `Rs ${trimZeros(n / 100000)} Lac`;
  if (n >= 1000) return `Rs ${trimZeros(n / 1000)}k`;
  return `Rs ${Math.round(n).toLocaleString('en-US')}`;
}

function trimZeros(num) {
  return parseFloat(num.toFixed(2)).toString();
}

// "2 hours ago" style relative time.
export function timeAgo(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (Number.isNaN(seconds)) return '';
  if (seconds < 45) return 'just now';
  const intervals = [
    { label: 'year', secs: 31536000 },
    { label: 'month', secs: 2592000 },
    { label: 'week', secs: 604800 },
    { label: 'day', secs: 86400 },
    { label: 'hour', secs: 3600 },
    { label: 'minute', secs: 60 },
  ];
  for (const { label, secs } of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

// "Member since June 2026"
export function monthYear(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Price label honoring the listing's priceType.
export function priceLabel(listing) {
  if (!listing) return '';
  if (listing.priceType === 'contact_for_price') return 'Contact for price';
  if ((listing.priceMinor || 0) === 0 && listing.priceType !== 'fixed') return 'Ask price';
  return formatPkr(listing.priceMinor);
}

// Title-case a snake_case / kebab token as a fallback label.
export function humanize(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Trust tier → display config.
export function trustBadge(tier) {
  switch (tier) {
    case 'VERIFIED':
      return { label: 'Verified', tone: 'success', icon: 'shield-checkmark' };
    case 'ACTIVE':
      return { label: 'Active seller', tone: 'primary', icon: 'checkmark-circle' };
    default:
      return { label: 'New', tone: 'muted', icon: 'leaf' };
  }
}

export function initials(name) {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}
