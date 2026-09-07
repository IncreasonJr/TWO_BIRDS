/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        offBlack: '#1A1A1A',
        gold: '#C9A84C',
        white: '#FFFFFF',
        darkGray: '#333333',
        charcoal: '#4A4A4A',
        brand: {
          50: '#fefce8',
          100: '#fef9c3',
          400: '#C9A84C',
          500: '#C9A84C',
          600: '#C9A84C',
          700: '#1A1A1A',
          dark: '#1A1A1A',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 25px -5px rgba(201, 168, 76, 0.4)',
        'luxe-card': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}
