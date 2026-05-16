<template>
  <div class="max-w-7xl mx-auto p-5 font-sans">
    
    <!-- 顶部控制栏 -->
    <header class="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
      <div class="flex items-center gap-3">
        <h2 class="text-xl font-bold text-gray-800">{{ t('ui.title') }}</h2>
        <span class="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-semibold">
          共 {{ database.items.length }} 件道具
        </span>
      </div>
      
      <!-- 工具栏按钮组 -->
      <div class="flex gap-3 items-center">
        <!-- 隐藏的文件输入框，通过 TS ref 触发 -->
        <input 
          type="file" 
          ref="fileInputRef" 
          accept=".json" 
          class="hidden" 
          @change="handleImport" 
        />
        
        <!-- 导入与导出按钮 -->
        <Button label="读取 JSON" icon="pi pi-upload" severity="secondary" size="small" @click="triggerImport" />
        <Button label="下载保存 JSON" icon="pi pi-download" severity="success" size="small" @click="exportDatabase" />
        
        <div class="h-6 w-px bg-gray-200 mx-1"></div> <!-- 垂直分割线 -->

        <Button label="添加新道具" icon="pi pi-plus" size="small" @click="openAddModal" />

        <select v-model="locale" class="px-3 py-1.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="zh-CN">中文</option>
          <option value="en-US">English</option>
        </select>
      </div>
    </header>

    <!-- 过滤器与布局切换工具栏 -->
    <div class="bg-white p-4 rounded-lg border border-gray-200 mb-6 flex flex-wrap gap-4 justify-between items-center shadow-sm">
      <div class="flex gap-3 items-center flex-1 max-w-md">
        <IconField class="w-full">
          <InputIcon class="pi pi-search" />
          <InputText v-model="searchQuery" placeholder="搜索道具名称或 ID..." class="w-full" />
        </IconField>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">视图切换:</span>
        <select v-model="currentLayout" class="px-3 py-1.5 rounded-md border border-gray-300 text-sm">
          <option value="list">📋 {{ t('ui.layoutList') }}</option>
          <option value="grid">🃏 {{ t('ui.layoutGrid') }}</option>
        </select>
      </div>
    </div>

    <!-- 核心布局：两栏结构 -->
    <div class="flex gap-6 items-start">
      
      <!-- 左侧：动态表单区 -->
      <div v-if="showForm" class="w-80 sticky top-5 z-10 shrink-0">
        <ItemForm 
          :schema="database.schema" 
          :item-to-edit="selectedItem" 
          @submit="handleFormSubmit"
          @cancel="closeForm"
        />
      </div>

      <!-- 右侧：数据展示区 -->
      <div class="flex-1 min-w-0">
        <DataView :value="filteredItems" :layout="currentLayout">
          
          <!-- 1. 表格视图模式 -->
          <template #list="slotProps">
            <div class="w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <DataTable :value="slotProps.items" class="p-datatable-sm" responsiveLayout="scroll">
                <Column field="id" header="道具 ID" sortable></Column>
                <Column field="name" header="道具名称" sortable></Column>
                
                <Column 
                  v-for="prop in database.schema" 
                  :key="prop.key" 
                  :field="'attributes.' + prop.key" 
                  :header="prop.label" 
                  sortable
                >
                  <template #body="{ data }">
                    <span v-if="prop.type === 'boolean'">
                      {{ data.attributes[prop.key] ? '✅ 是' : '❌ 否' }}
                    </span>
                    <span v-else>
                      {{ data.attributes[prop.key] ?? prop.defaultValue }}
                    </span>
                  </template>
                </Column>

                <Column header="操作">
                  <template #body="{ data }">
                    <Button icon="pi pi-pencil" severity="secondary" variant="text" size="small" @click="openEditModal(data)" />
                    <Button icon="pi pi-trash" severity="danger" variant="text" size="small" @click="deleteItem(data.id)" />
                  </template>
                </Column>
              </DataTable>
            </div>
          </template>

          <!-- 2. 卡片视图模式 -->
          <template #grid="slotProps">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              <div 
                v-for="item in slotProps.items" 
                :key="item.id" 
                class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative group flex flex-col justify-between min-h-[160px]"
              >
                <div>
                  <div class="flex justify-between items-start mb-2">
                    <h4 class="text-base font-bold text-gray-800">{{ item.name }}</h4>
                    <span class="text-xs bg-gray-100 text-gray-500 font-mono px-1.5 py-0.5 rounded">
                      {{ item.id }}
                    </span>
                  </div>
                  
                  <div class="flex flex-wrap gap-2 mt-3">
                    <div 
                      v-for="prop in database.schema" 
                      :key="prop.key"
                      class="text-xs px-2 py-1 rounded bg-slate-50 border border-slate-100 text-gray-600"
                    >
                      <span class="font-semibold text-gray-400">{{ prop.label }}:</span>
                      <span class="ml-1 font-medium">
                        {{ prop.type === 'boolean' ? (item.attributes[prop.key] ? '是' : '否') : (item.attributes[prop.key] ?? prop.defaultValue) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex justify-end gap-1 mt-4 pt-2 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button icon="pi pi-pencil" severity="secondary" variant="text" size="small" @click="openEditModal(item)" />
                  <Button icon="pi pi-trash" severity="danger" variant="text" size="small" @click="deleteItem(item.id)" />
                </div>
              </div>
            </div>
          </template>

        </DataView>
      </div>

    </div>

    <!-- 底部：实时 JSON 源码 -->
    <div class="mt-12">
      <h3 class="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">实时 JSON 数据库源码</h3>
      <pre class="bg-[#2d2d2d] text-[#a8c7fa] p-4 rounded-md overflow-x-auto text-sm shadow-inner">{{ JSON.stringify(database, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

// 引入所需的 PrimeVue 组件
import Button from 'primevue/button'
import DataView from 'primevue/dataview'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

import ItemForm from './components/ItemForm.vue'

const { t, locale } = useI18n()

// ==========================================
// 1. TypeScript 接口定义
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
  attributes: Record<string, any>;
}

interface Database {
  schema: SchemaItem[];
  items: Item[];
}

// ==========================================
// 2. 状态管理
// ==========================================
const currentLayout = ref<'list' | 'grid'>('list') 
const showForm = ref(false)
const selectedItem = ref<Item | null>(null)
const searchQuery = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null) // 用于触发文件选择器的引用

// 默认初始数据库数据
const database = ref<Database>({
  schema: [
    { key: "atk", label: "攻击力", type: "number", defaultValue: 0 },
    { key: "rarity", label: "稀有度", type: "string", defaultValue: "普通" },
    { key: "isQuestItem", label: "任务道具", type: "boolean", defaultValue: false }
  ],
  items: [
    { id: "wpn_001", name: "烈焰剑", attributes: { atk: 50, rarity: "史诗", isQuestItem: false } },
    { id: "wpn_002", name: "寒冰法杖", attributes: { atk: 40, rarity: "稀有", isQuestItem: false } },
    { id: "key_012", name: "遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } }
  ]
})

// ==========================================
// 3. 核心功能：导入与导出 (JSON 读写)
// ==========================================

// 导出 JSON 文件
const exportDatabase = () => {
  try {
    // 将响应式数据序列化为格式化后的 JSON 字符串
    const jsonString = JSON.stringify(database.value, null, 2)
    
    // 创建二进制大对象 (Blob)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    // 利用虚拟 DOM 节点触发浏览器下载
    const link = document.createElement('a')
    link.href = url
    link.download = `game_item_database_${new Date().toISOString().slice(0,10)}.json`
    document.body.appendChild(link)
    link.click()
    
    // 释放内存空间
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    alert('导出失败：' + error)
  }
}

// 触发隐藏的文件选择器
const triggerImport = () => {
  fileInputRef.value?.click()
}

// 导入并校验 JSON 文件
const handleImport = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const result = e.target?.result as string
      const parsedData = JSON.parse(result)

      // 【TS 严谨约束体现】运行时结构完整性校验
      if (
        parsedData && 
        Array.isArray(parsedData.schema) && 
        Array.isArray(parsedData.items)
      ) {
        // 类型断言与赋值，确保存入的状态完全符合 Database 接口
        database.value = parsedData as Database
        alert('数据库导入成功！')
        closeForm() // 导入新库后关闭正在编辑的表单，防止数据冲突
      } else {
        alert('导入失败：JSON 文件格式不正确，必须包含 schema 和 items 数组。')
      }
    } catch (error) {
      alert('解析失败，请确保文件是合法的标准 JSON 格式。')
    } finally {
      // 清空 input 的值，确保同一个文件可以连续重复导入
      target.value = ''
    }
  }
  reader.readAsText(file)
}

// ==========================================
// 4. 其余业务逻辑
// ==========================================
const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return database.value.items

  return database.value.items.filter(item => {
    return item.name.toLowerCase().includes(query) || item.id.toLowerCase().includes(query)
  })
})

const openAddModal = () => {
  selectedItem.value = null
  showForm.value = true
}

const openEditModal = (item: Item) => {
  selectedItem.value = item
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  selectedItem.value = null
}

const handleFormSubmit = (newItem: Item) => {
  const index = database.value.items.findIndex(i => i.id === newItem.id)
  if (index !== -1) {
    database.value.items[index] = newItem
  } else {
    database.value.items.push(newItem)
  }
  closeForm()
}

const deleteItem = (id: string) => {
  if (confirm('确定要删除这件道具吗？')) {
    database.value.items = database.value.items.filter(i => i.id !== id)
    if (selectedItem.value?.id === id) closeForm()
  }
}
</script>