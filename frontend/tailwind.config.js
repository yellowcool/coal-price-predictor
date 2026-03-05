/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'coal-red': '#DC2626',
        'coal-green': '#16A34A',
        'coal-dark': '#1C1917',
        'coal-gray': '#78716C',
      }
    },
  },
  plugins: [],
}
