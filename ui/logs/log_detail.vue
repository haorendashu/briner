<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppBarComponent from '../components/app_bar_component.vue'
import type { AuthLog } from '../../business/data/auth_log';
import { authLogManager } from '../../business/data/auth_log_manager'
import { AuthType, getAuthName } from '../../business/consts/auth_type'
import { AuthResult } from '../../business/consts/auth_result'

const route = useRoute()
const router = useRouter()
const authLog = ref<AuthLog>()
const isLoading = ref(false)

const getAuthTypeName = (authType: number | undefined) => {
    if (authType === undefined) return 'Unknown'
    return getAuthName(authType as AuthType)
}

const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'Unknown'
    return new Date(timestamp).toLocaleString()
}

const getResultBadgeClass = (result: number | undefined) => {
    if (result === AuthResult.OK) {
        return 'bg-green-500'
    } else if (result === AuthResult.REJECT) {
        return 'bg-red-500'
    }
    return 'bg-gray-500'
}

const getResultText = (result: number | undefined) => {
    if (result === AuthResult.OK) {
        return 'Approved'
    } else if (result === AuthResult.REJECT) {
        return 'Rejected'
    }
    return 'Unknown'
}

onMounted(async () => {
    try {
        isLoading.value = true
        const logId = route.params.id as string
        
        await authLogManager.initialize()
        
        // 从已加载的日志中查找，或者添加新的查询方法
        const allLogs = await authLogManager.getRecent(1, 1000)
        const foundLog = allLogs.find(log => log.id === Number(logId))
        
        if (foundLog) {
            authLog.value = foundLog
        } else {
            console.error('Log not found:', logId)
        }
    } catch (e) {
        console.error('Failed to load auth log:', e)
    } finally {
        isLoading.value = false
    }
})

const goBack = () => {
    router.back()
}
</script>

<template>
    <AppBarComponent title="Log Detail"></AppBarComponent>
    <div class="container mb-4">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="card mt-4 text-center py-4">
            <p>Loading log details...</p>
        </div>
        
        <!-- 日志详情 -->
        <div v-else-if="authLog" class="card mt-4">
            <!-- 结果状态 -->
            <div class="item">
                <div class="flex-1">
                    <p class="text-sm text-gray-500">Result</p>
                    <p class="text-lg font-semibold">{{ getResultText(authLog.authResult) }}</p>
                </div>
                <div :class="[getResultBadgeClass(authLog.authResult), 'px-3 py-1 rounded-full text-white text-sm font-semibold']">
                    {{ getResultText(authLog.authResult) }}
                </div>
            </div>

            <!-- App Code -->
            <div class="item border-t">
                <div class="flex-1">
                    <p class="text-sm text-gray-500">App Code</p>
                    <p class="text-lg font-semibold break-all">{{ authLog.appCode }}</p>
                </div>
            </div>

            <!-- Auth Type -->
            <div class="item border-t">
                <div class="flex-1">
                    <p class="text-sm text-gray-500">Auth Type</p>
                    <p class="text-lg font-semibold">{{ getAuthTypeName(authLog.authType) }}</p>
                </div>
            </div>

            <!-- Event Kind (if applicable) -->
            <div v-if="authLog.eventKind" class="item border-t">
                <div class="flex-1">
                    <p class="text-sm text-gray-500">Event Kind</p>
                    <p class="text-lg font-semibold">{{ authLog.eventKind }}</p>
                </div>
            </div>

            <!-- Content -->
            <div v-if="authLog.content" class="item border-t">
                <div class="flex-1">
                    <p class="text-sm text-gray-500">Content</p>
                    <p class="text-lg font-semibold break-all">{{ authLog.content }}</p>
                </div>
            </div>

            <!-- Timestamp -->
            <div class="item border-t">
                <div class="flex-1">
                    <p class="text-sm text-gray-500">Time</p>
                    <p class="text-lg font-semibold">{{ formatDate(authLog.createdAt) }}</p>
                </div>
            </div>
        </div>

        <!-- 未找到日志 -->
        <div v-else class="card mt-4 text-center py-4">
            <p>Log not found.</p>
        </div>

        <!-- 返回按钮 -->
        <div class="flex justify-center mt-4">
            <button 
                @click="goBack"
                class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
                Go Back
            </button>
        </div>
    </div>
</template>

<style scoped>
.item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    gap: 12px;
}

.break-all {
    word-break: break-all;
}
</style>
