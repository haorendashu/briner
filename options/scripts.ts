import './styles.css'

import { createApp } from 'vue'
import optionsApp from './options.vue'
import router from '../pages/router_builder'

createApp(optionsApp).use(router).mount('#app')
