<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import AppBarComponent from '../components/app_bar_component.vue'
import UserSelectComponent from '../components/user_select_component.vue'
import type { App } from '../../business/data/app';
import { appManager } from '../../business/data/app_manager';
import { ConnectType } from '../../business/consts/connect_type';
import { AuthResult } from '../../business/consts/auth_result';
import router from '../router_builder';

const app = ref<App>()
const route = useRoute()

// connectType 选项
const connectTypeOptions = [
  { value: 1, label: 'Fully Trust' },
  { value: 2, label: 'Reasonable' },
  { value: 3, label: 'Alway Reject' }
]

const allows = ref<string[]>([])
const rejects = ref<string[]>([])

onMounted(async () => {
    let appCode = route.params.id as string
    appCode = decodeURIComponent(appCode)
    console.log('App Code:', appCode)
    
    await appManager.initialize()
    const loadedApp = appManager.getByCode(appCode)
    app.value = loadedApp

    let tempPermissionMap = appManager.getAppPermissionMap(appCode)
    if (tempPermissionMap) {
        console.log(tempPermissionMap)
        for (var [k, v] of tempPermissionMap) {
            if (v == AuthResult.REJECT) {
                rejects.value?.push(k)
            } else {
                allows.value?.push(k)
            }
        }
        console.log(allows.value)
    }
})

const removeItem = (isAllow : boolean, permission : string) => {
    if (isAllow) {
        let newList = allows.value.filter(item => item !== permission)
        allows.value = newList
    } else{
        let newList = rejects.value.filter(item => item !== permission)
        rejects.value = newList
    }
}

const getPermissionName = (permissionStr : string) => {
    let strs = permissionStr.split('-')
    let permission = strs[0]
    let eventKind = ''
    if (strs.length > 1) {
        eventKind = strs[1]
    }
    if (permission == '1') {
        return 'Get Public Key'
    } else if (permission == '2') {
        return 'Sign Event (Event Kind ' + eventKind + ')'
    } else if (permission == '3') {
        return 'Get Relays'
    } else if (permission == '4') {
        return 'Encrypt (NIP-04)'
    } else if (permission == '5') {
        return 'Decrypt (NIP-04)'
    } else if (permission == '6') {
        return 'Encrypt (NIP-44)'
    } else if (permission == '7') {
        return 'Decrypt (NIP-44)'
    }
}

const submit = (confirm: boolean)  => {
    let appValue = app.value
    if (confirm && appValue) {
        let permissionMap = new Map<string, number>()
        for (let permission of allows.value) {
            permissionMap.set(permission, AuthResult.OK)
        }
        for (let permission of rejects.value) {
            permissionMap.set(permission, AuthResult.REJECT)
        }

        appManager.updatePermissionsToApp(permissionMap, appValue)
        appManager.save(appValue)
    }

    router.back()
}

const deleteApp = () => {
    if (!app || !app.value || !app.value.code) {
        return
    }

    appManager.delete(app.value?.code!)
    router.back()
}

</script>
<template>
    <AppBarComponent title="Edit App">
        <template #right>
            <img src="/imgs/delete.png" style="width: 20px; height: 20px;" class="cursor-pointer ml-2 mr-2" v-on:click="deleteApp()" />
        </template>
    </AppBarComponent>
    <div class="container mb-4">
        <div class="card mt-4">
            <div v-if="app" class="p-4">
                <div class="mt-2 mb-4">
                    <label class="form-label fw-bold mr-4">App Address:</label>
                    <span class="text-gray-500">{{ app.code }}</span>
                </div>

                <div class="mb-4 container flex">
                    <label class="form-label fw-bold flex-none mr-4">App Name:</label>
                    <input type="text" class="form-control border-b-1 flex-1" v-model="app.name" placeholder="Please input app name" />
                </div>
                
                <div class="flex items-center mb-4 container">
                    <span class="form-label fw-bold mr-4">Pubkey:</span>
                    <UserSelectComponent v-model="app.pubkey" placeholder="Select User" disabled:=true />
                </div>
                
                <div class="mb-4 container">
                    <label class="form-label fw-bold mr-4">Connect Type:</label>
                    <select 
                        class="form-select form-select-lg border-primary" 
                        v-model="app.connectType"
                        required
                    >
                        <option v-for="option in connectTypeOptions" 
                                :key="option.value" 
                                :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>

                <template v-if="app.connectType == ConnectType.REASONABLE">
                    <div v-if="allows?.length && allows?.length > 0" class="mb-4 container">
                        <div class="fw-bold mb-3">
                            Always Allow:
                        </div>
                        <div class="">
                            <span v-for="permission in allows" v-on:click="removeItem(true, permission)" class="permissionItem">
                                {{ getPermissionName(permission) }}
                                <span class="ml-1 text-red-500">X</span>
                            </span>
                        </div>
                    </div>
                    <div v-if="rejects?.length && rejects?.length > 0" class="mb-4 container">
                        <div class="fw-bold mb-3">
                            Always Reject:
                        </div>
                        <div class="">
                            <span v-for="permission in rejects" v-on:click="removeItem(false, permission)" class="permissionItem">
                                {{ getPermissionName(permission) }}
                                <span class="ml-1 text-red-500">X</span>
                            </span>
                        </div>
                    </div>
                </template>

                <div class="flex justify-end mt-12">
                    <button class="bg-red-500 text-white px-4 py-2 rounded-2xl mr-2" v-on:click="submit(false)">Cancel</button>
                    <button class="bg-green-500 text-white px-4 py-2 rounded-2xl" v-on:click="submit(true)">Confirm</button>
                </div>
            </div>
            
            <div v-else class="text-center py-5">
                <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3 text-muted fs-5">It's loaing the app info...</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>