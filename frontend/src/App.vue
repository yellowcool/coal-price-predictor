<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import CoalCard from './components/CoalCard.vue'

const coalData = ref([])
const updateTime = ref('')
const loading = ref(true)
const error = ref(null)

const fetchData = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/all-data')
    coalData.value = response.data.coalTypes
    updateTime.value = response.data.updateTime
  } catch (err) {
    error.value = '数据加载失败，请稍后重试'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="min-h-screen bg-light-bg">
    <!-- Header -->
    <header class="bg-primary text-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 py-5">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 class="text-2xl sm:text-3xl font-bold">煤价预测系统</h1>
          <div class="text-sm text-gray-300">
            <span>数据更新: </span>
            <span class="text-accent font-medium">{{ updateTime || '加载中...' }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-6">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <span class="ml-4 text-gray-500">加载数据中...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-20">
        <div class="text-red-500 text-lg mb-4">{{ error }}</div>
        <button 
          @click="fetchData" 
          class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition"
        >
          重试
        </button>
      </div>

      <!-- Coal Cards Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <CoalCard 
          v-for="coal in coalData" 
          :key="coal.id" 
          :coal="coal" 
        />
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t mt-8 py-4">
      <div class="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
        © 2026 煤价预测系统 | 数据仅供参考
      </div>
    </footer>
  </div>
</template>
