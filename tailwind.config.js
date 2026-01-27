/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
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
    },
  },
  plugins: [],
}