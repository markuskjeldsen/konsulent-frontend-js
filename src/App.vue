/* App.vue */
<template>
  <header>
    <span v-if="authStore.isAuthenticated" @click="$router.push('/')">
      <img :src="logo" alt="DAI logo" />
    </span>
    <nav>
      <RouterLink v-if="authStore.isAuthenticated" to="/">Home</RouterLink>
      <RouterLink v-if="authStore.isAuthenticated" to="/about">About</RouterLink>
      <RouterLink v-if="authStore.isAuthenticated" to="/routeplanner">Rute planlægning</RouterLink>
      <RouterLink v-if="!authStore.isAuthenticated" to="/login">Login</RouterLink>
      <RouterLink v-if="authStore.isAuthenticated" to="/profile">Profile</RouterLink>
    </nav>
  </header>
  <main>
    <RouterView />
  </main>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import logo from '@/assets/DAI-logo.png'

const authStore = useAuthStore()
</script>

<style scoped>
span {
  cursor: pointer;
}

span img {
  height: 4rem;
  width: auto;
  vertical-align: middle;
  margin-right: 5rem;
}

main {
  justify-self: center;
  display: flex;

  max-width: 100%;
  min-width: 60%;
  padding-left: 1rem;
  padding-right: 1rem;
}

header {
  width: 100%;
  line-height: 1.5;
  max-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background-color: rgba(99, 170, 219, 1);
}

nav {
  width: 60%;
  justify-content: left;

  flex-direction: row;
  gap: 1rem;
}

nav a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  transition: background-color 0.3s ease-in-out;
}

nav a:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

nav a.router-link-exact-active {
  background-color: rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  nav {
    flex-direction: column;
    align-items: center;
  }
  nav a {
    width: 100%;
    text-align: center;
  }
}
</style>
