<template>
    <footer class="py-4 border-t">
      <div class="container mx-auto text-center text-gray-600">
        Support by <a :href="Base.SupportUrl" target="_blank" class="text-blue-500">{{ Base.Name }}</a> v{{ Base.Version }}
      </div>
    </footer>
</template>

<script setup lang="ts">
import { Base } from "../../business/consts/base";
</script>

<style scoped>
</style>