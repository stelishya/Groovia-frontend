/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'deep-purple': '#100918', 
        chart: {
        1: "hsl(220 90% 56%)",
        2: "hsl(160 80% 45%)",
        3: "hsl(30 90% 55%)",
      },
      }
    },
  },
  plugins: [],
}

