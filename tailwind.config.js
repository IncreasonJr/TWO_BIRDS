/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5F4F4',
        amber: '#F3B250',
        terracotta: '#C67D43',
        chocolate: '#532E16',
        trueBlack: '#050505',
        brand: {
          50: '#fffbe6',
          100: '#fef3c7',
          400: '#F3B250',
          500: '#F3B250',
          600: '#C67D43',
          700: '#532E16',
          dark: '#532E16',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-amber': '0 0 25px -5px rgba(243, 178, 80, 0.4)',
        'glow-terracotta': '0 0 25px -5px rgba(198, 125, 67, 0.4)',
        'warm-card': '0 10px 30px -10px rgba(83, 46, 22, 0.15)',
      },
    },
  },
  plugins: [],
}
