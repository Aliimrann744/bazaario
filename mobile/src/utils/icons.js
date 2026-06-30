// Maps server category icon tokens (and a few attribute helpers) to Ionicons names.
// The server sends short tokens like "smartphone", "car", "home"; we render them with
// @expo/vector-icons Ionicons so the grid looks consistent.

export const CATEGORY_ICONS = {
  smartphone: 'phone-portrait-outline',
  car: 'car-sport-outline',
  home: 'home-outline',
  key: 'key-outline',
  tv: 'tv-outline',
  bike: 'bicycle-outline',
  factory: 'business-outline',
  wrench: 'construct-outline',
  briefcase: 'briefcase-outline',
  paw: 'paw-outline',
  sofa: 'bed-outline',
  shirt: 'shirt-outline',
  book: 'book-outline',
  baby: 'happy-outline',
};

export function categoryIcon(token) {
  return CATEGORY_ICONS[token] || 'pricetags-outline';
}

// Soft tinted backgrounds for category tiles, keyed for visual variety.
export const CATEGORY_TINTS = [
  '#CCFBF1', // teal
  '#FEF3C7', // amber
  '#E0E7FF', // indigo
  '#FCE7F3', // pink
  '#DCFCE7', // green
  '#FEE2E2', // red
  '#E0F2FE', // sky
  '#F3E8FF', // purple
];

export function tintForIndex(i) {
  return CATEGORY_TINTS[i % CATEGORY_TINTS.length];
}
