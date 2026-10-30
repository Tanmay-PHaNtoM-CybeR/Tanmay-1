/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: { soft: '0 18px 50px rgba(25, 48, 78, .10)', glow: '0 16px 38px rgba(14, 165, 164, .22)' },
      colors: { ink: '#10243e', ocean: '#0ea5a4', sand: '#fff9ef' },
      fontFamily: { display: ['DM Sans', 'ui-sans-serif', 'system-ui'], body: ['Inter', 'ui-sans-serif', 'system-ui'] },
    },
  },
  plugins: [],
}
