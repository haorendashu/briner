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
  <nav>
    <RouterLink to="/" class="mr-4">Index</RouterLink>
    <RouterLink to="/apps" class="mr-4">Apps</RouterLink>
    <RouterLink to="/users" class="mr-4">Users</RouterLink>
    <RouterLink to="/logs" class="mr-4">Logs</RouterLink>
  </nav>
  <RouterView />
  <h1>
    {{message}}
  </h1>
  <b v-on:click='pickSerialPort'>Pick Serial Port</b><br/>
  <b v-on:click='testAddSigner'>Test Add Signer</b>
</template>