/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'hot-pink': '#FF69B4',
        'millennial-pink': '#F8BBD9',
        'soft-pink': '#FFE4E1',
        'rose-gold': '#E8B4B8',
      },
    },
  },
  plugins: [],
};
