/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand:      '#C8392B',
        'brand-tint': '#FDF0EE',
        'brand-bg': '#FAFAF7',
        'brand-dark': '#0C0C0A',
        gold:       '#B8975A',
        'text-main': '#1A1917',
        'text-muted': '#6B6860',
        border:     '#E8E6E1',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body:    ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
