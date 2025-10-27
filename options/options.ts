import { createApp } from 'vue'
import optionsApp from './options.vue'
import router from '../ui/router_builder'

createApp(optionsApp).use(router).mount('#app')
