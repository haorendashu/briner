<script lang="ts" setup>
import { ref } from 'vue'
import AppBarComponent from '../components/app_bar_component.vue'
import { generateSecretKey } from 'nostr-tools/pure'
import { bytesToHex } from 'nostr-tools/utils'

const isHarewareUser = ref(false)

const usingSoftwareSigner = () => {
    isHarewareUser.value = false
}

const usingHardwareSigner = () => {
    isHarewareUser.value = true
}

const solfwareInput = ref("")

const genSolfwarePrivateKey = () => {
    solfwareInput.value = bytesToHex(generateSecretKey())
}

const nesignerPinCode = ref("")

</script>
<template>
    <AppBarComponent title="Add User"></AppBarComponent>
    <div class="container mt-4">
        <div class="card">
            <h3 class="text-lg font-semibold mt-2 mb-3 text-center">Login</h3>

            <template v-if="!isHarewareUser">
                <div>
                    <input type="text" id="login" name="login" v-model="solfwareInput" class="mt-1 p-2 border-0 border-b-1 w-full focus:border-blue-500" required placeholder="nsec / hex private key / npub / NIP-05 Address / bunker://">
                </div>

                <div class="container mb-4">
                    <button type="submit" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-4xl w-full">Confirm</button>
                </div>

                <div class="text-center mb-3">
                    <a class="underline" href="javascript:void(0)" v-on:click="genSolfwarePrivateKey">Generate a private key</a>
                </div>

                <div class="text-center">or</div>

                <div class="text-center mt-3 mb-4">
                    <a class="underline" href="javascript:void(0)" @click="usingHardwareSigner">Using hareware signer</a>
                </div>
            </template>

            <template v-if="isHarewareUser">
                <div>
                    <input type="text" id="login" name="login" v-model="nesignerPinCode" class="mt-1 p-2 border-0 border-b-1 w-full focus:border-blue-500" required placeholder="nesigner pin code"></input>
                </div>

                <div class="container mb-4">
                    <button type="submit" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-4xl w-full">Pick a hareware signer</button>
                </div>

                <div class="text-center">or</div>

                <div class="text-center mt-3 mb-4">
                    <a class="underline" href="javascript:void(0)" @click="usingSoftwareSigner">Using sofeware signer</a>
                </div>
            </template>
            
        </div>
    </div>
</template>