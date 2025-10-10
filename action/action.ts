import '../css/styles.css'
import { createApp } from 'vue'
import actionApp from './action.vue'
import router from '../ui/router_builder'

createApp(actionApp).use(router).mount('#app')
