/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#090b10',
          800: '#0e121b',
          700: '#161c28',
          600: '#202838',
          500: '#2e394e'
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309'
        },
        slate: {
          50: '#131722',
          100: '#1e222d',
          200: '#2a2e39',
          300: '#4c525e',
          400: '#606470',
          500: '#787b86',
          600: '#b2b5be',
          700: '#d1d4dc',
          800: '#e0e3eb',
          900: '#fafbfc',
          950: '#ffffff'
        },
        amber: {
          50: '#e3ecff',
          100: '#e3ecff',
          200: '#90aeff',
          300: '#6690ff',
          400: '#4072ff',
          500: '#2962ff',
          600: '#1e53e5',
          700: '#1544c7',
          800: '#0f35a8',
          900: '#0a268a',
          950: '#05186b'
        },
        emerald: {
          500: '#089981',
          400: '#26a69a'
        },
        rose: {
          500: '#f23645',
          400: '#ef5350'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
