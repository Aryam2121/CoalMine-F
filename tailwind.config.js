/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        mine: {
          950: '#0a0f1a',
          900: '#0f1e33',
          800: '#1a2d4a',
          700: '#243b5c',
          accent: '#f59e0b',
          safe: '#10b981',
          danger: '#ef4444',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 30, 51, 0.06), 0 8px 24px rgba(15, 30, 51, 0.08)',
        'card-hover': '0 12px 40px rgba(15, 30, 51, 0.12)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
