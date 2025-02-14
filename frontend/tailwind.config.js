import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],



  theme: {
    extend: {
      fontFamily: {
        'original': ['Original', 'sans-serif']
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
}
