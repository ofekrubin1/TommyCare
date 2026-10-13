/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Heebo', 'system-ui', 'sans-serif'] },
      colors: {
        bg: token('bg'),
        card: token('card'),
        ink: token('ink'),
        mute: token('mute'),
        line: token('line'),
        accent: token('accent'),
        feed: token('feed'),
        diaper: token('diaper'),
        sleep: token('sleep'),
        note: token('note'),
        health: token('health'),
        danger: token('danger'),
        pump: token('pump'),
      },
      borderRadius: { xl2: '1.25rem' },
      boxShadow: { soft: '0 2px 14px rgb(0 0 0 / 0.05), 0 1px 3px rgb(0 0 0 / 0.04)' },
    },
  },
  plugins: [],
};
