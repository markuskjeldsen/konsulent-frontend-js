<template>
	<h3>update user</h3>
	<p>her kan man rette fejl eller andet på eksisterende brugere</p>

	<form v-if="editingUserId" @submit.prevent="editUser(editingUserId)">
		<label for="username">Username:</label>
		<input
			type="text"
			id="username"
			v-model="users.find((u) => u.ID === editingUserId).username"
		/>
		<br />
		<label for="name">Name:</label>
		<input type="text" id="name" v-model="users.find((u) => u.ID === editingUserId).name" />
		<br />
		<label for="rights">Rights:</label>
		<select id="rights" v-model="users.find((u) => u.ID === editingUserId).rights">
			<option value="user">User</option>
			<option value="admin">Admin</option>
			<option value="developer">Developer</option>
		</select>
		<br />
		<br />
		<button type="submit">Save</button>
		<button type="button" @click="editingUserId = null">Cancel</button>
	</form>

	<ul v-else>
		<li v-for="user in users" :key="user.ID">
			<button @click="setEditingUserId(user.ID)">Edit</button>
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
const editingUserId = ref(null)

api.get('/users')
	.then((response) => {
		users.value = response.data.users
	})
	.catch((error) => {
		console.error('Error fetching users:', error)
	})

function setEditingUserId(userId) {
	editingUserId.value = userId
}

function editUser(userId) {
	// Logic to edit user
	console.log('Editing user with ID:', userId)
	const userData = users.value.find((user) => user.ID === userId)
	if (!userData) {
		console.error('User not found:', userId)
		return
	}
	userData.password = undefined // do not send password if not changed

	userApi
		.update(userId, { ...userData })
		.then((response) => {
			const updatedUser = response.data
			const index = users.value.findIndex((user) => user.ID === userId)
			if (index !== -1) {
				users.value[index] = updatedUser
			}
			editingUserId.value = null
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
