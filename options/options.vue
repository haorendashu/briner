<script lang="ts">
import { getSerialPort } from 'js_nesigner_sdk'

export default {
  data() {
    return {
      message: 'Welcome to your Vue Extension.'
    }
  },
  methods: {
    async pickSerialPort() {
      const port = await getSerialPort()
      console.log(port)
    }
  }
}
</script>
<template>
  <header>
    <h1>
      <img
        class="vue"
        src="/logo.svg"
        alt="The Vue logo"
        width="120px"
      />
      <br />
      {{message}}
    </h1>
    <p>
      Learn more about creating cross-browser extensions at 
      <a href="https://extension.js.org" target="_blank">
        https://extension.js.org
      </a>
      .
    </p>
    <b v-on:click='pickSerialPort'>Pick Serial Port</b>
  </header>
</template>