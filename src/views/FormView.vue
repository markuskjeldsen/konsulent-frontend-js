<template>
	<div>
		<div v-if="!visitData">Indlæser...</div>
		<div v-if="isSubmitting">Indsender...</div>

		<PurchaseForm
			v-if="visitData?.type?.ID === 1"
			v-model:formData="formData"
			:visitData="visitData"
			@submit="() => submitForm(visitData.ID)"
			@images="handleImageUpload"
			@remove-image="removeImageAt"
			:isSubmitting="isSubmitting"
		/>
		<LeasingForm
			v-if="visitData?.type?.ID === 2"
			v-model:formData="formData"
			:visitData="visitData"
			@submit="() => submitForm(visitData.ID)"
			@images="handleImageUpload"
			@remove-image="removeImageAt"
			:isSubmitting="isSubmitting"
		/>
		<BlancoForm
			v-if="visitData?.type?.ID === 3"
			v-model:formData="formData"
			:visitData="visitData"
			@submit="() => submitForm(visitData.ID)"
			@images="handleImageUpload"
			@remove-image="removeImageAt"
			:isSubmitting="isSubmitting"
		/>
		<LetterForm
			v-if="visitData?.type?.ID === 4"
			v-model:formData="formData"
			:visitData="visitData"
			@submit="() => submitForm(visitData.ID)"
			@images="handleImageUpload"
			@remove-image="removeImageAt"
			:isSubmitting="isSubmitting"
		/>
		<!--
    /købekontrakt 1
    /leasing 2
    blanco 3
    brev 4
    --></div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PurchaseForm from '@/components/forms/PurchaseForm.vue'
import LeasingForm from '@/components/forms/LeasingForm.vue'
import BlancoForm from '@/components/forms/BlancoForm.vue'
import LetterForm from '@/components/forms/LetterForm.vue'

import api from '@/utils/axios'

const router = useRouter()
const route = useRoute()
const ID = Number(route.params.id)
const visitData = ref(null)
const isSubmitting = ref(false)
const sumbitAbort = ref(null)
const isCapturingLocation = ref(false)
const debtData = ref(null)
const restgadoAntagetVal = ref(0)

const formData = reactive({
	debitor_is_home: null,
	civil_status: '',
	payment_received: null,
	asset_at_address: null,
	asset_damaged: null,

	asset_at_workshop: null,
	asset_clean: null,
	asset_location: '',
	asset_comments: '',
	odometer_km: 0,

	has_work: null,
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

function removeImageAt(i) {
	const [removed] = formData.images.splice(i, 1)
	if (removed?.preview) {
		try {
			URL.revokeObjectURL(removed.preview)
		} catch {
			console.log('an error ocurred')
		}
	}
}

onMounted(async () => {
	try {
		const response = await api.get('/visits/byId', {
			params: { id: ID },
		})

		const debtInfo = await api.get('/visits/debt', {
			params: { VisitId: ID },
		})
		visitData.value = response.data.visit
		visitData.value.debt = debtInfo.data[0]
		debtData.value = debtInfo.data[0]
		await getLocation()
	} catch (error) {
		console.error('Error fetching visit:', error)
		// Handle error appropriately
	}

	const antaget = parseFloat(debtData.value.RestgeldAntaget)
	restgadoAntagetVal.value = antaget === 0 ? debtData.value.RestgeldVedBrev : antaget
})

async function submitForm(visitId) {
	if (formData.asset_at_address && formData.images.length === 0) {
		alert('Du skal tilføje mindst ét billede når køretøjet er til stede.')
		return
	}
	isSubmitting.value = true
	try {
		const now = new Date()
		const payload = {
			visit_id: visitId,
			actual_date: now.toISOString(),
			actual_time: now.toTimeString().slice(0, 8),
			...Object.fromEntries(Object.entries(formData).filter(([k]) => k !== 'images')),
		}
		const { data } = await api.post('/visit-response/create', payload)

		if (formData.images.length && data.ID) {
			for (let i = 0; i < formData.images.length; i++) {
				const { file } = formData.images[i]
				const fd = new FormData()
				fd.append('visit_response_id', data.ID)
				fd.append('image', file)
				fd.append('sequence', i + 1)
				const url = `/visit-response/${data.ID}/images`
				await api.post(url, fd, { headers: { 'Content-Type': undefined } })
			}
		}
	} catch (err) {
		console.error('Error submitting form:', err)
		alert('Noget gik galt. Prøv igen.')
	} finally {
		isSubmitting.value = false
		sendBack()
	}
}

const getLocation = () => {
	// Fallback coordinates (e.g., a default location like Copenhagen, Denmark)
	const fallbackLocation = {
		latitude: '0',
		longitude: '0',
		accuracy: '0',
	}

	if (!navigator.geolocation) {
		alert('Geolocation ikke understøttet')
		formData.actual_latitude = fallbackLocation.latitude
		formData.actual_longitude = fallbackLocation.longitude
		formData.pos_accuracy = fallbackLocation.accuracy
		return
	}

	if (!window.isSecureContext) {
		alert('Geolocation kræver en sikker forbindelse (HTTPS). Fallback placering bruges.')
		formData.actual_latitude = fallbackLocation.latitude
		formData.actual_longitude = fallbackLocation.longitude
		formData.pos_accuracy = fallbackLocation.accuracy
		return
	}

	isCapturingLocation.value = true
	let bestPosition
	let watchId = null

	const finish = () => {
		if (watchId !== null) navigator.geolocation.clearWatch(watchId)
		if (bestPosition) {
			formData.actual_latitude = bestPosition.coords.latitude.toString()
			formData.actual_longitude = bestPosition.coords.longitude.toString()
			formData.pos_accuracy = bestPosition.coords.accuracy.toString()
		} else {
			formData.actual_latitude = fallbackLocation.latitude
			formData.actual_longitude = fallbackLocation.longitude
			formData.pos_accuracy = fallbackLocation.accuracy
		}
		isCapturingLocation.value = false

		console.log(formData.actual_latitude)
		console.log(formData.actual_longitude)
		console.log(formData.pos_accuracy)
	}

	watchId = navigator.geolocation.watchPosition(
		(position) => {
			if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
				bestPosition = position
				// Stop if accuracy is below 15 meters (customize as needed)
				if (position.coords.accuracy <= 15) finish()
			}
		},
		(error) => {
			console.error('GPS error:', error)
			alert('Kunne ikke hente præcis placering. Fallback placering bruges.')
			bestPosition = null
			finish()
		},
		{ enableHighAccuracy: true },
	)

	// Force finish after 10 seconds to avoid infinite wait
	console.log('starting geolocation')
	setTimeout(finish, 10 * 1000)
}

// image picker in parent
function handleImageUpload(e) {
	const files = Array.from(e.target.files)
	const maxMB = 10
	const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
	files.forEach((file) => {
		if (!allowed.includes(file.type)) return
		if (file.size > maxMB * 1024 * 1024) return
		formData.images.push({
			file,
			preview: URL.createObjectURL(file),
			name: file.name,
		})
	})
	e.target.value = '' // allow same-file reselect
}

// Revoke object URLs for removed images to avoid leaks
let lastImages = []
watch(
	() => formData.images.map((i) => i.preview),
	(nv, ov) => {
		const removed = (ov || []).filter((p) => !nv.includes(p))
		removed.forEach((p) => {
			try {
				URL.revokeObjectURL(p)
			} catch {}
		})
		lastImages = nv
	},
	{ immediate: true },
)

function sendBack() {
	const id = visitData.value.user.ID

	router.push(`/auditor/${id}`)
}
</script>
