const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef9eb',
          100: '#fcf0c9',
          200: '#fadf8e',
          300: '#f8c954',
          400: '#f6b128',
          500: '#ef9415',
          600: '#d56d0b',
          700: '#af4b0d',
          800: '#8d3a11',
          900: '#733011',
          950: '#421705',
        },

        secondary: {
          50: '#f7f7f2',
          100: '#efefe5',
          200: '#dedeca',
          300: '#c9c8a8',
          400: '#b2ad85',
          500: '#a39b6c',
          600: '#958a61',
          700: '#7d7251',
          800: '#665c46',
          900: '#544d3a',
          950: '#2c271e',
        },

        warning: {
          50: '#fdfbe9',
          100: '#fdfbdd',
          200: '#fbf3a7',
          300: '#f8e568',
          400: '#f3d035',
          500: '#efbd1a',
          600: '#d99c0d',
          700: '#b4720e',
          800: '#995d15',
          900: '#854d19',
          950: '#562d0b',
        },

        error: {
          50: '#fee6e1',
          100: '#fed9d2',
          200: '#fdc2b9',
          300: '#fca292',
          400: '#fb735b',
          500: '#fa5e42',
          600: '#de3517',
          700: '#b62a11',
          800: '#912512',
          900: '#792516',
          950: '#390c05',
        },
      },
      fontFamily: {
        'odir-header': ['Lato', 'Helvetica', ...defaultTheme.fontFamily.sans],
        'odir-content': ['Lato', 'Helvetica', ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1.05)' },
          '50%': { transform: 'scale(1)' },
        },
        wave: {
          '0%': { transform: 'rotate(0.0deg)' },
          '10%': { transform: 'rotate(0.7deg)' },
          '20%': { transform: 'rotate(-1.0deg)' },
          '30%': { transform: 'rotate(0.7deg)' },
          '40%': { transform: 'rotate(-1.0deg)' },
          '50%': { transform: 'rotate(0.7deg)' },
          '60%': { transform: 'rotate(0.0deg)' },
          '100%': { transform: 'rotate(0.0deg)' },
        },
      },
      animation: {
        breathe: 'breathe 2s ease-in-out infinite',
        shake: 'wave 2s linear',
      },
    },
  },
  plugins: [],
};
