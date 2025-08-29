<template>
	<h3>update user</h3>
	<p>her kan man rette fejl eller andet på eksisterende brugere</p>
	<ul>
		<li v-for="user in users" :key="user.ID">
			<button @click="editUser(user.ID)">Edit</button>
			<button @click="deleteUser(user.ID)">Delete</button>
			ID: {{ user.ID }}, username: {{ user.username }}, name: {{ user.name }}
		</li>
	</ul>
</template>
<script setup>
import api from '@/utils/axios'
import { userApi } from '@/utils/axios'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
const users = ref([])

api.get('/users')
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
}

async function deleteUser(userId) {
	// Logic to delete user
	if (authStore.user.rights !== 'developer') {
		console.error('Unauthorized to delete user:', userId)
		return
	}
	console.log('Deleting user with ID:', userId)
	const userData = users.value.find((user) => user.ID === userId)
	if (!userData) {
		console.error('User not found:', userId)
		return
	}

	// optimistic update with rollback
	const prev = [...users.value]
	users.value = users.value.filter((u) => u.ID !== userId)
	try {
		await userApi.delete(userId)
	} catch (err) {
		users.value = prev // rollback
		console.error('Error deleting user:', err)
		// show a user-facing error message here
	}
}
</script>
