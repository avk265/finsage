/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scan all your React components
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'), // <-- ADD THIS LINE
  ],
}