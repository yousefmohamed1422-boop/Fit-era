/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './resources/js/**/*.{js,jsx}',
    './resources/views/**/*.blade.php',
    './preview/**/*.{js,jsx,html}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg-rgb) / <alpha-value>)',
        bg2: 'var(--bg2)',
        fg: 'rgb(var(--fg-rgb) / <alpha-value>)',
        muted: 'rgb(var(--muted-rgb) / <alpha-value>)',
        line: 'var(--line)',
        rose: 'rgb(var(--rose-rgb) / <alpha-value>)',
        taupe: 'var(--taupe)',
        stone: 'var(--stone)',
        ink: '#171717',
        ivory: '#F7F4EE',
      },
      fontFamily: {
        // Impact-style display. Anton looks the same on every device; Impact is the fallback.
        display: ['Anton', 'Impact', 'Haettenschweiler', '"Arial Narrow Bold"', 'sans-serif'],
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: { '4xl': '2rem', '5xl': '2.75rem' },
    },
  },
  plugins: [],
};
