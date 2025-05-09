// src/stores/auth.js (Pinia example)
import { defineStore } from 'pinia'
import api from '@/utils/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    initializing: true,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    async login(credentials) {
      const { data } = await api.post('/login', credentials)
      this.user = data.user || data // Flexible for most backends
    },
    async logout() {
      await api.post('/logout')
      this.user = null
    },
    async fetchUser() {
      try {
        const { data } = await api.get('/user')
        this.user = data.users || data.id ? data : null
      } catch (err) {
        console.error('Error fetching user:', err)
        this.user = null
      } finally {
        this.initializing = false
      }
    },
  },
})
