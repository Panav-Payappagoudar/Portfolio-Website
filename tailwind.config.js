/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./privacy.html",
    "./terms.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./vite.config.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        editorial: ['Newsreader', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        canvas: {
          DEFAULT: '#0e0f12',
          subtle: '#14151a',
        },
        surface: {
          DEFAULT: '#14151a',
          elevated: '#1a1b22',
          border: 'rgba(243, 239, 230, 0.08)',
          'border-strong': 'rgba(243, 239, 230, 0.16)',
        },
        ink: {
          primary: '#f3efe6',
          secondary: '#9e9a91',
          muted: '#625f58',
          subtle: '#45433e',
        },
        accent: {
          DEFAULT: '#c47847',
          muted: 'rgba(196, 120, 71, 0.15)',
          hover: '#d58754',
        }
      },
    },
  },
  plugins: [],
}