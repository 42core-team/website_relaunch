import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],

  // theme: {
  //   extend: {
  //     fontFamily: {
  //       Peyda: ["Peyda"],
  //       sans: ["var(--font-sans)"],
  //       mono: ["var(--font-mono)"],
  //     },
  //   },
  // },
  darkMode: "class",
  plugins: [heroui()],
}
