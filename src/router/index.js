import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/game1',
      name: 'game1',
      component: () => import('../views/Game1.vue')
    },
    {
      path: '/game2',
      name: 'game2',
      component: () => import('../views/Game2.vue')
    },
    {
      path: '/game3',
      name: 'game3',
      component: () => import('../views/Game3.vue')
    },
    {
      path: '/game4',
      name: 'game4',
      component: () => import('../views/Game4.vue')
    }
  ]
})

// 添加全局导航守卫
router.beforeEach((to, from, next) => {
  // 确保从游戏页面返回时清理资源
  if (from.path.startsWith('/game')) {
    // 给予足够的时间让组件的 unmounted 钩子完成清理
    setTimeout(() => {
      next()
    }, 100)
  } else {
    next()
  }
})

export default router