// src/stores/auth.js (Pinia example)
import { defineStore } from 'pinia'
import api from '@/utils/axios'
import router from '@/router'

function normalizeUserResponse(data) {
	if (!data) return null
	if (data.id || data.ID) return data
	if (data.user && (data.user.id || data.user.ID)) return data.user
	return null
}

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
			const { data } = await api.post('/login', credentials) // verifytoken
			this.user = normalizeUserResponse(data)
		},
		async logout() {
			await api.post('/logout')
			this.user = null
		},
		async fetchUser() {
			try {
				var { data } = await api.get('/user')
				if (data.rights === 'developer') {
					data.rights = 'admin'
				}
				this.user = normalizeUserResponse(data)
			} catch (err) {
				console.error('Error fetching user:', err)
				this.user = null
			} finally {
				this.initializing = false
			}
		},
		async toLoginScreen() {
			router.push('/login')
		},
	},
})
