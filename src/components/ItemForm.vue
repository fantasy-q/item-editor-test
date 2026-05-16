<template>
  <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm max-w-md w-full">
    <h3 class="text-lg font-bold text-gray-800 mb-4">
      {{ isEdit ? '编辑道具' : '添加道具' }}
    </h3>

    <!-- 基础属性（所有道具固定拥有的） -->
    <div class="flex flex-col gap-4 mb-6">
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-semibold text-gray-600">道具 ID</label>
        <InputText v-model="localItem.id" :disabled="isEdit" placeholder="例如: wpn_002" class="w-full" />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-semibold text-gray-600">道具名称</label>
        <InputText v-model="localItem.name" placeholder="例如: 冰霜弓" class="w-full" />
      </div>
    </div>

    <div class="border-t border-gray-100 my-4"></div>

    <!-- 动态属性区：根据 Schema 自动渲染 -->
    <div class="flex flex-col gap-4 mb-6">
      <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wider">自定义属性</h4>
      
      <div v-for="prop in schema" :key="prop.key" class="flex flex-col gap-1.5">
        <label class="text-sm font-semibold text-gray-600">{{ prop.label }}</label>

        <!-- 情况 A: 数字类型 -->
        <InputNumber 
          v-if="prop.type === 'number'" 
          v-model="localItem.attributes[prop.key]" 
          :placeholder="String(prop.defaultValue)"
          class="w-full" 
        />

        <!-- 情况 B: 字符串类型 -->
        <InputText 
          v-if="prop.type === 'string'" 
          v-model="localItem.attributes[prop.key]" 
          :placeholder="String(prop.defaultValue)"
          class="w-full" 
        />

        <!-- 情况 C: 布尔类型 -->
        <div v-if="prop.type === 'boolean'" class="flex items-center h-10">
          <ToggleSwitch v-model="localItem.attributes[prop.key]" />
          <span class="ml-3 text-sm text-gray-500">
            {{ localItem.attributes[prop.key] ? '是' : '否' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 提交按钮 -->
    <div class="flex justify-end gap-3">
      <Button label="取消" severity="secondary" variant="text" @click="emit('cancel')" />
      <Button :label="isEdit ? '保存修改' : '确认添加'" @click="handleSubmit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import ToggleSwitch from 'primevue/toggleswitch'
import Button from 'primevue/button'

// 复用我们在 App.vue 中定义的类型
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

// 定义组件的 Props
const props = defineProps<{
  schema: SchemaItem[];
  itemToEdit?: Item | null; // 如果有传入，代表是编辑模式；否则是新增模式
}>()

const isEdit = ref(false)

// 定义组件向外派发的事件
const emit = defineEmits<{
  (e: 'submit', item: Item): void;
  (e: 'cancel'): void;
}>()

// 创建本地代理对象，避免直接污染全局 Store/State
const localItem = ref<Item>({
  id: '',
  name: '',
  attributes: {}
})

// 监听编辑目标，初始化表单数据
watch(() => props.itemToEdit, (newVal) => {
  if (newVal) {
    isEdit.value = true
    // 深拷贝，防止未点击保存就影响到列表展示
    localItem.value = JSON.parse(JSON.stringify(newVal))
  } else {
    isEdit.value = false
    // 新增模式：根据 Schema 自动填充默认值
    const defaultAttrs: Record<string, any> = {}
    props.schema.forEach(prop => {
      defaultAttrs[prop.key] = prop.defaultValue
    })
    
    localItem.value = {
      id: '',
      name: '',
      attributes: defaultAttrs
    }
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