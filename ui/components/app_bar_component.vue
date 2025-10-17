<template>
    <div class="flex items-center container bg-white pt-2 pb-2 pl-3 pr-3">
        <a @click="$router.go(-1)" href="javascript:void(0)" class="mr-4 px-2 font-bold text-xl">&lt;</a>
        <h1 class="text-xl">{{ title }}</h1>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  title: string
}

const props = withDefaults(defineProps<Props>(), {
})

onMounted(() => {
})
</script>

<style scoped>
</style>