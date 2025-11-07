import { createApp } from 'vue'
import authApp from './auth.vue'
import router from '../ui/router_builder'

createApp(authApp).use(router).mount('#app')
