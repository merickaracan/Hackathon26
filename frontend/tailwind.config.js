/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand:        '#16A34A',
        'brand-tint': '#DCFCE7',
        'brand-bg':   '#F0FDF4',
        'brand-dark': '#14532D',
        gold:         '#FFB300',
        'text-main':  '#111111',
        'text-muted': '#6B7280',
        border:       '#D1FAE5',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
