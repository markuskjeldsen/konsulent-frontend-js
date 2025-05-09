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
import api from '@/utils/axios.js'
import router from '@/router'

const username = ref('')
const password = ref('')
const errorMessage = ref('')

async function handleLogin() {
  console.log('Login attempt')
  errorMessage.value = ''
  try {
    const response = await api.post('/login', {
      username: username.value,
      password: password.value,
    })
    if (response.status === 200) {
      console.log('Login successful')

      router.push({ name: 'home' })
    }
    password.value = ''
    username.value = ''
  } catch {
    errorMessage.value = 'Login failed. Please check your credentials.'
  }
}

function handleChange() {
  errorMessage.value = ''
}
</script>
