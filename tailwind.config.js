// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // 确保扫描所有的 Vue 和 TS 文件
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}