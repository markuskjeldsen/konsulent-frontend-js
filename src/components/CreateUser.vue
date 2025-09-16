<template>
	<h3>create user</h3>
	<p>her kan man lave nye brugere</p>
	<br />
	<form @submit.prevent="createUser">
		<div>
			<label> username: </label>
			<input type="text" v-model="username" />
			<label> bruges til at logge ind med </label>
		</div>
		<div>
			<label> Fulde navn: </label>
			<input type="text" v-model="fullName" />
			<label> Navnet som vil blive vist om konsulenten</label>
		</div>
		<div>
			<label for="rights">Rettigheder: </label>
			<select id="rights" name="rights" v-model="rights">
				<option value="user">Konsulent</option>
				<option value="admin">Admin</option>
				<option value="developer">Dev</option>
			</select>
			<label> bestemmer hvad brugeren kan gøre </label>
		</div>
		<button type="submit">tilføj</button>
	</form>
	<p v-if="message">
		<strong>{{ message }}</strong>
	</p>

	<br v-if="message" />
</template>

<script setup>
import { ref } from 'vue'
import api from '@/utils/axios'

const username = ref('')
const fullName = ref('')
const rights = ref('user')
const password = ref('') // To store the generated password
const message = ref('')

const createUser = () => {
	// Logik for at oprette en bruger
	console.log('Opretter bruger:', {
		username: username.value,
		fullName: fullName.value,
		rights: rights.value,
	})
	// create a random password
	if (!username.value || !fullName.value) {
		message.value = 'Brugernavn og fulde navn er påkrævet.'
		return
	}
	username.value = username.value.trim()
	fullName.value = fullName.value.trim()

	password.value = Math.random().toString(36).slice(-8)
	console.log('Genereret kodeord:', password.value)
	api.post('/register', {
		username: username.value,
		password: password.value,
		fullName: fullName.value,
		rights: rights.value,
	})
		.then((response) => {
			console.log('Bruger oprettet:', response.data)
			// Ryd formularfelterne
			username.value = ''
			fullName.value = ''
			rights.value = 'user'
			// Eventuelt navigere til en anden side eller vise en succesmeddelelse
			message.value = 'Bruger oprettet succesfuldt! Din kode er ' + password.value
		})
		.catch((error) => {
			message.value = 'Fejl ved oprettelse af bruger: ' + error.response.data.error
			console.error('Fejl ved oprettelse af bruger:', error)
			// Håndter fejl, f.eks. vis en fejlmeddelelse
		})
}
</script>
