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
    }
  }
}
</script>
<template>
  <div>
    <b v-on:click='openOptionsPage'>open Options Page</b>
    <div class="bg-blue-500 text-white p-4 rounded-lg">
        Hello, Tailwind CSS!
    </div>
  </div>
</template>