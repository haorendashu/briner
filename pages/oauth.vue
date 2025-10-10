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
  },
  mounted() {
    this.$router.push('/apps/1')
  }
}
</script>
<template>
  <div class="container h-150">
    <RouterView />
  </div>
</template>