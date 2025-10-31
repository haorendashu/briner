<script lang="ts" setup>
import { ref } from 'vue'
import { onMounted } from 'vue'
import UserSelectComponent from '../components/user_select_component.vue'
import { ConnectType } from '../../business/consts/connect_type'
import { OtherMessageType } from '../../business/consts/other_message_type';

let origin = '';
let requestId = '';
let connectType = ref(ConnectType.REASONABLE)

onMounted(() => {
    let qs = new URLSearchParams(location.search)
    origin = qs.get('origin') || ''
    requestId = qs.get('requestId') || ''
})

const selectedUserPubkey = ref('')
const handleUserChange = (pubkey: string) => {
  console.log('选中的用户:', pubkey)
}

const selectType = (t: ConnectType) => {
    connectType.value = t
}

const submit = (confirm: boolean) => {
    console.log('connectType:', connectType.value)
    let message = {
        origin: origin,
        requestId: requestId,
        pubkey: selectedUserPubkey.value,
        type: OtherMessageType.CONNECTION_RESULT,
        connectType: -1,
    }
    if (confirm) {
        message.connectType = connectType.value   
    }
    chrome.runtime.sendMessage(message)

    window.close()
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
            <h1 class="text-xl font-bold">App Connect</h1>
        </div>

        <div class="mt-6">
            <div class="card">
                <div class="mt-2 mb-2">
                    <h2 class="font-bold">{{ origin }}</h2>
                </div>
            </div>
        </div>

        <div class="mt-6 pl-4">
            <div class="flex content-center cursor-pointer" v-on:click="selectType(1)">
                <input type="radio" id="one" value="1" v-model="connectType" class="mr-4" />
                <div>
                    <p class="text-base">Fully Trust</p>
                    <p class="text-cyan mt-1">I fully trust it<br/>Auto-sign all requests (except payments)</p>
                </div>
            </div>
            <div class="flex content-center cursor-pointer mt-3" v-on:click="selectType(2)">
                <input type="radio" id="one" value="2" v-model="connectType" class="mr-4" />
                <div>
                    <p class="text-base">Reasonable</p>
                    <p class="text-cyan mt-1">Let's be reasonable<br/>Auto-approve most common requests</p>
                </div>
            </div>
            <div class="flex content-center cursor-pointer mt-3" v-on:click="selectType(3)">
                <input type="radio" id="one" value="3" v-model="connectType" class="mr-4" />
                <div>
                    <p class="text-base">Always Reject</p>
                    <p class="text-cyan mt-1">I'm a bit paranoid<br/>Do not sign anything without asking me!</p>
                </div>
            </div>
        </div>

        <div class="flex justify-end mt-12">
            <button class="bg-red-500 text-white px-4 py-2 rounded-2xl mr-2" v-on:click="submit(false)">Cancel</button>
            <button class="bg-green-500 text-white px-4 py-2 rounded-2xl" v-on:click="submit(true)">Confirm</button>
        </div>

    </div>
    
</template>
<style>
hr {
    color: grey;
}
</style>