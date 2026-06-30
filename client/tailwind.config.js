/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4',
          400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e',
          800: '#115e59', 900: '#134e4a', DEFAULT: '#0d9488',
        },
        accent: {
          50: '#fffbeb', 100: '#fef3c7', 300: '#fcd34d', 400: '#fbbf24',
          500: '#f59e0b', 600: '#d97706', 700: '#b45309', DEFAULT: '#f59e0b',
        },
        ink: '#0f172a',
        muted: '#64748b',
        line: '#e2e8f0',
        page: '#f8fafc',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '16px', xl2: '20px' },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.04), 0 8px 24px -12px rgba(15,23,42,.12)',
        hover: '0 16px 44px -16px rgba(13,148,136,.45)',
        glow: '0 0 0 1px rgba(13,148,136,.12), 0 12px 32px -12px rgba(13,148,136,.30)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg,#0f766e 0%,#0d9488 45%,#14b8a6 100%)',
        'gold-gradient': 'linear-gradient(135deg,#f59e0b 0%,#fbbf24 100%)',
        'hero-mesh': 'radial-gradient(1200px 500px at 10% -10%, rgba(20,184,166,.25), transparent 60%), radial-gradient(900px 500px at 100% 0%, rgba(245,158,11,.18), transparent 55%)',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        floaty: 'floaty 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
