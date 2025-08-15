<template>
  <h3>update user</h3>
  <p>her kan man rette fejl eller andet på eksisterende brugere</p>
  <ul>
    <li v-for="user in users" :key="user.id">
      <button @click="editUser(user.id)">Edit</button>
      <button @click="deleteUser(user.id)">Delete</button>
      ID: {{ user.ID }}, username: {{ user.username }}, name: {{ user.name }}
    </li>
  </ul>
</template>
<script setup>
import api from '@/utils/axios'
import { ref } from 'vue'

const users = ref([])

api
  .get('/users')
  .then((response) => {
    users.value = response.data.users
  })
  .catch((error) => {
    console.error('Error fetching users:', error)
  })

function editUser(userId) {
  // Logic to edit user
  console.log('Editing user with ID:', userId)
  const userData = users.value.find((user) => user.id === userId)
  if (!userData) {
    console.error('User not found:', userId)
    return
  }

  api.user
    .patch(userId, { ...userData })
    .then((response) => {
      const updatedUser = response.data
      const index = users.value.findIndex((user) => user.id === userId)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
    })
    .catch((error) => {
      console.error('Error updating user:', error)
    })

  api
    .patch(`/users/${userId}`)
    .then((response) => {
      const updatedUser = response.data
      const index = users.value.findIndex((user) => user.id === userId)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
    })
    .catch((error) => {
      console.error('Error updating user:', error)
    })
}

function deleteUser(userId) {
  // Logic to delete user
  console.log('Deleting user with ID:', userId)
  api.user
    .delete(userId)
    .then(() => {
      users.value = users.value.filter((user) => user.id !== userId)
    })
    .catch((error) => {
      console.error('Error deleting user:', error)
    })
}
</script>
