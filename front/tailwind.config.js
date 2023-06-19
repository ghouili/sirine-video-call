/** @type {import('tailwindcss').Config} */
const tailwindcss = require('tailwindcss');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    tailwindcss('./tailwind.config.js'),
    require('@tailwindcss/aspect-ratio'),
  ],
}

