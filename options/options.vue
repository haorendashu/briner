<script setup lang="ts">
import '../css/styles.css'
import '../css/globals.css'
import footerComponent from '../ui/components/footer_component.vue'

</script>
<template>
  <div class="min-h-screen flex flex-col">
    <div class="flex-1">
      <RouterView />
    </div>
    <footerComponent />
  </div>
</template>