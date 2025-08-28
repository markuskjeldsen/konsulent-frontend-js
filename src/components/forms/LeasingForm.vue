<template>
	<div style="margin: 16px">
		<h1>leasing</h1>
		<p>
			Fordi det er en leasingaftale så ejer skyldner ikke bilen, derfor kan man bare tage
			bilen uden kontrakt.
		</p>
	</div>

	<div style="margin: 16px">
		<p class="auditor-name" @click="toggleExpanded">
			Debitor: {{ filteredData?.debitors?.[0]?.name ?? '—' }}
		</p>
		<div v-if="expanded && filteredData?.debitors?.length">
			<p>Advopro_debitor_id: {{ filteredData.debitors[0]?.Advopro_debitor_id ?? '—' }}</p>
			<p>
				phone:
				{{ filteredData.debitors[0]?.phone ?? filteredData.debitors[0]?.phone_work ?? '—' }}
			</p>
			<p>Mail: {{ filteredData.debitors[0]?.email ?? '—' }}</p>
			<p>gender: {{ filteredData.debitors[0]?.gender ?? '—' }}</p>
			<p>age: {{ filteredData.debitors[0]?.age ?? '—' }}</p>
			<p>AntagetHovedstol: {{ filteredData.debt?.KreditorHovedstol ?? '—' }}</p>
			<p>RestanceDato: {{ filteredData.debt?.RestanceDato ?? '—' }}</p>
			<p>Antaget restgæld: {{ filteredData.debt?.RestgeldAntaget ?? '—' }}</p>
			<p>restgæld ved afsendt brev: {{ filteredData.debt?.RestgeldVedBrev ?? '—' }}</p>
			<p>Sum af indbetalinger: {{ filteredData.debt?.SumIndbetalinger ?? '—' }}</p>
			<p>
				Sum af indbetalinger ved afsendt brev:
				{{ filteredData.debt?.SumIndbetalingVedBrev ?? '—' }}
			</p>
		</div>
	</div>

	<form @submit.prevent="emit('submit')">
		<!-- debitor hjemme? -->
		<YesNo
			label="Er debitor hjemme?"
			name="debitor_is_home"
			v-model="fd.debitor_is_home"
			:required="true"
		/>

		<!-- Betaling modtaget? -->

		<YesNo
			label="Er betaling modtaget?"
			name="payment_received"
			v-model="fd.payment_received"
		/>

		<!-- Bilen til stede på adressen? -->
		<YesNo
			label="Er bilen til stede på adressen?"
			name="asset_at_address"
			v-model="fd.asset_at_address"
			:required="true"
		/>

		<label v-if="fd.asset_at_address">
			Aktuel km-stand
			<input v-model.number="fd.odometer_km" type="number" min="0" step="1" required />
		</label>

		<!-- Bilen på værksted? -->
		<div v-if="!fd.asset_at_address && fd.asset_at_address != undefined && fd.debitor_is_home">
			<label
				>Hvor er bilen lige nu? (værksted,ude og køre)
				<input
					v-model.trim="fd.asset_location"
					type="text"
					placeholder="Adresse/sted"
					required
				/>
			</label>
			<label
				>Hvem kører den?
				<input
					v-model.trim="fd.asset_driver"
					type="text"
					placeholder="Navn/telefon"
					required
				/>
			</label>
		</div>

		<!-- Bilen skadet? -->

		<YesNo
			v-if="fd.asset_at_address || fd.debitor_is_home"
			label="Er bilen skadet?"
			name="asset_damaged"
			v-model="fd.asset_damaged"
			:required="true"
		/>

		<!-- Bilen ryddet? -->
		<YesNo
			v-if="fd.asset_at_address"
			label="Er bilen ryddet?"
			name="asset_clean"
			v-model="fd.asset_clean"
			:required="true"
		/>
		<div>
			<label> Kommentarer til aktivet </label>
			<br />
			<textarea
				v-model.trim="fd.asset_comments"
				cols="50"
				rows="4"
				placeholder="Evt. noter"
			></textarea>
		</div>
		<!-- Nøgler givet/modtaget -->
		<YesNo
			label="Er nøgler givet til konsulenten?"
			name="keys_given"
			v-model="fd.keys_given"
			:required="true"
		/>

		<!-- Billeder af bilen -->
		<FileUpload
			id="car-photo"
			title="Billede af bilen og postkassen"
			hint="Tryk for at vælge billeder (flere tilladt)"
			icon="📷"
			accept="image/*"
			:multiple="true"
			@images="onFileChange"
		/>
		<br />
		<label
			>generelle kommentarer
			<br />

			<textarea
				v-model.trim="fd.comments"
				cols="50"
				rows="4"
				placeholder="Evt. noter"
			></textarea>
		</label>
		<br />
		<button type="submit" :disabled="isSubmitting">Aflever svar</button>
	</form>

	<!--
leasing kan man bare tage bilen
mere målrettet mod aktivet istedet for personen
check bokse er bilen skadet? er den ryddet? hvor langt er bilen kørt lige nu?, 
billeder af bilen 
er bilen tilstede? er den på værkstedet? hvor er den lige nu? hvis ikke hjemme så hvor og hvem kører den?
er bilen tilskade? normale spørgsmål.
--></template>

<script setup>
import { computed, ref } from 'vue'
import YesNo from '@/components/forms/YesNo.vue'
import FileUpload from '@/components/forms/FileUpload.vue'

const expanded = ref(false)
const toggleExpanded = () => {
	expanded.value = !expanded.value
}

const props = defineProps({
	visitData: { type: Object, required: true },
	formData: { type: Object, required: true },
	isSubmitting: { type: Boolean, default: false },
})
const emit = defineEmits(['update:formData', 'submit', 'images'])

const fd = computed({
	get: () => props.formData,
	set: (v) => emit('update:formData', v),
})

function onFileChange(e) {
	emit('images', e)
}

function calculateAge(birthday) {
	if (!birthday) return ''
	const birthDate = new Date(birthday)
	const today = new Date()
	let age = today.getFullYear() - birthDate.getFullYear()
	const m = today.getMonth() - birthDate.getMonth()
	if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
		age--
	}
	return age
}

const filteredData = computed(() => {
	const visit = props.visitData || {}
	const debitors = (visit.debitors || []).map((d) => ({
		...d,
		age: calculateAge(d.birthday),
	}))
	return { ...visit, debitors }
})
</script>
