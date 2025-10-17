<script lang="ts" setup>
import CircleImageComponent from '../components/circle_image_component.vue'
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
        <div class="card flex items-center">
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
            <div class="item item-border">
                <div class="font-bold">
                    APP 名称
                </div>
                <div class="ml-auto">
                    <p class="text-lg">&gt;</p>
                </div>
            </div>
            
            <div class="item item-border">
                <div class="font-bold">
                    APP 名称
                </div>
                <div class="ml-auto">
                    <p class="text-lg">&gt;</p>
                </div>
            </div>
            
            <div class="item item-border">
                <div class="font-bold">
                    APP 名称
                </div>
                <div class="ml-auto">
                    <p class="text-lg">&gt;</p>
                </div>
            </div>

            <div class="item justify-center">
                <a class="underline" href="javascript:void(0)">Show more apps</a>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="card mt-4">
            <div class="item item-border">
                <div class="w-1/4">
                    https://www.baidu.com/
                </div>
                <div class="mr-4">
                    <div class="bg-green-500 auth_result">
                        Approve
                    </div>
                </div>
                <div class="w-auto">
                    <p>This is the auth contnet description.</p>
                </div>
                <div class="ml-auto">
                    <p class="text-lg">&gt;</p>
                </div>
            </div>
            
            <div class="item item-border">
                <div class="w-1/4">
                    https://www.baidu.com/
                </div>
                <div class="mr-4">
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
            
            <div class="item item-border">
                <div class="w-1/4">
                    https://www.baidu.com/
                </div>
                <div class="mr-4">
                    <div class="bg-green-500 auth_result">
                        Approve
                    </div>
                </div>
                <div class="w-auto">
                    <p>This is the auth contnet description.</p>
                </div>
                <div class="ml-auto">
                    <p class="text-lg">&gt;</p>
                </div>
            </div>

            <div class="item justify-center">
                <a class="underline" href="javascript:void(0)">Show more auth logs</a>
            </div>
        </div>
    </div>
</template>