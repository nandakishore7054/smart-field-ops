/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 24px 60px rgba(15, 23, 42, 0.22)',
      },
    },
  },
  plugins: [],
};