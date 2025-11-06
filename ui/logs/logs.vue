<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import AppBarComponent from '../components/app_bar_component.vue'
import AuthLogItemComponent from '../components/auth_log_item_component.vue'
import type { AuthLog } from '../../business/data/auth_log';
import { authLogManager } from '../../business/data/auth_log_manager';

const authLogs = ref<AuthLog[]>([])
const currentPage = ref(1)
const pageSize = ref(50)
const totalLogs = ref(0)
const isLoading = ref(false)

const loadAuthLogs = async () => {
    try {
        isLoading.value = true
        await authLogManager.initialize()
        
        // 获取当前页的日志
        const logs = await authLogManager.getRecent(currentPage.value, pageSize.value)
        authLogs.value = logs
        
        // 获取总日志数用于分页
        totalLogs.value = await authLogManager.getCount()
        
    } catch (e) {
        console.error('Failed to load auth logs:', e)
    } finally {
        isLoading.value = false
    }
}

const nextPage = () => {
    if (currentPage.value * pageSize.value < totalLogs.value) {
        currentPage.value++
        loadAuthLogs()
    }
}

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--
        loadAuthLogs()
    }
}

const goToPage = (page: number) => {
    if (page >= 1 && page <= Math.ceil(totalLogs.value / pageSize.value)) {
        currentPage.value = page
        loadAuthLogs()
    }
}

onMounted(async () => {
    await loadAuthLogs()
    
    // 设置存储变化监听器
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes['briner_auth_logs']) {
            console.log('Storage changed, reloading auth logs...')
            loadAuthLogs()
        }
    })
})
</script>
<template>
    <AppBarComponent title="Auth Logs"></AppBarComponent>
    <div class="container mb-4">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="card mt-4 text-center py-4">
            <p>Loading logs...</p>
        </div>
        
        <!-- 日志列表 -->
        <div v-else class="card mt-4">
            <div v-if="authLogs.length === 0" class="text-center py-4">
                <p>No authentication logs found.</p>
            </div>
            <AuthLogItemComponent 
                v-else
                v-for="(log, index) in authLogs" 
                :key="log.id" 
                :authLog="log" 
                :isLast="index === authLogs.length - 1" 
            />
        </div>
        
        <!-- 分页控件 -->
        <div v-if="authLogs.length > 0" class="flex justify-between items-center mt-4">
            <button 
                @click="prevPage" 
                :disabled="currentPage === 1"
                class="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
            >
                Previous
            </button>
            
            <div class="flex space-x-2">
                <span class="px-3 py-2">Page {{ currentPage }} of {{ Math.ceil(totalLogs / pageSize) }}</span>
            </div>
            
            <button 
                @click="nextPage" 
                :disabled="currentPage * pageSize >= totalLogs"
                class="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
            >
                Next
            </button>
        </div>
    </div>
</template>