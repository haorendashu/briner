<template>
  <div 
    class="circle-image-container"
    :style="{
      width: `${diameter}px`,
      height: `${diameter}px`
    }"
  >
    <img
      :src="imageUrl"
      :alt="altText"
      class="circle-image rounded-full object-cover"
      :style="{
        width: '100%',
        height: '100%'
      }"
      @error="handleImageError"
    />
    <!-- 加载状态 -->
    <div 
      v-if="isLoading" 
      class="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-full"
    >
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
    </div>
    <!-- 错误状态 -->
    <div 
      v-else-if="hasError" 
      class="absolute inset-0 flex items-center justify-center bg-gray-300 rounded-full"
    >
      <span class="text-gray-500 text-sm">图片加载失败</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 定义组件props
interface Props {
  imageUrl: string
  diameter?: number
  altText?: string
}

const props = withDefaults(defineProps<Props>(), {
  diameter: 100,
  altText: '圆形图片'
})

// 响应式数据
const isLoading = ref(true)
const hasError = ref(false)

// 图片加载处理
const handleImageLoad = () => {
  isLoading.value = false
  hasError.value = false
}

const handleImageError = () => {
  isLoading.value = false
  hasError.value = true
}

// 监听图片URL变化
onMounted(() => {
  const img = new Image()
  img.onload = handleImageLoad
  img.onerror = handleImageError
  img.src = props.imageUrl
})
</script>

<style scoped>
.circle-image-container {
  position: relative;
  display: inline-block;
  overflow: hidden;
}

.circle-image {
  transition: opacity 0.3s ease;
}

.circle-image-container:hover .circle-image {
  opacity: 0.9;
}
</style>