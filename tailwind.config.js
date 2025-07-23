/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono': ['Courier New', 'monospace'],
      },
      colors: {
        'terminal': {
          'bg': '#1a1a1a',
          'text': '#00ff00',
          'border': '#00ff00',
          'input': '#000000',
        }
      }
    },
  },
  plugins: [],
} 