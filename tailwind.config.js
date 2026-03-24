/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'base': '#FAFAF9',
        'charcoal': '#2D2D2D',
        'accent': '#1B4D4F',
        'accent-light': '#2A6F72',
        'accent-pale': '#E8F0F0',
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
