<script lang="ts">
import { NesignerSigner } from "../business/nostr_signer/nesigner_signer";
import { NsecSigner } from "../business/nostr_signer/nsec_signer";
import { NostrMessageService } from "../business/service/nostr_message_service";
import "../css/globals.css";
import { getSerialPort, createNesigner } from 'js_nesigner_sdk'

export default {
  data() {
    return {
      message: 'Welcome to your Vue Extension.',
      nostrMessageService: new NostrMessageService(),
    }
  },
  methods: {
    async pickSerialPort() {
      const port = await getSerialPort()
      console.log(port)
    },
    async testAddSigner() {
      const port = await getSerialPort()
      if (!port) {
        return;
      }

      let nesigner = await createNesigner(port, "");
      let signer = new NesignerSigner(nesigner);
      var pubkey = await signer.getPublicKey();
      this.nostrMessageService.addSigner(pubkey, signer);

      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log("receive at option page message:", message)
        console.log("at option page sender:", sender)

        if (this.nostrMessageService.handle(message, sender, sendResponse)) {
            return true;
        }
      })
    }
  },
  mounted() {
    
  }
}
</script>
<template>
  <div class="min-h-screen flex flex-col">
    <div class="flex-1">
      <RouterView />
    </div>
    <footer class="py-4 border-t">
      <div class="container mx-auto text-center text-gray-600">
        © {{ new Date().getFullYear() }} 版权所有
      </div>
    </footer>
  </div>
</template>