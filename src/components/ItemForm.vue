<template>
  <div class="bg-white p-6 rounded-xl border border-slate-200/60 shadow-xl shadow-slate-100/50 w-full flex flex-col">
    
    <!-- 面板头部标题 -->
    <div class="flex items-center gap-2.5 mb-5">
      <div :class="[isEdit ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600', 'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold']">
        <i :class="isEdit ? 'pi pi-pencil' : 'pi pi-plus'"></i>
      </div>
      <div>
        <h3 class="text-sm font-bold text-slate-800">{{ isEdit ? '编辑道具信息' : '配置新道具' }}</h3>
        <p class="text-[10px] text-slate-400 font-medium">Instance Runtime Configuration</p>
      </div>
    </div>

    <!-- 基础物理数据 -->
    <div class="space-y-4">
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-bold text-slate-500 tracking-wide">道具唯一识别码 (ID)</label>
        <InputText v-model="localItem.id" :disabled="isEdit" placeholder="例如: wpn_002" class="p-inputtext-sm font-mono" />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-bold text-slate-500 tracking-wide">道具显示名称 (Name)</label>
        <InputText v-model="localItem.name" placeholder="例如: 冰霜长弓" class="p-inputtext-sm" />
      </div>
    </div>

    <!-- 装饰性分割线 -->
    <div class="relative my-6">
      <div class="absolute inset-0 flex items-center" aria-hidden="true">
        <div class="w-full border-t border-slate-100"></div>
      </div>
      <div class="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
        <span class="bg-white px-2 text-slate-300">Schema Attributes</span>
      </div>
    </div>

    <!-- 动态 Schema 生成表单区 -->
    <div class="space-y-4 flex-1">
      <div v-for="prop in schema" :key="prop.key" class="flex flex-col gap-1.5 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
        <div class="flex justify-between items-center">
          <label class="text-xs font-bold text-slate-600">{{ prop.label }}</label>
          <span class="text-[9px] font-mono font-bold bg-slate-200/60 text-slate-500 px-1 rounded uppercase tracking-wider">{{ prop.type }}</span>
        </div>

        <!-- 1. 数字类型 -->
        <InputNumber v-if="prop.type === 'number'" v-model="localItem.attributes[prop.key]" :placeholder="String(prop.defaultValue)" class="p-inputtext-sm w-full" />

        <!-- 2. 字符串类型 -->
        <InputText v-if="prop.type === 'string'" v-model="localItem.attributes[prop.key]" :placeholder="String(prop.defaultValue)" class="p-inputtext-sm w-full" />

        <!-- 3. 布尔开关 -->
        <div v-if="prop.type === 'boolean'" class="flex items-center pt-1">
          <ToggleSwitch v-model="localItem.attributes[prop.key]" class="p-toggleswitch-sm" />
          <span class="ml-3 text-xs font-bold" :class="localItem.attributes[prop.key] ? 'text-emerald-600' : 'text-slate-400'">
            {{ localItem.attributes[prop.key] ? 'ENABLED / 启用' : 'DISABLED / 关闭' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 底栏控制按钮 -->
    <div class="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
      <Button label="取消" severity="secondary" variant="text" size="small" class="text-slate-400 font-semibold text-xs" @click="emit('cancel')" />
      <Button :label="isEdit ? '保存修改' : '确认注入'" size="small" :class="[isEdit ? 'bg-amber-500 border-amber-500 shadow-amber-50' : 'bg-indigo-600 border-indigo-600 shadow-indigo-50', 'text-xs font-bold shadow-md']" @click="handleSubmit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import ToggleSwitch from 'primevue/toggleswitch'
import Button from 'primevue/button'

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

const props = defineProps<{
  schema: SchemaItem[];
  itemToEdit?: Item | null;
}>()

const isEdit = ref(false)

const emit = defineEmits<{
  (e: 'submit', item: Item): void;
  (e: 'cancel'): void;
}>()

const localItem = ref<Item>({ id: '', name: '', attributes: {} })

watch(() => props.itemToEdit, (newVal) => {
  if (newVal) {
    isEdit.value = true
    localItem.value = JSON.parse(JSON.stringify(newVal))
  } else {
    isEdit.value = false
    const defaultAttrs: Record<string, any> = {}
    props.schema.forEach(prop => { defaultAttrs[prop.key] = prop.defaultValue })
    localItem.value = { id: '', name: '', attributes: defaultAttrs }
  }
}, { immediate: true })

const handleSubmit = () => {
  if (!localItem.value.id.trim() || !localItem.value.name.trim()) {
    alert('ID 和 名称不能为空！')
    return
  }
  emit('submit', localItem.value)
}
</script>