<template>
  <!-- 外层容器：设置最大宽度、居中、内边距、默认字体 -->
  <div class="max-w-6xl mx-auto p-5 font-sans">
    
    <!-- 顶部控制栏：Flex 布局、两端对齐、底部边框与间距 -->
    <header class="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
      <h2 class="text-xl font-bold text-gray-800">{{ t('ui.title') }}</h2>
      
      <!-- 控制按钮组：Flex 布局，子元素间距 gap-3 -->
      <div class="flex gap-3">
        <!-- 下拉框：内边距、圆角、边框、文字大小 -->
        <select v-model="locale" class="px-3 py-1.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="zh-CN">中文</option>
          <option value="en-US">English</option>
        </select>

        <select v-model="currentLayout" class="px-3 py-1.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="list">{{ t('ui.layoutList') }}</option>
          <option value="grid">{{ t('ui.layoutGrid') }}</option>
        </select>
      </div>
    </header>

    <!-- 主体内容区 -->
    <main>
      <!-- 占位背景框：浅灰背景、圆角、内边距 -->
      <div class="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
        <p class="mb-2 text-gray-700">当前处于：<strong class="text-blue-600">{{ currentLayout === 'list' ? t('ui.layoutList') : t('ui.layoutGrid') }}</strong></p>
        <p class="mb-4 text-gray-700">数据库中共有 <strong class="text-blue-600">{{ database.items.length }}</strong> 件道具</p>
        <hr class="border-gray-200 mb-4" />
        
        <!-- JSON 调试框：深色背景、圆角、横向滚动 -->
        <pre class="bg-[#2d2d2d] text-[#a8c7fa] p-4 rounded-md overflow-x-auto text-sm">{{ JSON.stringify(database, null, 2) }}</pre>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const currentLayout = ref<'list' | 'grid'>('list') 

// ==========================================
// 核心 TypeScript 接口定义
// ==========================================
interface SchemaItem {
  key: string;
  label: string;
  type: 'number' | 'string' | 'boolean';
  defaultValue: string | number | boolean;
}

interface Item {
  id: string;
  name: string;
  attributes: Record<string, string | number | boolean>;
}

interface Database {
  schema: SchemaItem[];
  items: Item[];
}

// ==========================================
// 业务数据实例化
// ==========================================
const database = ref<Database>({
  schema: [
    { key: "atk", label: "攻击力", type: "number", defaultValue: 0 },
    { key: "rarity", label: "稀有度", type: "string", defaultValue: "普通" }
  ],
  items: [
    {
      id: "wpn_001",
      name: "烈焰剑",
      attributes: {
        atk: 50,
        rarity: "史诗"
      }
    }
  ]
})
</script>