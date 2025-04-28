import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页',
      requiresAuth: false,
    },
  },
  {
    path: '/files',
    name: 'Files',
    component: () => import('@/views/files/Index.vue'),
    meta: {
      title: '文件浏览',
      requiresAuth: false,
    },
  },
  {
    path: '/table/:id',
    name: 'TableView',
    component: () => import('@/views/table/Index.vue'),
    props: true,
    meta: {
      title: '表格查看',
      requiresAuth: false,
    },
  },
  {
    path: '/visualization/:fileId',
    name: 'Visualization',
    component: () => import('@/views/visualization/Index.vue'),
    props: true,
    meta: {
      title: '数据可视化',
      requiresAuth: false,
    },
    children: [
      {
        path: ':visId',
        name: 'VisualizationDetail',
        component: () => import('@/views/visualization/Detail.vue'),
        props: true,
        meta: {
          title: '可视化详情',
          requiresAuth: false,
        },
      },
    ],
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/settings/Index.vue'),
    meta: {
      title: '系统设置',
      requiresAuth: false,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面未找到',
      requiresAuth: false,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || '表格文件预览与数据可视化'} - 表格文件预览与数据可视化中间件`;
  next();
});

export default router; 