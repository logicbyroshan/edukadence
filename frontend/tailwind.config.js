/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#009BE8',
          600: '#0084D6', // Primary Brand Electric Azure from logo
          700: '#006DB3',
          800: '#00578F',
          900: '#00436E',
          950: '#002B47',
        },
        skybrand: {
          50: '#F0FDFF',
          100: '#DDF8FE',
          200: '#B8F1FD',
          300: '#6DE6FC',
          400: '#00D2FF', // Logo Star & Leaping Child Cyan
          500: '#00C3FF',
          600: '#00A3D9',
          700: '#0084B3',
          800: '#00658C',
          900: '#004B6B',
        },
        navy: {
          800: '#0D253A',
          900: '#081928', // Rich Logo Dark Navy
          950: '#040D16',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        elevated: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        cyanGlow: '0 0 20px -2px rgba(0, 210, 255, 0.35)',
        brandGlow: '0 0 20px -2px rgba(0, 132, 214, 0.35)',
      },
    },
  },
  plugins: [],
};
