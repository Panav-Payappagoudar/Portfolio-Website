/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./vite.config.js",
  ],
  safelist: [
    'md:col-span-2',
    'md:col-span-3',
    'md:row-span-2',
    'md:row-span-3',
    'min-h-[400px]',
    'min-h-[500px]',
    'col-span-2',
    'row-span-2',
    'lg:col-span-2',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          black: '#000000',
          dark: '#050505', 
          gray: '#0a0a0a', 
          accent: '#3b82f6' 
        }
      },
      animation: {
          'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'float': 'float 6s ease-in-out infinite',
          'gradient-x': 'gradient-x 10s ease infinite',
      },
      keyframes: {
          float: {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-15px)' },
          },
          'gradient-x': {
              '0%, 100%': {
                  'background-size': '200% 200%',
                  'background-position': 'left center'
              },
              '50%': {
                  'background-size': '200% 200%',
                  'background-position': 'right center'
              },
          }
      },
    },
  },
  plugins: [],
}