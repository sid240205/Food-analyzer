/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        zomato: {
          red: "#E23744",
          pink: "#FF7E8B",
          dark: "#1C1C1C",
        },
      },
    },
  },
  plugins: [],
};