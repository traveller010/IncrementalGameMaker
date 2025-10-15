// src/router/index.ts

import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'resources',
      component: () => import('../views/ResourceEditorView.vue') 
    },
    {
      path: '/generators', // The new path for the generator editor
      name: 'generators',
      component: () => import('../views/GeneratorEditorView.vue')
    },
    {
      path: '/tiers',
      name: 'tiers',
      component: () => import('../views/TierEditorView.vue')
    },
    {
      path: '/upgrades',
      name: 'upgrades',
      component: () => import('../views/UpgradeEditorView.vue')
    }
  ]
})

export default router