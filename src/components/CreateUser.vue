<template>
	<div class="container mt-4">
		<div class="card">
			<div class="card-header">
				<h3>Opret bruger</h3>
			</div>
			<div class="card-body">
				<form @submit.prevent="createUser">
					<div class="mb-3">
						<label class="form-label">Brugernavn</label>
						<input type="text" class="form-control" v-model="username" required />
						<div class="form-text">Bruges til at logge ind med</div>
					</div>
					<div class="mb-3">
						<label class="form-label">Initials</label>
						<input type="text" class="form-control" v-model="initials" required />
						<div class="form-text">Konsulentens forkortelse</div>
					</div>
					<div class="mb-3">
						<label class="form-label">Fulde navn</label>
						<input type="text" class="form-control" v-model="fullName" required />
						<div class="form-text">Navnet som vil blive vist om konsulenten</div>
					</div>
					<div class="mb-3">
						<label class="form-label">Rettigheder</label>
						<select class="form-select" v-model="rights">
							<option value="user">Konsulent</option>
							<option value="admin">Admin</option>
							<option value="developer">Dev</option>
						</select>
						<div class="form-text">Bestemmer hvad brugeren kan gøre</div>
					</div>
					<button type="submit" class="btn btn-primary">Tilføj bruger</button>
				</form>
			</div>
		</div>

		<div
			v-if="message"
			class="alert mt-3"
			:class="messageError ? 'alert-danger' : 'alert-success'"
		>
			{{ message }}
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/utils/axios'

const username = ref('')
const initials = ref('')
const fullName = ref('')
const rights = ref('user')
const password = ref('')
const message = ref('')
const messageError = ref(false)

const createUser = () => {
	if (!username.value || !fullName.value || !initials.value) {
		message.value = 'Brugernavn, initials og fulde navn er påkrævet.'
		messageError.value = true
		return
	}
	username.value = username.value.trim()
	fullName.value = fullName.value.trim()
	initials.value = initials.value.trim()

	password.value = Math.random().toString(36).slice(-8)
	api.post('/register', {
		username: username.value,
		password: password.value,
		fullName: fullName.value,
		rights: rights.value,
		intials: initials.value,
	})
		.then((response) => {
			username.value = ''
			fullName.value = ''
			rights.value = 'user'
			initials.value = ''
			message.value = 'Bruger oprettet succesfuldt! Din kode er ' + password.value
			messageError.value = false
		})
		.catch((error) => {
			message.value =
				'Fejl ved oprettelse af bruger: ' + (error.response?.data?.error || error.message)
			messageError.value = true
		})
}
</script>
