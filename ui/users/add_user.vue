<script lang="ts" setup>
import { ref } from 'vue'
import AppBarComponent from '../components/app_bar_component.vue'
import { userManager } from '../../business/data/user_manager'
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure'
import { bytesToHex, hexToBytes } from 'nostr-tools/utils'
import { KeyType, User } from '../../business/data/user'
import { nip05, nip19 } from 'nostr-tools'
import { useRouter } from 'vue-router';
import { BunkerSigner as NBunkerSigner, parseBunkerInput } from 'nostr-tools/nip46'

const router = useRouter();

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

const showInput = ref(false)

const addSolfwareUser = async () => {
    if (!solfwareInput.value) {
        alert("请输入私钥")
        return
    }

    let input = solfwareInput.value;
    // check input.
    if (input.startsWith("npub") || input.indexOf("@") > 0) {
        // readonly login
        let pubkey = input;
        if (input.indexOf("@") > 0) {
            // NIP-05 Address
            // TODO get pubkey from NIP-05 Address
            let profile = await nip05.queryProfile(input)
            if (profile) {
                pubkey = profile.pubkey
            } else {
                alert("NIP-05 Address error")
                return
            }
        } else {
            // npub
            let decodeResult = nip19.decode(input)
            if (decodeResult.type === 'npub') {
                pubkey = decodeResult.data
            }
        }
        let user = new User(pubkey, KeyType.NPUB);
        userManager.save(user)

        router.back()
    } else if (input.startsWith("bunker://")) {
        // bunker url
        let bunkerInfo = parseBunkerInput(input)
        if (!bunkerInfo) {
            alert("请输入正确的bunker url")
            return
        }
    } else {
        let hexPrivateKey = input;

        // private key
        if (input.startsWith("nsec")) {
            // nsec
            let decodeResult = nip19.decode(input)
            if (decodeResult && decodeResult.type === 'nsec') {
                hexPrivateKey = bytesToHex(decodeResult.data)
            }
        }

        let bytesPrivateKey = hexToBytes(hexPrivateKey)
        let nsec = nip19.nsecEncode(bytesPrivateKey)
        let pubkey = getPublicKey(bytesPrivateKey)

        let user = new User(pubkey, KeyType.NESC, nsec);
        userManager.save(user)

        router.back()
    }
    
}

</script>
<template>
    <AppBarComponent title="Add User"></AppBarComponent>
    <div class="container mt-4">
        <div class="card">
            <h3 class="text-lg font-semibold mt-2 mb-3 text-center">Login</h3>

            <template v-if="!isHarewareUser">
                <div class="flex items-center">
                    <input :type="showInput ? 'text' : 'password'" name="login" v-model="solfwareInput" class="mt-1 p-2 border-0 border-b-1 flex-1 focus:border-blue-500" required placeholder="nsec / hex private key / npub / NIP-05 Address / bunker://">
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
                    <button type="submit" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-4xl w-full" v-on:click="addSolfwareUser">Confirm</button>
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