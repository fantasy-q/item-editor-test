<template>
  <div class="min-h-screen bg-[#fcfcfd] text-slate-700 font-sans antialiased">
    
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 shadow-sm">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
            <i class="pi pi-database text-white text-lg"></i>
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-800 tracking-tight">{{ t('ui.title') }}</h2>
            <p class="text-xs text-slate-400 font-medium">Hybrid View Matrix Mode</p>
          </div>
        </div>
        
        <div class="flex gap-3 items-center">
          <input type="file" ref="fileInputRef" accept=".json" class="hidden" @change="handleImport" />
          <Button label="读取 JSON" icon="pi pi-upload" severity="secondary" size="small" class="p-button-outlined" @click="triggerImport" />
          <Button label="下载保存 JSON" icon="pi pi-download" severity="success" size="small" class="bg-emerald-600 border-emerald-600 shadow-sm" @click="exportDatabase" />
          <div class="h-5 w-px bg-slate-200 mx-1"></div>
          <Button label="添加新道具" icon="pi pi-plus" size="small" class="bg-indigo-600 border-indigo-600 shadow-sm" @click="addNewRow" />
        </div>
      </div>
    </header>

    <!-- 主体区 -->
    <main class="max-w-7xl mx-auto p-6">
      
      <!-- 搜索与视图切换工具栏 -->
      <div class="bg-white p-4 rounded-xl border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <IconField class="w-full md:max-w-md">
          <InputIcon class="pi pi-search text-slate-400" />
          <InputText v-model="searchQuery" placeholder="输入名称或 ID 实时筛选..." class="w-full p-inputtext-sm bg-slate-50/50 border-slate-200/80 rounded-lg" />
        </IconField>
        
        <div class="flex items-center gap-4 text-xs font-semibold text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
          <div class="px-3 py-1 bg-white rounded-md shadow-sm border border-slate-200/50 text-slate-700">
            📊 库内条目: {{ database.items.length }}
          </div>
          <div class="flex items-center gap-1.5 pr-2">
            <span>视图切换:</span>
            <select v-model="currentLayout" class="bg-transparent border-none text-slate-700 font-bold focus:outline-none cursor-pointer">
              <option value="list">📋 表格编辑模式</option>
              <option value="grid">🃏 卡片画廊模式</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 核心大容器：DataView 调度器 -->
      <DataView :value="filteredItems" :layout="currentLayout">
        
        <!-- 【视图 A】：表格行内编辑模式 (List) -->
        <template #list="slotProps">
          <div class="w-full bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden animate-fade-in">
            <DataTable 
              :value="slotProps.items" 
              v-model:editingRows="editingRows" 
              editMode="row" 
              dataKey="id"
              @row-edit-save="onRowEditSave"
              class="p-datatable-sm modern-table" 
              responsiveLayout="scroll"
            >
              <Column field="id" header="道具 ID" class="font-mono text-xs font-bold text-slate-400"></Column>
              
              <Column field="name" header="道具名称" class="font-bold text-slate-800" style="width: 25%">
                <template #body="{ data }">{{ data.name }}</template>
                <template #editor="{ data }">
                  <InputText v-model="data.name" class="p-inputtext-sm w-full" />
                </template>
              </Column>
              
              <Column v-for="prop in database.schema" :key="prop.key" :field="'attributes.' + prop.key" :header="prop.label">
                <template #body="{ data }">
                  <span v-if="prop.type === 'boolean'">
                    <span v-if="data.attributes[prop.key]" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">TRUE</span>
                    <span v-else class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-50 text-slate-400 border border-slate-100">FALSE</span>
                  </span>
                  <span v-else-if="prop.key === 'rarity'">
                    <span :class="getRarityClass(data.attributes[prop.key])">{{ data.attributes[prop.key] ?? prop.defaultValue }}</span>
                  </span>
                  <span v-else class="font-medium text-slate-600">
                    {{ data.attributes[prop.key] ?? prop.defaultValue }}
                  </span>
                </template>

                <template #editor="{ data }">
                  <InputNumber v-if="prop.type === 'number'" v-model="data.attributes[prop.key]" class="p-inputtext-sm w-full" />
                  <InputText v-if="prop.type === 'string'" v-model="data.attributes[prop.key]" class="p-inputtext-sm w-full" />
                  <ToggleSwitch v-if="prop.type === 'boolean'" v-model="data.attributes[prop.key]" class="p-toggleswitch-sm" />
                </template>
              </Column>

              <Column :rowEditor="true" style="width: 6rem" bodyClass="text-center" header="编辑"></Column>
              
              <Column style="width: 3rem" header="删除">
                <template #body="{ data }">
                  <Button icon="pi pi-trash" severity="danger" variant="text" size="small" class="text-slate-400 hover:text-rose-600" @click="deleteItem(data.id)" />
                </template>
              </Column>
            </DataTable>
          </div>
        </template>

        <!-- 【视图 B】：幻想风卡片画廊模式 (Grid) -->
        <template #grid="slotProps">
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full animate-fade-in">
            <div v-for="item in slotProps.items" :key="item.id" class="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all duration-200 relative group flex flex-col justify-between min-h-[180px]">
              <div>
                <div class="flex justify-between items-start gap-2">
                  <div>
                    <h4 class="text-base font-bold text-slate-800">{{ item.name }}</h4>
                    <span class="text-[10px] font-bold text-slate-400 font-mono tracking-wider block mt-0.5">{{ item.id }}</span>
                  </div>
                  <span :class="getRarityClass(item.attributes.rarity)">
                    {{ item.attributes.rarity || '普通' }}
                  </span>
                </div>
                
                <div class="grid grid-cols-2 gap-2 mt-4">
                  <div v-for="prop in database.schema" :key="prop.key" v-show="prop.key !== 'rarity'" class="text-xs p-2 rounded-lg bg-slate-50/60 border border-slate-100 flex flex-col justify-center">
                    <span class="font-bold text-slate-400 text-[10px] uppercase">{{ prop.label }}</span>
                    <span class="font-semibold text-slate-700 mt-0.5">
                      {{ prop.type === 'boolean' ? (item.attributes[prop.key] ? '✅ 是' : '❌ 否') : (item.attributes[prop.key] ?? prop.defaultValue) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 卡片视图下的操作栏：提供快捷删除与一键切换去表格编辑的引导 -->
              <div class="flex justify-between items-center mt-5 pt-2 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <span class="text-[10px] text-indigo-500 font-bold flex items-center gap-1 cursor-pointer" @click="currentLayout = 'list'">
                  <i class="pi pi-table text-[9px]"></i> 去表格切入编辑
                </span>
                <Button icon="pi pi-trash" severity="danger" variant="text" size="small" class="text-slate-400 hover:text-rose-600" @click="deleteItem(item.id)" />
              </div>
            </div>
          </div>
        </template>

      </DataView>

      <!-- 底部：黑客风单行 JSON 源码 -->
      <div class="mt-12 bg-[#1e1e24] rounded-xl border border-slate-800 shadow-xl overflow-hidden">
        <div class="bg-[#15151a] px-4 py-2 flex justify-between items-center border-b border-slate-800/60">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span class="text-xs text-slate-500 font-mono font-bold ml-2">DATA_SOURCE.JSON</span>
          </div>
          <span class="text-[10px] text-slate-600 font-mono font-bold uppercase tracking-widest">Single-Line Live Matrix</span>
        </div>
        <pre class="text-[#a8c7fa] p-5 overflow-x-auto text-xs font-mono leading-relaxed max-h-80 select-all">{{ prettyJsonString }}</pre>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

import Button from 'primevue/button'
import DataView from 'primevue/dataview'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import ToggleSwitch from 'primevue/toggleswitch'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

import { stringifyDatabaseInline } from './utils/jsonFormatter'

const { t, locale } = useI18n()

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

const currentLayout = ref<'list' | 'grid'>('grid') // 默认设定为高颜值的卡片画廊
const searchQuery = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const editingRows = ref([])

const database = ref<Database>({
  schema: [
    { key: "atk", label: "攻击力", type: "number", defaultValue: 0 },
    { key: "rarity", label: "稀有度", type: "string", defaultValue: "普通" },
    { key: "isQuestItem", label: "任务道具", type: "boolean", defaultValue: false }
  ],
  items: [
    { id: "wpn_001", name: "烈焰魔剑", attributes: { atk: 125, rarity: "史诗", isQuestItem: false } },
    { id: "wpn_002", name: "凛冬冰霜法杖", attributes: { atk: 85, rarity: "稀有", isQuestItem: false } },
    { id: "key_011", name: "古老遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } },
    { id: "key_012", name: "古老遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } },
    { id: "key_013", name: "古老遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } },
    { id: "key_014", name: "古老遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } },
    { id: "key_015", name: "古老遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } },
    { id: "key_016", name: "古老遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } },
    { id: "key_017", name: "古老遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } },
    { id: "key_018", name: "古老遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } },
    { id: "key_019", name: "古老遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } },
    { id: "key_020", name: "古老遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } },
    { id: "key_021", name: "古老遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } },
    { id: "key_022", name: "古老遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } },
    { id: "key_023", name: "古老遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } },
    { id: "key_024", name: "古老遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } },
    { id: "key_025", name: "古老遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } },
    { id: "key_026", name: "古老遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } },
    { id: "key_027", name: "古老遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } },
    { id: "key_028", name: "古老遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } },
    { id: "key_029", name: "古老遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } },
    { id: "key_030", name: "古老遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } },
    { id: "key_031", name: "古老遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } },
    { id: "key_032", name: "古老遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } },
    { id: "key_033", name: "古老遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } },
    { id: "key_034", name: "古老遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } },
    { id: "key_035", name: "古老遗迹钥匙", attributes: { atk: 0, rarity: "普通", isQuestItem: true } },
  ]
})

const onRowEditSave = (event: any) => {
  const { newData, index } = event
  database.value.items[index] = newData
}

const addNewRow = () => {
  const newId = `item_${Date.now().toString().slice(-4)}`
  const defaultAttrs: Record<string, any> = {}
  database.value.schema.forEach(prop => { defaultAttrs[prop.key] = prop.defaultValue })
  
  database.value.items.unshift({
    id: newId,
    name: "未命名新道具",
    attributes: defaultAttrs
  })
  currentLayout.value = 'list' // 添加时自动切回表格模式方便立刻原地编辑
}

const getRarityClass = (rarity: string) => {
  const base = "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border "
  switch(rarity) {
    case '史诗': return base + "bg-purple-50 text-purple-700 border-purple-100"
    case '稀有': return base + "bg-blue-50 text-blue-700 border-blue-100"
    case '传说': return base + "bg-amber-50 text-amber-700 border-amber-200 shadow-sm shadow-amber-50"
    default: return base + "bg-slate-50 text-slate-600 border-slate-100"
  }
}

const prettyJsonString = computed(() => stringifyDatabaseInline(database.value))

const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return database.value.items
  return database.value.items.filter(item => item.name.toLowerCase().includes(query) || item.id.toLowerCase().includes(query))
})

const deleteItem = (id: string) => {
  if (confirm('确定要删除这件道具吗？')) {
    database.value.items = database.value.items.filter(i => i.id !== id)
  }
}

const triggerImport = () => { fileInputRef.value?.click() }
const handleImport = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const parsedData = JSON.parse(e.target?.result as string)
      if (parsedData && Array.isArray(parsedData.schema) && Array.isArray(parsedData.items)) {
        database.value = parsedData as Database
      }
    } catch (e) { alert('解析失败') }
    finally { target.value = '' }
  }
  reader.readAsText(file)
}

const exportDatabase = () => {
  const jsonString = stringifyDatabaseInline(database.value)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `game_db_${new Date().toISOString().slice(0,10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<style>
.modern-table .p-datatable-thead > tr > th {
  background-color: #f8fafc !important;
  color: #64748b !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  padding: 12px 16px !important;
  border-bottom: 1px solid #f1f5f9 !important;
}
.modern-table .p-datatable-tbody > tr > td {
  padding: 14px 16px !important;
  border-bottom: 1px solid #f1f5f9 !important;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>