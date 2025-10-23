<script lang="ts" setup>
import AppBarComponent from '../components/app_bar_component.vue'
import { userManager } from '../../business/data/user_manager'
import { KeyType, User } from '../../business/data/user'
import { ref, onMounted } from 'vue'

// 响应式数据
const users = ref<User[]>([])
const userCount = ref(0)
const isLoading = ref(false)

// 加载用户数据
const loadUsers = async () => {
  isLoading.value = true
  try {
    await userManager.initialize()
    users.value = userManager.getAll()
    userCount.value = userManager.getCount()
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    isLoading.value = false
  }
}

// 删除用户
const deleteUser = async (pubkey: string) => {
  if (confirm(`确定要删除用户 ${pubkey} 吗？`)) {
    try {
      const success = await userManager.delete(pubkey)
      if (success) {
        await loadUsers()
      } else {
        alert('删除用户失败')
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('删除用户失败')
    }
  }
}

// 获取用户类型名称
const getUserTypeName = (keyType: number): string => {
  switch (keyType) {
    case KeyType.NPUB:
      return 'NPUB'
    case KeyType.NSEC:
      return 'NSEC'
    case KeyType.REMOTE:
      return '远程'
    case KeyType.HARDWARE:
      return '硬件'
    default:
      return '未知'
  }
}

// 格式化时间戳
const formatTimestamp = (timestamp?: number): string => {
  if (!timestamp) return '未知'
  return new Date(timestamp).toLocaleString()
}

// 组件挂载时加载数据
onMounted(async () => {
  await loadUsers()
  
  // 设置存储变化监听器
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes['briner_users']) {
      console.log('Storage changed, reloading users...')
      loadUsers()
    }
  })
})
</script>

<template>
    <AppBarComponent title="Users">
        <template #right>
            <RouterLink to="/users/addUser" class="px-2 font-bold text-xl">+</RouterLink>
        </template>
    </AppBarComponent>
    <div class="container mt-4 mb-4">
        <!-- 用户列表 -->
        <div class="card">
            <div v-if="isLoading" class="text-center py-4">
                加载中...
            </div>
            <div v-else-if="users.length === 0" class="text-center py-4 text-gray-500">
                暂无用户数据
            </div>
            <div v-else class="space-y-3">
                <div 
                    v-for="user in users" 
                    :key="user.pubkey"
                    class="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
                >
                    <div class="flex-1">
                        <div class="font-medium">{{ user.pubkey }}</div>
                        <div class="text-sm text-gray-600">
                            类型: {{ getUserTypeName(user.keyType) }} | 
                            创建时间: {{ formatTimestamp(user.createdAt) }}
                        </div>
                    </div>
                    <button 
                        @click="deleteUser(user.pubkey)" 
                        class="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                        删除
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>