// src/stores/auth.js (Pinia example)
import { defineStore } from 'pinia'
import api from '@/utils/axios'

const TESTING = import.meta.env.VITE_TESTING === 'true' // or process.env.TESTING for Node

const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  rights: 'user', // 'admin', 'user', 'developer'
  phone: '123-456-7890',
  visits: [
    {
      id: 1,
      date: '2023-10-01',
      time: '10:00',
      location: 'Location A',
    },
    {
      id: 2,
      date: '2023-10-02',
      time: '11:00',
      location: 'Location B',
    },
    {
      id: 15,
      date: '2025-05-21',
      time: '11:00',
      location: 'Location B',
    },
  ],
  visit_responses: [
    {
      id: 1,
      response: 'Response A',
    },
    {
      id: 2,
      response: 'Response B',
    },
  ],
}

function normalizeUserResponse(data) {
  if (!data) return null
  if (data.id || data.ID) return data
  if (data.user && (data.user.id || data.user.ID)) return data.user
  return null
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
      this.user = normalizeUserResponse(data)
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
        this.user = normalizeUserResponse(data)
      } catch (err) {
        console.error('Error fetching user:', err)
        this.user = null
      } finally {
        this.initializing = false
      }
    },
  },
})
