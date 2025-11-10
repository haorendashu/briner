<script setup lang="ts">
import '../css/styles.css'
import '../css/globals.css'

import footerComponent from '../ui/components/footer_component.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

onMounted(async () => {
    try {
      // 查询当前激活的标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      
      if (tab && tab.url) {
        const url = new URL(tab.url)
        let appCode = url.origin
        if (appCode) {
          appCode = encodeURIComponent(appCode)
        }
        router.push(`/apps/${appCode}?isAction=true`)
      }
    } catch (error) {
      console.error('获取标签页信息失败:', error)
    }
})
</script>
<template>
  <div class="min-h-screen flex flex-col h-full">
    <div class="flex-1">
      <RouterView />
    </div>
    <footerComponent />
  </div>
</template>