// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {}, // 👈 核心修改：改为新版的插件名称
    autoprefixer: {},
  },
}