<template>
    <div class="flex items-center justify-between container bg-white p-3 rounded-br-2xl rounded-bl-2xl">
        <div class="flex items-center">
            <a v-if="showBack == 'true'" @click="$router.go(-1)" href="javascript:void(0)" class="px-2 font-bold text-xl"><</a>
            <h1 class="ml-4 text-xl">{{ title }}</h1>
        </div>
        <div class="flex items-center">
            <slot name="right"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  title: string
  showBack?: string
}

const props = withDefaults(defineProps<Props>(), {
  showBack: "true"
})

onMounted(() => {
})
</script>

<style scoped>
</style>