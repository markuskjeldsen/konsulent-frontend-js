// src/stores/auth.js (Pinia example)
import { defineStore } from 'pinia'
import api from '@/utils/axios'

const TESTING = import.meta.env.VITE_TESTING === 'true' // or process.env.TESTING for Node

const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: TESTING ? mockUser : null,
    initializing: true,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    async login(credentials) {
      if (TESTING) {
        this.user = mockUser
        return
      }
      const { data } = await api.post('/login', credentials)
      this.user = data.user || data
    },
    async logout() {
      if (TESTING) {
        this.user = null
        return
      }
      await api.post('/logout')
      this.user = null
    },
    async fetchUser() {
      if (TESTING) {
        this.user = mockUser
        this.initializing = false
        return
      }
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
