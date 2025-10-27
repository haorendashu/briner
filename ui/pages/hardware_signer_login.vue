<script lang="ts" setup>
import { ref } from 'vue'
import AppBarComponent from '../components/app_bar_component.vue'
import { createNesigner, getSerialPort } from 'js_nesigner_sdk'
import { NostrMessageService } from '../../business/service/nostr_message_service'
import { NesignerSigner } from '../../business/nostr_signer/nesigner_signer'

const nesignerPinCode = ref("")
const showInput = ref(false)
const nostrMessageService = new NostrMessageService();
const initedListenMessage = ref(false)

const hardwareUserLogin = async () => {
    if (!nesignerPinCode.value) {
        alert("请输入Pin Code")
        return
    }

    let port = await getSerialPort();
    if (port) {
        let nesigner = await createNesigner(port, nesignerPinCode.value)
        if (nesigner) {
            let pubkey = await nesigner.getPublicKey()
            if (pubkey) {
                // connect success!
                await initChromeMessageListener()
                nostrMessageService.addSigner(pubkey, new NesignerSigner(nesigner))
            }
        }
    }
}

const initChromeMessageListener = async () => {
    if (initedListenMessage.value) {
        return
    }
    
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log("hardware signer page receive message:", message)
        console.log("hardware signer page sender:", sender)

        if (nostrMessageService.handle(message, sender, sendResponse)) {
            return true;
        }

        return true;
    });
    
    initedListenMessage.value = true
}

</script>
<template>
    <AppBarComponent title="Hardware Signer Login" showBack="false"></AppBarComponent>
    <div class="container mt-4">
        <div v-if="!initedListenMessage" class="card">
            <h3 class="text-lg font-semibold mt-2 mb-3 text-center">Connect to Hardware Signer</h3>

            <div class="flex items-center">
                <input :type="showInput ? 'text' : 'password'" id="login" name="login" v-model="nesignerPinCode" class="mt-1 p-2 border-0 border-b-1 flex-1 focus:border-blue-500" required placeholder="nesigner pin code">
                <button type="button" @click="showInput = !showInput" class="ml-2 p-2 text-gray-600 hover:text-blue-500 border-0 border-gray-300 rounded hover:border-blue-500">
                    <svg v-if="showInput" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                </button>
            </div>

            <div class="container mb-4">
                <button type="submit" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-4xl w-full" v-on:click="hardwareUserLogin">Connect to hareware signer</button>
            </div>
        </div>
        <div v-if="initedListenMessage" class="card">
            <h3 class="text-lg font-semibold mt-2 mb-3 text-center">Hardware Signer Connected ! Please keep this windows open !</h3>
        </div>
    </div>
</template>