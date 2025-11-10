<script lang="ts" setup>
import { ref } from 'vue'
import { onMounted } from 'vue'
import UserSelectComponent from '../components/user_select_component.vue'
import { ConnectType } from '../../business/consts/connect_type'
import { appManager } from '../../business/data/app_manager';
import { AuthType, AuthTypeNames } from '../../business/consts/auth_type';
import { OtherMessageType } from '../../business/consts/other_message_type';

let origin = '';
let requestId = '';
let authType =  -1;
let eventKind = -1;
let params = ''
let always = ref(false)
let showMore = ref(false)

let authTitle = ref('Sign Event')
let authDes = ref('Allow the app to ')

onMounted(async () => {
    let qs = new URLSearchParams(location.search)
    origin = qs.get('origin') || ''
    requestId = qs.get('requestId') || ''
    let authTypeStr = qs.get('authType') || ''
    let eventKindStr = qs.get('eventKind') || ''
    params = qs.get('params') || ''

    authType = + authTypeStr
    if (eventKindStr) {
        eventKind = +eventKindStr
    }

    await appManager.initialize()
    let app = appManager.getByCode(origin)
    if (!app) {
        alert('App not found: ' + origin)
        window.close()
        return
    }

    selectedUserPubkey.value = app.pubkey!

    authTitle.value = 'Sign Event'
    console.log(app.name ? app.name! : app.code)
    authDes.value = 'Allow ' + (app.name ? app.name! : app.code) + " to "
    if (authType == AuthType.GET_PUBLIC_KEY) {
        authTitle.value = 'Get Public Key'
        authDes.value += 'Get Public Key'
    } else if (authType == AuthType.SIGN_EVENT) {
        authTitle.value = 'Sign Event'
        authDes.value = authDes.value + ' sign a ' + eventKindStr + ' kind event'
    } else if (authType == AuthType.GET_RELAYS) {
        authTitle.value = 'Get Relays'
        authDes.value += 'Get Relays'
    } else if (authType == AuthType.NIP04_ENCRYPT) {
        authTitle.value = 'Encrypt (NIP-04)'
        authDes.value += 'Encrypt (NIP-04)'
    } else if (authType == AuthType.NIP04_DECRYPT) {
        authTitle.value = 'Decrypt (NIP-04)'
        authDes.value += 'Decrypt (NIP-04)'
    } else if (authType == AuthType.NIP44_ENCRYPT) {
        authTitle.value = 'Encrypt (NIP-44)'
        authDes.value += 'Encrypt (NIP-44)'
    } else if (authType == AuthType.NIP44_DECRYPT) {
        authTitle.value = 'Decrypt (NIP-44)'
        authDes.value += 'Decrypt (NIP-44)'
    }
})

const selectedUserPubkey = ref('')
const handleUserChange = (pubkey: string) => {
}

const submit = async (allowed: boolean) => {
    console.log('confirm:', confirm)
    let message = {
        origin: origin,
        requestId: requestId,
        type: OtherMessageType.PERMISSION_RESULT,
        allowed: allowed,
        always: always.value
    }
    await chrome.runtime.sendMessage(message)
    
    window.close()
}

</script>
<template>
    <div class="pl-4 pr-4 pt-4 pb-2">
        <UserSelectComponent 
            v-model="selectedUserPubkey"
            :disabled=true
            @change="handleUserChange"
        />
    </div>

    <hr />

    <div class="pl-4 pr-4">
        <div class="container mt-6 text-center">
            <h1 class="text-xl font-bold">{{ authTitle }}</h1>
        </div>

        <div class="mt-4">
            <div class="card">
                <div class="mt-2 mb-2 text-center">
                    <h2 class="font-bold">{{ authDes }}</h2>
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