<template>
	<div style="margin: 16px">
		<h1>Købe kontrakt</h1>
		<p>
			Fordi det er en købekontrakt så ejer skyldner bilen men de har ikke betalt de penge som
			de skylder i den. prøv at få dem til at signere kontrakten.
		</p>
	</div>

	<div style="margin: 16px">
		<button
			class="debitor-toggle"
			@click="toggleExpanded"
			:aria-expanded="expanded ? 'true' : 'false'"
			aria-controls="debitor-panel"
		>
			<span>Debitor: {{ filteredData?.debitors?.[0]?.name ?? '—' }}</span>
		</button>

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

	<!--
  const formData = reactive({
  debitor_is_home: false,
  civil_status: '',
  payment_received: false,
  asset_at_address: false,
  asset_damaged: false,

  asset_at_workshop: false,
  asset_clean: false,
  asset_location: '',
  asset_comments: '',
  odometer_km: 0,

  has_work: false,
  position: '',
  salary: 0,
  children_under_18: 0,
  children_over_18: 0,
  comments: '',
  property_type: '',
  maintenance_status: '',
  ownership_status: '',
  actual_latitude: '',
  actual_longitude: '',
  posAccuracy: '',
  images: [],
})

  -->

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
				<input v-model.trim="fd.asset_location" type="text" placeholder="Adresse/sted" />
			</label>
			<label
				>Hvem kører den?
				<input v-model.trim="fd.asset_driver" type="text" placeholder="Navn/telefon" />
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

		<!-- Nøgler givet/modtaget -->
		<YesNo
			label="Er nøgler givet til konsulenten?"
			name="keys_given"
			v-model="fd.keys_given"
			:required="true"
		/>

		<!-- Salgsfuldmagt/kontrakt underskrevet -->

		<YesNo
			v-if="fd.debitor_is_home"
			label="Er salgsfuldmagt underskrevet?"
			name="sf_signed"
			v-model="fd.sf_signed"
			:required="true"
		/>

		<YesNo
			v-if="fd.debitor_is_home"
			label="Er salgs-/eftergivelseaftale underskrevet?"
			name="se_signed"
			v-model="fd.se_signed"
			:required="true"
		/>

		<!-- Billeder af bilen -->
		<FileUpload
			id="car-photo"
			title="Billede af bilen og postkassen"
			hint="Tryk for at tilføje ét billede ad gangen"
			icon="📷"
			accept="image/*"
			:multiple="false"
			:append-mode="true"
			:files="formData.images"
			@images="(e) => emit('images', e)"
			@remove="removeAt"
			@update:files="onUpdateFiles"
		/>

		<br />
		<label
			>Kommentarer
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
  købekontrakt tage bilen hvis underskrift (salgs fuldmagt)
  mere målrettet mod aktivet istedet for personen
  check bokse er bilen skadet? er den ryddet? hvor langt er bilen kørt lige nu?
  billeder af bilen 
  er bilen tilstede? er den på værkstedet? hvor er den lige nu? hvis ikke hjemme så hvor og hvem kører den?
  er bilen tilskade? normale spørgsmål.
  
  
  -->

	<!--
  <pre v-if="expanded" v-text="JSONData"></pre>
  -->
</template>

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
const emit = defineEmits(['update:formData', 'submit', 'images', 'remove-image'])

function onUpdateFiles(next) {
	emit('update:formData', { ...props.formData, images: next })
}
const fd = computed({
	get: () => props.formData,
	set: (v) => emit('update:formData', v),
})
function removeAt(index) {
	// do not mutate here; let the owner (FormView) revoke URLs
	emit('remove-image', index)
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
<style scoped>
.debitor-toggle {
	background: none;
	border: 0;
	padding: 0;
	font: inherit;
	cursor: pointer;
}
.debitor-toggle::after {
	content: ' ▸'; /* closed */
}
.debitor-toggle[aria-expanded='true']::after {
	content: ' ▾'; /* open */
}
.debitor-toggle:hover {
	text-decoration: underline;
}
</style>
