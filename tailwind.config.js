/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#07080b',
        surface: '#0e1117',
        'surface-card': '#12151f',
        'surface-card-hover': '#181d2c',
        gold: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
          glow: 'rgba(245, 158, 11, 0.35)'
        },
        tier: {
          's-plus': '#f59e0b',
          's': '#a855f7',
          'a': '#38bdf8',
          'b': '#34d399',
          'c': '#94a3b8',
          'df': '#f43f5e',
          'unrated': '#fb923c'
        }
      },
      fontFamily: {
        serif: ['"Libre Bodoni"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'cinema-tile': '0 10px 24px -4px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'cinema-glow-gold': '0 18px 40px rgba(0, 0, 0, 0.85), 0 0 25px rgba(245, 158, 11, 0.35)',
        'cinema-glow-purple': '0 18px 40px rgba(0, 0, 0, 0.85), 0 0 25px rgba(168, 85, 247, 0.35)',
      }
    },
  },
  plugins: [],
}
