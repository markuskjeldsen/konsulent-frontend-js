<template>
  <div>
    <h1>Profile</h1>
    <p>Velkommen til din Profil: {{ authStore.user.name }}</p>
    <p>Her kan du ændre forskellige ting og se info omkring din bruger</p>
    <p>Dit brugernavn er: {{ authStore.user.username }}</p>
    <p>Din rolle er: {{ authStore.user.rights }}</p>

    <!-- Editable Form -->
    <form @submit.prevent="updateDetails" v-if="editing">
      <div>
        <label for="phone">Dit telefonnr er:</label>
        <input type="text" id="phone" v-model="editedUser.phone" />
      </div>
      <div>
        <label for="email">Din email er:</label>
        <input type="email" id="email" v-model="editedUser.email" required />
      </div>
      <button type="button" @click="cancelEdit">Annuller</button>
      <button type="submit">Gem ændringer</button>
    </form>

    <!-- Display Only -->
    <template v-else>
      <p>Dit telefonnr er: {{ authStore.user.phone }}</p>
      <p>Din email er: {{ authStore.user.email }}</p>
      <button @click="editing = true">Redigér</button>
    </template>
    <br />
    <br />
    <br />
    <br />
    <button @click="logout">Logout</button>
    <p v-if="feedback" :class="{ error: error }">{{ feedback }}</p>
  </div>
</template>

<script setup>
/*
This page will also hold some statistics about how successfull the user is with his endeavours. 
how much time he uses answering the questionaire.
personal statistics
  missed visits
  
*/
import { ref, reactive, watch } from 'vue'
import router from '@/router'
import { useAuthStore } from '@/stores/auth.js'
import api from '@/utils/axios.js'

const authStore = useAuthStore()
const editing = ref(false)
const error = ref(false)
const feedback = ref('')

// Prepopulate when editing starts
const editedUser = reactive({ ...authStore.user })
// Watch for editing state
watch(editing, (val) => {
  if (val) {
    editedUser.phone = authStore.user.phone
    editedUser.email = authStore.user.email
  }
})

function cancelEdit() {
  editing.value = false
  feedback.value = ''
}

async function updateDetails() {
  try {
    // Make API call to update the details
    await api.patch('/user', { ...editedUser })
    // Update store (assume backend returns the updated user)
    authStore.fetchUser()
    feedback.value = 'Profil opdateret!'
    error.value = false
    editing.value = false
  } catch (err) {
    console.error(err)
    feedback.value = 'Noget gik galt ved opdatering'
    error.value = true
  }
}

async function logout() {
  authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<style scoped>
.error {
  color: red;
}
</style>
