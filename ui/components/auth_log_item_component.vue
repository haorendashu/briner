<template>
    <div class="item item-border">
        <div class="w-1/4">
            {{ authLog.appCode }}
        </div>
        <div class="mr-4">
            <div :class="{'bg-red-500': authLog.authResult == AuthResult.REJECT, 'bg-green-500': authLog.authResult == AuthResult.OK, auth_result: true }">
                {{ authLog.authResult == AuthResult.OK ? 'Approve' : 'Reject' }}
            </div>
        </div>
        <div class="flex-1 min-w-0">
            <p class="truncate">{{ authContent }}</p>
        </div>
        <div class="ml-auto">
            <p class="text-lg">&gt;</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { AuthLog } from '../../business/data/auth_log';
import { AuthResult } from '../../business/consts/auth_result';
import { AuthType } from '../../business/consts/auth_type';

// 定义组件props
interface Props {
  authLog: AuthLog,
  isLast?: boolean
}

let authContent = ref('')

const props = withDefaults(defineProps<Props>(), {
  isLast: false,
})

// 监听图片URL变化
onMounted(() => {
    let content = 'Sign Event'
    if (props.authLog.authType == AuthType.GET_PUBLIC_KEY) {
        content = 'Get Public Key'
    } else if (props.authLog.authType == AuthType.SIGN_EVENT) {
        content = 'Sign Event'
        if (props.authLog.eventKind) {
            content += ' Event Kind ' + props.authLog.eventKind
        }
    } else if (props.authLog.authType == AuthType.GET_RELAYS) {
        content = 'Get Relays'
    } else if (props.authLog.authType == AuthType.NIP04_ENCRYPT) {
        content = 'Encrypt (NIP-04)'
    } else if (props.authLog.authType == AuthType.NIP04_DECRYPT) {
        content = 'Decrypt (NIP-04)'
    } else if (props.authLog.authType == AuthType.NIP44_ENCRYPT) {
        content = 'Encrypt (NIP-44)'
    } else if (props.authLog.authType == AuthType.NIP44_DECRYPT) {
        content = 'Decrypt (NIP-44)'
    }
    
    if (props.authLog.content && props.authLog.content != '') {
        content += ' ' + props.authLog.content
    }
    authContent.value = content
})
</script>

<style scoped>
.truncate {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 100%;
}
</style>