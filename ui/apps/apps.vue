<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import AppBarComponent from '../components/app_bar_component.vue'
import AppItemComponent from '../components/app_item_component.vue'
import type { App } from '../../business/data/app';
import { appManager } from '../../business/data/app_manager';

const apps = ref<App[]>([])

const loadApps = async () => {
    try {
        await appManager.initialize()
        let allApps = appManager.getAll()
        if (allApps.length > 5) {
            allApps = allApps.slice(0, 5)
        }
        apps.value = allApps
    }catch (e) {
        console.error('Failed to load apps:', e)
    }
}

onMounted(async () => {
    await loadApps()
    
    // 设置存储变化监听器
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes['briner_users']) {
            console.log('Storage changed, reloading users...')
            loadApps()
        }
    })
})
</script>
<template>
    <AppBarComponent title="Apps"></AppBarComponent>
    <div class="container mb-4">
        <div class="card mt-4">
            <AppItemComponent v-for="(app, index) in apps" :app="app" :isLast="index === apps.length - 1" />
        </div>
    </div>
</template>