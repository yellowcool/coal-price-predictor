<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  coal: {
    type: Object,
    required: true
  }
})

const chartContainer = ref(null)
let chartInstance = null

const isPositive = computed(() => props.coal.change >= 0)

const formatPrice = (price) => {
  return price != null ? price.toLocaleString('zh-CN') : '-'
}

const initChart = () => {
  if (!chartContainer.value) return
  
  chartInstance = echarts.init(chartContainer.value)
  
  const historyData = props.coal.history || []
  const forecastData = props.coal.forecast || []
  
  const historyDates = historyData.map(item => item.date)
  const historyPrices = historyData.map(item => item.price)
  
  const lastHistoryDate = historyDates[historyDates.length - 1]
  const lastHistoryPrice = historyPrices[historyPrices.length - 1]
  
  const forecastDates = forecastData.map(item => item.date)
  const forecastPrices = forecastData.map(item => item.price)
  
  const allDates = [...historyDates, lastHistoryDate, ...forecastDates]
  const allPrices = [...historyPrices, lastHistoryPrice, ...forecastPrices]
  
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151'
      },
      formatter: (params) => {
        let result = `<div style="font-weight: 600; margin-bottom: 4px;">${params[0].axisValue}</div>`
        params.forEach(param => {
          const color = param.seriesName === '预测' ? '#F59E0B' : '#1E3A5F'
          result += `<div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color};"></span>
            <span>${param.seriesName}: </span>
            <span style="font-weight: 600;">${param.value} 元/吨</span>
          </div>`
        })
        return result
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: allDates,
      axisLine: {
        lineStyle: { color: '#e5e7eb' }
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 10,
        interval: Math.floor(allDates.length / 6)
      },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLine: { show: false },
      axisLabel: {
        color: '#6b7280',
        fontSize: 10,
        formatter: '{value}'
      },
      splitLine: {
        lineStyle: { color: '#f3f4f6' }
      }
    },
    series: [
      {
        name: '历史',
        type: 'line',
        data: [...historyPrices, null],
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: '#1E3A5F',
          width: 2
        },
        itemStyle: {
          color: '#1E3A5F'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(30, 58, 95, 0.2)' },
            { offset: 1, color: 'rgba(30, 58, 95, 0.02)' }
          ])
        }
      },
      {
        name: '当前',
        type: 'line',
        data: [...Array(historyPrices.length - 1).fill(null), lastHistoryPrice, lastHistoryPrice],
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: '#1E3A5F',
          width: 2
        },
        itemStyle: {
          color: '#1E3A5F',
          borderWidth: 2,
          borderColor: '#fff'
        }
      },
      {
        name: '预测',
        type: 'line',
        data: [...Array(allPrices.length - forecastPrices.length).fill(null), lastHistoryPrice, ...forecastPrices],
        smooth: true,
        symbol: 'diamond',
        symbolSize: 8,
        lineStyle: {
          color: '#F59E0B',
          width: 2,
          type: 'dashed'
        },
        itemStyle: {
          color: '#F59E0B'
        }
      }
    ]
  }
  
  chartInstance.setOption(option)
}

const handleResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})

watch(() => props.coal, () => {
  initChart()
}, { deep: true })
</script>

<template>
  <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
    <!-- Card Header -->
    <div class="bg-gradient-to-r from-primary to-primary/80 px-5 py-4">
      <h2 class="text-xl font-semibold text-white">{{ coal.name }}</h2>
    </div>

    <!-- Current Price Section -->
    <div class="px-5 pt-5 pb-3 border-b border-gray-100">
      <div class="flex items-baseline justify-between mb-2">
        <span class="text-gray-500 text-sm">当前旬均价</span>
        <span 
          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
          :class="isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
        >
          <span class="mr-1">{{ isPositive ? '↑' : '↓' }}</span>
          {{ Math.abs(coal.change).toFixed(2) }}%
        </span>
      </div>
      <div class="text-3xl font-bold text-primary">
        {{ formatPrice(coal.currentPrice) }}
        <span class="text-base font-normal text-gray-400 ml-1">元/吨</span>
      </div>
    </div>

    <!-- Decade Prices -->
    <div class="px-5 py-4 border-b border-gray-100">
      <div class="grid grid-cols-3 gap-2 text-center">
        <div class="p-2 bg-gray-50 rounded-lg">
          <div class="text-xs text-gray-500 mb-1">上旬</div>
          <div class="text-sm font-semibold text-gray-800">{{ formatPrice(coal.prices?.early) }}</div>
        </div>
        <div class="p-2 bg-gray-50 rounded-lg">
          <div class="text-xs text-gray-500 mb-1">中旬</div>
          <div class="text-sm font-semibold text-gray-800">{{ formatPrice(coal.prices?.middle) }}</div>
        </div>
        <div class="p-2 bg-gray-50 rounded-lg">
          <div class="text-xs text-gray-500 mb-1">下旬</div>
          <div class="text-sm font-semibold text-gray-800">{{ formatPrice(coal.prices?.late) }}</div>
        </div>
      </div>
    </div>

    <!-- High/Low Prices -->
    <div class="px-5 py-3 border-b border-gray-100 flex justify-between text-sm">
      <div>
        <span class="text-gray-500">最高价</span>
        <span class="ml-2 font-semibold text-red-500">{{ formatPrice(coal.high) }}</span>
      </div>
      <div>
        <span class="text-gray-500">最低价</span>
        <span class="ml-2 font-semibold text-green-500">{{ formatPrice(coal.low) }}</span>
      </div>
    </div>

    <!-- Chart -->
    <div class="px-3 py-3">
      <div ref="chartContainer" class="w-full h-48"></div>
    </div>
  </div>
</template>
