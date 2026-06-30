import { priceLabel } from '../../lib/format';

export default function PriceTag({ listing, className = '' }) {
  return (
    <span className={`bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent ${className}`}>
      {priceLabel(listing)}
    </span>
  );
}
