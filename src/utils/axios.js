// src/utils/axios.js

import axios from 'axios'

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 60 * 1000, // 60 seconds timeout
  withCredentials: true, // <<< this makes axios send/receive cookies
  headers: {
    'Content-Type': 'application/json',
  },
  user: {
    getAll: () => api.get('/users'),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.patch(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
  },
})

// Optional: response interceptor to catch 401 globally
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      // e.g. emit an event, clear your store, redirect to login…
      // you could also do it in a pinia/vuex action
    }
    return Promise.reject(err)
  },
)

export default api
