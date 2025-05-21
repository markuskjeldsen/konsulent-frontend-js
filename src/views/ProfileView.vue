<template>
  <div>
    <h1>Profile</h1>
    <p>Welcome to your profile page: {{ authStore.user.name }}</p>
    <p>Here you can manage your account settings and preferences.</p>
    <button @click="logout">Logout</button>
  </div>
</template>

<script setup>
import router from '@/router'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()

async function logout() {
  authStore.logout()
  // refresh the page or redirect to login
  await router.push({ name: 'login' })
}
</script>
