<script lang="ts">
import "../css/globals.css";

export default {
  data() {
    return {
    }
  },
  methods: {
    openOptionsPage() {
      chrome.runtime.openOptionsPage()
    },
    openOAuthPage() {
      let oauthUrl = chrome.runtime.getURL('/pages/oauth.html')
      chrome.windows.create({url: oauthUrl, type: 'popup'})
    }
  },
  mounted() {
    this.$router.push('/apps/1')
  }
}
</script>
<template>
  <div class="container h-150">
    <nav>
      <RouterLink to="/" class="mr-4">Index</RouterLink>
      <RouterLink to="/apps" class="mr-4">Apps</RouterLink>
      <RouterLink to="/users" class="mr-4">Users</RouterLink>
      <RouterLink to="/logs" class="mr-4">Logs</RouterLink>
    </nav>
    <RouterView />
    <b v-on:click='openOptionsPage'>open Options Page</b><br/>
    <b v-on:click='openOAuthPage'>open OAuth Page</b><br/>
    <div class="bg-blue-500 text-white p-4 rounded-lg">
        Hello, Tailwind CSS!
    </div>
  </div>
</template>