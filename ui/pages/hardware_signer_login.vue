<script lang="ts" setup>
import { ref } from 'vue'
import AppBarComponent from '../components/app_bar_component.vue'
import { createNesigner, getSerialPort } from 'js_nesigner_sdk'
import { NostrMessageService } from '../../business/service/nostr_message_service'
import { NesignerSigner } from '../../business/nostr_signer/nesigner_signer'
import { appManager } from '../../business/data/app_manager'
import { OtherMessageType } from '../../business/consts/other_message_type'

const nesignerPinCode = ref("")
const showInput = ref(false)
const nostrMessageService = new NostrMessageService(false);
const initedListenMessage = ref(false)
let portRef: chrome.runtime.Port | null = null

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
                // register a long lived port and let background forward requests to this page
                await appManager.initialize()

                portRef = chrome.runtime.connect()
                portRef.postMessage({ type: 'REGISTER', pubkey })

                portRef.onMessage.addListener(async (msg: any) => {
                    console.log('hardware port receive message:', msg)
                    if (msg && msg.type === 'HARDWARE_REQUEST' && msg.requestId && msg.message) {
                        try {
                            await appManager.initialize()
                            let responded = false
                            // handle the message using local nostrMessageService
                            await nostrMessageService.handle(msg.message, {} as chrome.runtime.MessageSender, (response: any) => {
                                responded = true
                                portRef?.postMessage({ type: 'HARDWARE_RESPONSE', requestId: msg.requestId, response: response.response, error: response.error })
                            })
                            if (!responded) {
                                portRef?.postMessage({ type: 'HARDWARE_RESPONSE', requestId: msg.requestId, error: 'Hardware request not handled' })
                            }
                        } catch (e) {
                            console.error('Error handling hardware request:', e)
                            portRef?.postMessage({ type: 'HARDWARE_RESPONSE', requestId: msg.requestId, error: String(e) })
                        }
                    }
                })

                // Listen to permission result messages from the auth window
                // These messages also come from background, but the hardware page's NostrMessageService instance
                // has its own separate pendingPermissions map, so no conflict with background processing
                chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                    console.log('hardware page receive message:', message)
                    if (message && message.type === OtherMessageType.PERMISSION_RESULT) {
                        console.log('hardware page handling PERMISSION_RESULT for requestId:', message.requestId)
                        if (nostrMessageService.shouldBeHandled(message)) {
                            nostrMessageService.handle(message, sender, sendResponse)
                            return true
                        }
                    }
                    return false
                })

                nostrMessageService.addSigner(pubkey, new NesignerSigner(nesigner))
                initedListenMessage.value = true
            }
        }
    }
}

// disconnect the port when this component unmounts
import { onBeforeUnmount } from 'vue'
onBeforeUnmount(() => {
    if (portRef) {
        try { portRef.disconnect() } catch(e) { }
        portRef = null
    }
})

appManager.setupListener()

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
            <div class="flex flex-col items-center gap-4 py-4">
                <div class="flex items-center gap-2 text-green-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <h3 class="text-lg font-semibold">Hardware Signer Connected</h3>
                </div>
                <div class="w-full rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <div class="font-semibold mb-1">Please keep this window open</div>
                    <div>It needs to stay open to continue handling signing requests.</div>
                </div>
            </div>
        </div>
    </div>
</template>