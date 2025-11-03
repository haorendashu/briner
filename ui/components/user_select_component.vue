<template>
  <div class="relative">
    <!-- 下拉框触发器 -->
    <div 
      class="flex items-center justify-between p-2 transition-colors"
      :class="disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'"
      @click="!disabled && toggleDropdown()"
    >
      <div class="flex items-center">
        <CircleImageComponent
          v-if="selectedUser"
          imageUrl="/imgs/user_white.png"
          :diameter="32"
          altText="用户头像"
          backgroundColor="#333333"
          class="mr-3"
        />
        <span class="text-gray-700">
          {{ selectedUser ? getDisplayName(selectedUser) : placeholder }}
        </span>
      </div>
      <svg 
        v-if="!disabled"
        class="w-4 h-4 text-gray-500 transition-transform" 
        :class="{ 'rotate-180': isOpen }"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <!-- 下拉菜单 -->
    <div 
      v-if="isOpen && !disabled" 
      class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
    >
      <!-- 搜索框 -->
      <div class="p-2 border-b border-gray-200">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索用户..."
          class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          @click.stop
        />
      </div>

      <!-- 用户列表 -->
      <div v-if="filteredUsers.length > 0">
        <div
          v-for="user in filteredUsers"
          :key="user.pubkey"
          class="flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors"
          @click="selectUser(user)"
        >
          <CircleImageComponent
            imageUrl="/imgs/user_white.png"
            :diameter="32"
            altText="用户头像"
            backgroundColor="#333333"
            class="mr-3"
          />
          <div class="flex-1">
            <div class="font-medium text-gray-800">{{ getDisplayName(user) }}</div>
            <div class="text-sm text-gray-500">
              {{ getUserTypeName(user.keyType) }} • {{ formatTimestamp(user.createdAt) }}
            </div>
          </div>
          <div v-if="selectedUser && selectedUser.pubkey === user.pubkey" class="text-blue-500">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="p-4 text-center text-gray-500">
        {{ searchQuery ? '未找到匹配的用户' : '暂无用户数据' }}
      </div>

      <!-- 添加用户按钮 -->
      <div 
        class="p-3 border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
        @click="addNewUser"
      >
        <div class="flex items-center text-blue-500">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          <span>添加新用户</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { userManager } from '../../business/data/user_manager'
import { KeyType, type User } from '../../business/data/user'
import CircleImageComponent from './circle_image_component.vue'
import { nip19 } from 'nostr-tools'

interface Props {
  modelValue?: string // 选中的用户pubkey
  placeholder?: string
  disabled?: boolean // 新增：是否禁用选择
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', pubkey: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select User',
  disabled: false
})

const emit = defineEmits<Emits>()

const router = useRouter()

// 响应式数据
const isOpen = ref(false)
const searchQuery = ref('')
const users = ref<User[]>([])
const selectedUser = ref<User | null>(null)

// 过滤后的用户列表
const filteredUsers = computed(() => {
  if (!searchQuery.value) {
    return users.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => {
    const displayName = getDisplayName(user).toLowerCase()
    const pubkey = user.pubkey.toLowerCase()
    return displayName.includes(query) || pubkey.includes(query)
  })
})

// 获取用户显示名称
const getDisplayName = (user: User): string => {
  try {
    const npub = nip19.npubEncode(user.pubkey)
    return `${npub.substring(0, 6)}...${npub.substring(npub.length - 6)}`
  } catch {
    return user.pubkey.substring(0, 8) + '...'
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
      return 'Remote'
    case KeyType.HARDWARE:
      return 'Hardware'
    default:
      return 'Unknow'
  }
}

// 格式化时间戳
const formatTimestamp = (timestamp?: number): string => {
  if (!timestamp) return '未知'
  return new Date(timestamp).toLocaleDateString()
}

// 加载用户数据
const loadUsers = async () => {
  try {
    await userManager.initialize()
    users.value = userManager.getAll()
    
    // 设置默认选中的用户
    if (props.modelValue) {
      selectedUser.value = userManager.getByPubkey(props.modelValue) || null
    } else if (users.value.length > 0) {
      selectedUser.value = users.value[0]
      emitSelection()
    }
  } catch (error) {
    console.error('Failed to load users:', error)
  }
}

// 切换下拉框显示状态
const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
  }
}

// 选择用户
const selectUser = (user: User) => {
  if (props.disabled) return
  selectedUser.value = user
  emitSelection()
  isOpen.value = false
  searchQuery.value = ''
}

// 添加新用户
const addNewUser = () => {
  if (props.disabled) return
  isOpen.value = false
  router.push('/users/addUser')
}

// 发射选择事件
const emitSelection = () => {
  if (selectedUser.value) {
    emit('update:modelValue', selectedUser.value.pubkey)
    emit('change', selectedUser.value.pubkey)
  }
}

// 监听外部点击关闭下拉框
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    isOpen.value = false
  }
}

// 监听props变化
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    selectedUser.value = userManager.getByPubkey(newValue) || null
  } else {
    selectedUser.value = null
  }
})

// 组件挂载时加载数据
onMounted(async () => {
  await loadUsers()
  
  // 添加全局点击监听
  document.addEventListener('click', handleClickOutside)
  
  // 设置存储变化监听器
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes['briner_users']) {
      console.log('Storage changed, reloading users...')
      loadUsers()
    }
  })
})

// 组件卸载时清理
import { onUnmounted } from 'vue'
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>