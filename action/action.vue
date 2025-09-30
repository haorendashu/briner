<script lang="ts">
export default {
  data() {
    return {
    }
  },
  methods: {
    openOptionsPage() {
      chrome.runtime.openOptionsPage()
    }
  }
}
</script>
<template>
  <div>
    <b v-on:click='openOptionsPage'>open Options Page</b>
  </div>
</template>