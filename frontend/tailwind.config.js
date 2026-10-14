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
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#8c6d60',
          800: '#6d4f43',
          900: '#4a352d',
          950: '#2b1d18',
        },
        warm: {
          primary: '#c2410c', // orange-700
          accent: '#b45309', // amber-700
          dark: '#1c1917', // stone-900
          light: '#f5f5f4', // stone-100
        },
        bepviet: {
          brown: '#6d492f',
          dark: '#3f2615',
          sand: '#d7bda0',
          sandLight: '#f3ece3',
          cream: '#faf7f2',
          clay: '#b84a28',
          moss: '#2d5a27',
          border: '#e6ded4'
        }
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Lora"', '"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', '"Lora"', 'serif'],
      },
    },
  },
  plugins: [],
}
