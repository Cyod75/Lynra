/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Semantic tokens backed by CSS variables
        app: {
          bg:      'var(--app-bg)',
          surface: 'var(--app-surface)',
          'surface-2': 'var(--app-surface-2)',
          hover:   'var(--app-hover)',
          border:  'var(--app-border)',
          text:    'var(--app-text)',
          'text-2': 'var(--app-text-2)',
          muted:   'var(--app-muted)',
          faint:   'var(--app-faint)',
          sidebar: 'var(--app-sidebar)',
          'sidebar-border': 'var(--app-sidebar-border)',
          accent:  'var(--app-accent)',
          'accent-2': 'var(--app-accent-2)',
          danger:  'var(--app-danger)',
        },
      },
      animation: {
        'fade-in':   'fadeIn 0.18s ease-out',
        'slide-up':  'slideUp 0.22s ease-out',
        'slide-in':  'slideIn 0.25s ease-out',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'gradient':  'gradientShift 8s ease infinite',
      },
      keyframes: {
        fadeIn:   { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:  { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideIn:  { '0%': { opacity: '0', transform: 'translateX(-8px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        pulseDot: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.4' } },
        gradientShift: { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
      },
      boxShadow: {
        'accent': '0 4px 18px -2px rgba(124, 58, 237, 0.45)',
        'card-hover': '0 8px 24px -4px rgba(0,0,0,0.12)',
        'card-hover-dark': '0 8px 24px -4px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
};
