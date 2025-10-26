/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#F8F8F8",
        primary: "#40597B", 
        secondary: "#E8D9C5",
        primaryText: "#000000",
        secondaryText: "#8A8A8A",
        success: "#38AF5C",
        error: "#A62525", 
        stroke: "#E9E9E9", 
        darkerStroke: "#C8C8C8"
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}