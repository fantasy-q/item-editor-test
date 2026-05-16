import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura' // 引入 PrimeVue 4 的现代主题
import { createI18n } from 'vue-i18n'
import App from './App.vue'

// 1. 配置极简的 UI 国际化字典
const i18n = createI18n({
  legacy: false, // 必须为 false 才能使用 Composition API
  locale: 'zh-CN', // 默认语言
  messages: {
    'zh-CN': {
      ui: { title: '通用道具数据库', layoutList: '表格视图', layoutGrid: '卡片视图' }
    },
    'en-US': {
      ui: { title: 'Item Database', layoutList: 'Table View', layoutGrid: 'Card View' }
    }
  }
})

const app = createApp(App)

// 2. 注册插件
app.use(i18n)
app.use(PrimeVue, {
  theme: {
    preset: Aura // 启用极简大气的 Aura 主题
  }
})

app.mount('#app')