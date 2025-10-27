import { createApp } from 'vue'
import hardwareSignerLoginApp from './hardware_signer_login.vue'
import router from '../ui/router_builder'

createApp(hardwareSignerLoginApp).use(router).mount('#app')
