<template>
    <div :class="isLast ? 'item' : 'item item-border'" v-on:click="handleClick">
        <div class="font-bold">
            {{ app.name ? app.name : app.code }}
        </div>
        <div class="ml-auto">
            <p class="text-lg">></p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { App } from '../../business/data/app';
const router = useRouter()

// 定义组件props
interface Props {
  app: App,
  isLast?: boolean
}

// 定义props
const props = withDefaults(defineProps<Props>(), {
  isLast: false,
})

// 监听图片URL变化
onMounted(() => {
//   img.src = props.imageUrl
})

const handleClick = () => {
    router.push(`/apps/${props.app.code}`);
}
</script>

<style scoped>
</style>