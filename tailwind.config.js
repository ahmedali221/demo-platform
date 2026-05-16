/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./packages/*/src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C9A44C',
          hover: '#B8952A',
          light: '#F5EDD6',
        },
        dark: {
          DEFAULT: '#1A2332',
          hover: '#0f1923',
        },
        accent: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
        },
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      boxShadow: {
        modal: '0 20px 60px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
};
