//src/components/LoginPage.vue
<template>
  <div class="login">
    <h1>Login</h1>
    <form @submit.prevent="handleLogin" @change="handleChange" autocomplete="on">
      <div>
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit">Login</button>
    </form>
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const authStore = useAuthStore()

async function handleLogin() {
  console.log('Login attempt')
  errorMessage.value = ''
  try {
    await authStore.login({
      username: username.value,
      password: password.value,
    })
    await authStore.fetchUser()
    if (authStore.isAuthenticated) {
      console.log('Login successful')
      router.push('/')
      password.value = ''
      username.value = ''
    }
  } catch {
    errorMessage.value = 'Login failed. Please check your credentials.'
  }
}

function handleChange() {
  errorMessage.value = ''
}
</script>
