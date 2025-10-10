import '../css/styles.css'
import { createApp } from 'vue'
import oauthApp from './oauth.vue'
import router from './router_builder'

createApp(oauthApp).use(router).mount('#app')
