<template>
    <span>{{ username }}</span>
</template>

<script setup lang="ts">
import { nip19 } from 'nostr-tools';
import { onMounted, ref } from 'vue'

interface Props {
  pubkey: string
}

const username = ref('')

const props = withDefaults(defineProps<Props>(), {
})

onMounted(() => {
    let npub = nip19.npubEncode(props.pubkey)
    username.value = npub.substring(0, 6) + ":" + npub.substring(npub.length - 6)
})

</script>

<style scoped>
</style>