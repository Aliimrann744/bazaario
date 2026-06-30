// Bazaario design tokens — mirrors /SHARED-SPEC.md §1.
// Keep these values in sync with the web client so the brand stays consistent.

export const colors = {
  primary: '#0D9488', // teal-600
  primaryDark: '#0F766E', // teal-700
  primaryLight: '#5EEAD4', // teal-300
  primarySoft: '#CCFBF1', // teal-100 (tints/backgrounds)
  accent: '#F59E0B', // amber-500
  accentDark: '#D97706', // amber-600
  accentSoft: '#FEF3C7', // amber-100
  ink: '#0F172A', // slate-900
  muted: '#64748B', // slate-500
  mutedLight: '#94A3B8', // slate-400
  line: '#E2E8F0', // slate-200
  lineSoft: '#F1F5F9', // slate-100
  surface: '#FFFFFF',
  bg: '#F8FAFC', // slate-50
  success: '#16A34A',
  successSoft: '#DCFCE7',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(15,23,42,0.55)',
};

// Gradients are consumed by expo-linear-gradient as { colors, start, end }.
export const gradients = {
  // linear-gradient(135deg,#0F766E 0%,#0D9488 45%,#14B8A6 100%)
  brand: {
    colors: ['#0F766E', '#0D9488', '#14B8A6'],
    locations: [0, 0.45, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  // linear-gradient(135deg,#F59E0B 0%,#FBBF24 100%)
  gold: {
    colors: ['#F59E0B', '#FBBF24'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  // Soft dark scrim for image overlays (gallery / featured cards)
  scrim: {
    colors: ['transparent', 'rgba(15,23,42,0.65)'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
};

export const radius = {
  sm: 8,
  md: 12,
  card: 16,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
};

// React Native shadows (iOS shadow* + Android elevation).
export const shadows = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 3,
  },
  hover: {
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 8,
  },
  soft: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
};

export const typography = {
  // Expo bundles system fonts; "display" maps to the platform's heavy system face.
  display: undefined,
  sans: undefined,
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 34,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

export const brand = {
  name: 'Bazaario',
  tagline: "Pakistan's Premium Marketplace",
};

export default { colors, gradients, radius, spacing, shadows, typography, brand };
