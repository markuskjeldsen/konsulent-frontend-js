// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // Import the auth store
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        roles: ['admin', 'user'], // This route requires admin role
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginPage.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: {
        roles: ['user'], // This route requires user role
      },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: {
        roles: ['admin', 'user'], // This route requires admin role
      },
    },
    {
      path: '/Auditor/:id',
      name: 'Auditor',
      component: () => import('../views/AuditorView.vue'),
      meta: {
        roles: ['admin', 'user'], // This route requires admin role
      },
    },
  ],
})

// Add a global navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (authStore.initializing) {
    await authStore.fetchUser() // Fetch user data if not already done
  }

  if (to.path === '/login') {
    if (authStore.isAuthenticated) {
      // Redirect to home if already authenticated
      return next('/')
    } else {
      return next() // Allow access to the login page
    }
  }

  if (authStore.isAuthenticated === false) {
    // Redirect to a login page or show an error if not authenticated
    alert('You must be logged in to access this page.')
    return next('/login') // Prevent navigation
  }
  next() // Allow navigation if authenticated
})

export default router
