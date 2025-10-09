<script lang="ts">
import "../css/globals.css";
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
  <b v-on:click='pickSerialPort'>Pick Serial Port</b>
</template>