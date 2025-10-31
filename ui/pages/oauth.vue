<script lang="ts" setup>
import { ref } from 'vue'
import { onMounted } from 'vue'
import UserSelectComponent from '../components/user_select_component.vue'
import { ConnectType } from '../../business/consts/connect_type'

let origin = '';
let requestId = '';
let authType = '';
let eventKind = '';
let params = ''
let always = ref(false)
let showMore = ref(false)

onMounted(() => {
    let qs = new URLSearchParams(location.search)
    origin = qs.get('origin') || ''
    requestId = qs.get('requestId') || ''
    authType = qs.get('authType') || ''
    eventKind = qs.get('eventKind') || ''
    params = qs.get('params') || ''
})

const selectedUserPubkey = ref('')
const handleUserChange = (pubkey: string) => {
  console.log('选中的用户:', pubkey)
}

</script>
<template>
    <div class="pl-4 pr-4 pt-4 pb-2">
        <UserSelectComponent 
            v-model="selectedUserPubkey"
            placeholder="选择用户"
            @change="handleUserChange"
        />
    </div>

    <hr />

    <div class="pl-4 pr-4">
        <div class="container mt-6 text-center">
            <h1 class="text-xl font-bold">Sign Event</h1>
        </div>

        <div class="mt-6">
            <div class="card">
                <div class="mt-2 mb-2">
                    <h2 class="font-bold">{{ origin }}</h2>
                </div>
            </div>
        </div>

        <div class="mt-6 pl-4 mb-2">
            <p class="text-center" v-on:click="showMore = !showMore">detail <template v-if="showMore">&#9650;</template><template v-else>&#9660;</template></p>
        </div>
        <div v-if="!showMore" class="h-30"></div>
        <div v-if="showMore" class="h-30 p-2 bg-gray-300 rounded-md overflow-hide">
            {{ params }}
        </div>

        <div class="mt-6">
            <input type="checkbox" id="always" value="true" v-model="always" class="mr-2" />
            <label for="always">Always</label>
        </div>

        <div class="flex justify-end mt-12">
            <button class="bg-red-500 text-white px-4 py-2 rounded-2xl mr-2">Cancel</button>
            <button class="bg-green-500 text-white px-4 py-2 rounded-2xl">Confirm</button>
        </div>

    </div>
    
</template>
<style>
hr {
    color: grey;
}
</style>