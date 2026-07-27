/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981', // Main fresh mint leaf
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        amber: {
          500: '#f59e0b',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(16, 185, 129, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        card: '0 10px 30px -5px rgba(15, 23, 42, 0.05)',
      },
    },
  },
  plugins: [],
};
