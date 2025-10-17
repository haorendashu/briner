<template>
    <div class="item item-border">
        <div class="w-1/4">
            https://www.baidu.com/
        </div>
        <div class="mr-4">
            <!-- <div class="bg-green-500 auth_result">
                Approve
            </div> -->
            <div class="bg-red-500 auth_result">
                Reject
            </div>
        </div>
        <div class="w-auto">
            <p>This is the auth contnet description.</p>
        </div>
        <div class="ml-auto">
            <p class="text-lg">&gt;</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 定义组件props
interface Props {
//   imageUrl: string
}

// 监听图片URL变化
onMounted(() => {
//   img.src = props.imageUrl
})
</script>

<style scoped>
</style>