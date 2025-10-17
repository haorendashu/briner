<template>
    <div class="item item-border" v-on:click="handleClick">
        <div class="font-bold">
            APP 名称
        </div>
        <div class="ml-auto">
            <p class="text-lg">&gt;</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router';
const router = useRouter();

// 定义组件props
interface Props {
//   imageUrl: string
}

// 监听图片URL变化
onMounted(() => {
//   img.src = props.imageUrl
})

const handleClick = () => {
    router.push('/apps/123');
}
</script>

<style scoped>
</style>