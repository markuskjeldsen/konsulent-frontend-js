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
		<form @submit.prevent="UpdatePassword">
			For at opdatere dit kodeord så skriv det nye kodeord 2 gange og tryk bekræft. Når du har
			trykket bekræft bliver du logget ud.
			<br />
			<p v-if="newPassword && newPasswordCheck && !passEqual">
				The passwords are not the same
			</p>

			<div>
				<label for="password">kodeord</label>
				<input type="password" id="password" v-model="newPassword" required />
			</div>
			<div>
				<label for="confirmPassword">bekræft</label>
				<input type="password" id="confirmPassword" v-model="newPasswordCheck" required />
			</div>
			<button type="submit" :disabled="!passEqual">Bekræft</button>
		</form>

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
import { ref, reactive, watch, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import api from '@/utils/axios.js'

const loading = ref(false)
const authStore = useAuthStore()
const editing = ref(false)
const error = ref(false)
const feedback = ref('')
const newPassword = ref('')
const newPasswordCheck = ref('')

// Prepopulate when editing starts
const editedUser = reactive({ ...authStore.user })
// Watch for editing state
watch(editing, (val) => {
	if (val) {
		editedUser.phone = authStore.user.phone
		editedUser.email = authStore.user.email
	}
})

const passEqual = computed(
	() => newPassword.value === newPasswordCheck.value && newPassword.value.length > 0,
)

function cancelEdit() {
	editing.value = false
	feedback.value = ''
}

function validateStrength(pwd, strength) {
	// minimal client-side rules; server enforces true policy
	if (strength == 1) {
		return true
	}
	if (strength == 2) {
		return pwd.length >= 12 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd)
	}
}

async function UpdatePassword() {
	if (!passEqual.value) {
		feedback.value = 'Passwords do not match'
		error.value = true
		return
	}
	if (!validateStrength(newPassword.value, 1)) {
		feedback.value = 'Password too weak (min 12 chars, upper, lower, number)'
		error.value = true
		return
	}

	loading.value = true
	error.value = false
	feedback.value = ''

	try {
		// prefer /me/password if you implement it server-side
		const userId = authStore.user?.ID
		await api.patch(`/users/${userId}/password`, {
			new_password: newPassword.value,
		})

		// clear local auth state and navigate to login
		authStore.logout()
		window.location.reload()
	} catch (err) {
		console.error(err)
		const msg =
			err.response?.data?.error || err.response?.data?.message || 'Password update failed'
		feedback.value = msg
		error.value = true
	} finally {
		loading.value = false
	}
}

async function updateDetails() {
	try {
		// Make API call to update the details
		await api.patch('/users/' + authStore.user.ID, { ...editedUser })
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
	window.location.reload()
}
</script>

<style scoped>
.error {
	color: red;
}
</style>
