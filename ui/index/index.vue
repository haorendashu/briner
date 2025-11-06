<script lang="ts" setup>
import CircleImageComponent from '../components/circle_image_component.vue'
import AppItemComponent from '../components/app_item_component.vue'
import AuthLogItemComponent from '../components/auth_log_item_component.vue'
import UsernameComponent from '../components/username_component.vue'
import { useRouter } from 'vue-router'
import { userManager } from '../../business/data/user_manager'
import { ref, onMounted } from 'vue'
import { appManager } from '../../business/data/app_manager'
import type { User } from '../../business/data/user'
import type { App } from '../../business/data/app'
import { authLogManager } from '../../business/data/auth_log_manager'
import type { AuthLog } from '../../business/data/auth_log'

const router = useRouter()

// 响应式用户数据
const users = ref<User[]>([])
const userCount = ref(0)

const apps = ref<App[]>([])

const authLogs = ref<AuthLog[]>([])

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

const toAddUser = () => {
    router.push('/users/addUser')
}

const loadApps = async () => {
    try {
        await appManager.initialize()
        let allApps = appManager.getAll()
        if (allApps.length > 5) {
            allApps = allApps.slice(0, 5)
        }
        apps.value = allApps
    } catch (e) {
        console.error('Failed to load apps:', e)
    }
}

const loadAuthLogs = async () => {
    try {
        authLogs.value = await authLogManager.getRecent(1, 10)
    } catch (error) {
        console.error('Failed to load auth logs:', error)
    }
}

// 组件挂载时加载数据
onMounted(async () => {
    // 设置存储变化监听器
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes['briner_users']) {
            console.log('Storage changed, reloading users...')
            loadUsers()
        } else if (namespace === 'local' && changes['briner_apps']) {
            console.log('Storage changed, reloading users...')
            loadApps()
        }
    })
    
    await loadUsers()
    await loadApps()
    await loadAuthLogs()
})
</script>

<template>
    <div v-if="users.length > 0" class="container">
        <div class="flex pl-4 pr-4 pt-4 items-center" v-on:click="toUsersPage">
            <CircleImageComponent
                imageUrl="/imgs/user_white.png"
                :diameter="50"
                altText="用户头像"
                class="ml-4"
                backgroundColor="#333333"
            />
            <div class="ml-4 text-lg">
                <UsernameComponent :pubkey="users[0].pubkey" />
            </div>
        </div>
        <div v-if="users.length > 1" class="card mt-4" v-on:click="toUsersPage">
            <div class="flex items-center pl-4 pr-4">
                <div v-for="user in users" class="mr-2 flex items-center">
                    <CircleImageComponent 
                        imageUrl="/imgs/user_white.png"
                        :diameter="30"
                        altText="用户头像"
                        backgroundColor="#333333"
                    />
                </div>
                <div class="ml-auto">
                    <p class="text-lg">&gt;</p>
                </div>
            </div>
        </div>
    </div>
    <div v-if="users.length <= 0" class="container mt-4 pl-4">
        <div class="text-left">
            <p class="text-lg font-bold ml-4" v-on:click="toAddUser">Click and Login</p>
        </div>
    </div>

    <div class="container">
        <div class="card mt-4">
            <AppItemComponent v-for="app in apps" :app="app" />

            <div class="item justify-center">
                <RouterLink to="/apps" class="mr-4">Show more apps</RouterLink>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="card mt-4">
            <AuthLogItemComponent v-for="authLog in authLogs" :authLog="authLog" />

            <div class="item justify-center">
                <RouterLink to="/logs" class="mr-4">Show more logs</RouterLink>
            </div>
        </div>
    </div>
</template>