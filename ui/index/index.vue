<script lang="ts" setup>
import CircleImageComponent from '../components/circle_image_component.vue'
import AppItemComponent from '../components/app_item_component.vue'
import AuthLogItemComponent from '../components/auth_log_item_component.vue'
import { useRouter } from 'vue-router'
import { userManager } from '../../business/data/user_manager'
import { ref, onMounted } from 'vue'

const router = useRouter()

// 响应式用户数据
const users = ref<any[]>([])
const userCount = ref(0)

const toUsersPage = () => {
    router.push('/users')
}

// 加载用户数据
const loadUsers = async () => {
    try {
        await userManager.initialize()
        users.value = userManager.getAll()
        userCount.value = userManager.getCount()
    } catch (error) {
        console.error('Failed to load users:', error)
    }
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
    <div class="container">
        <div class="flex p-4 items-center">
            <CircleImageComponent 
                imageUrl="https://gips3.baidu.com/it/u=2776647388,3101487920&fm=3074&app=3074&f=PNG?w=2048&h=2048"
                :diameter="50"
                altText="用户头像"
                class="ml-4"
            />
            <div class="ml-4 text-lg">
                用户名
            </div>
        </div>
        <div class="card flex items-center" v-on:click="toUsersPage">
            <div class="ml-4 mr-4 flex items-center">
                <CircleImageComponent 
                    imageUrl="https://gips3.baidu.com/it/u=2776647388,3101487920&fm=3074&app=3074&f=PNG?w=2048&h=2048"
                    :diameter="30"
                    altText="用户头像"
                />
            </div>
            <div class="mr-4 flex items-center">
                <CircleImageComponent 
                    imageUrl="https://q2.itc.cn/q_70/images03/20250225/e8117dd40aae4db5a64461f1ea0d16fc.jpeg"
                    :diameter="30"
                    altText="用户头像"
                />
            </div>
            <div class="ml-auto mr-4">
                <p class="text-lg">&gt;</p>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="card mt-4">
            <AppItemComponent />
            <AppItemComponent />
            <AppItemComponent />
            <AppItemComponent />
            <AppItemComponent />
            <AppItemComponent />

            <div class="item justify-center">
                <RouterLink to="/apps" class="mr-4">Show more apps</RouterLink>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="card mt-4">
            <AuthLogItemComponent />
            <AuthLogItemComponent />
            <AuthLogItemComponent />
            <AuthLogItemComponent />
            <AuthLogItemComponent />
            <AuthLogItemComponent />

            <div class="item justify-center">
                <RouterLink to="/logs" class="mr-4">Show more logs</RouterLink>
            </div>
        </div>
    </div>
</template>