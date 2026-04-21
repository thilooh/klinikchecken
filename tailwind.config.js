/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#003399',
        orange: '#FF6600',
        'light-blue-bg': '#E8F0FE',
        'page-bg': '#F4F4F4',
        'border-gray': '#DDDDDD',
        'text-secondary': '#666666',
        'green-badge': '#00A651',
        'star-yellow': '#FFB400',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
