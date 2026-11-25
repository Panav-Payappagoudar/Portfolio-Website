/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./privacy.html",
    "./terms.html",
    "./404.html",
    "./work/**/*.{html,js}",
    "./experience/**/*.{html,js}",
    "./achievements/**/*.{html,js}",
    "./about/**/*.{html,js}",
    "./contact/**/*.{html,js}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./scripts/**/*.{js,ts}"
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Manrope"', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        background: '#F9F9F9',
        surface: '#FFFFFF',
        'surface-subtle': '#F4F4F5',
        'surface-dark': '#111111',
        primary: '#111111',
        secondary: '#64748B',
        muted: '#71717A',
        border: 'rgba(0, 0, 0, 0.08)',
        'border-dark': 'rgba(255, 255, 255, 0.12)',
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
      }
    },
  },
  plugins: [],
}
