import { createApp } from 'vue'
import oauthApp from './connect.vue'
import router from '../ui/router_builder'

createApp(oauthApp).use(router).mount('#app')
