<script setup lang="ts">
import '../css/styles.css'
import '../css/globals.css'
import footerComponent from '../ui/components/footer_component.vue'

import { onMounted } from 'vue'
import { useRouter } from 'vue-router';
const router = useRouter();

onMounted(() => {
    router.push('/pages/auth')
})
</script>
<template>
    <RouterView />
</template>