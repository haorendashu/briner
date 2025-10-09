import { createMemoryHistory, createRouter } from 'vue-router'

import appDetailView from './apps/app_detail.vue'
import appsView from './apps/apps.vue'
import usersView from './users/users.vue'
import logsView from './logs/logs.vue'
import indexView from './index/index.vue'

const routes = [
    { path: '/', component: indexView },
    { path: '/apps', component: appsView },
    { path: '/apps/:id', component: appDetailView },
    { path: '/users', component: usersView },
    { path: '/logs', component: logsView },
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router