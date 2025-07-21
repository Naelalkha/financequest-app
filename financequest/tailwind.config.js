/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          gold: {
            50: '#FFFEF7',
            100: '#FFFDF0',
            200: '#FFFAE0',
            300: '#FFF7CC',
            400: '#FFEB99',
            500: '#FFD700',
            600: '#CCAC00',
            700: '#998100',
            800: '#665600',
            900: '#332B00'
          }
        }
      },
    },
    plugins: [],
  }