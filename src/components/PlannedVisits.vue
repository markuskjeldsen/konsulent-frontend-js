<template>
	<div>
		<h3>Planlagte besøg</h3>

		<div v-if="error" class="error">{{ error }}</div>

		<div class="actions">
			<button @click="handleSendLetter" :disabled="!selectedVisitIds.length">
				Send brev til valgte besøg ({{ selectedVisitIds.length }})
			</button>
			<button @click="handleDeleteVisits" :disabled="!selectedVisitIds.length">
				Slet valgte besøg ({{ selectedVisitIds.length }})
			</button>
		</div>

		<DataTable
			ref="dataTableRef"
			:data="visits"
			:columns="columns"
			selectable
			filterable
			paginated
			:page-size="100"
			@selection-ids-changed="handleSelectionChange"
		>
			<template #cell-konsulentName="{ item }">
				{{ item.konsulentName }}
			</template>
			<template #cell-debitors="{ item }">
				<div v-for="debitor in item.debitors" :key="debitor.ID">
					{{ debitor.name }}
				</div>
			</template>
			<template #cell-address="{ item }">
				{{ formatAddress(item.address) }}
			</template>
			<template #cell-visit_date="{ item }">
				{{ formatDate(item.visit_date) }}
			</template>
		</DataTable>
	</div>
</template>

<script setup>
import api from '@/utils/axios'
import { ref, onMounted } from 'vue'
import DataTable from './DataTable.vue'

const columns = [
	{ key: 'ID', label: 'Besøgs ID', sortable: true, filterable: true },
	{ key: 'konsulentName', label: 'Konsulent', sortable: true, filterable: true },
	{ key: 'debitors', label: 'Debitorer', sortable: false, filterable: false },
	{ key: 'address', label: 'Adresse', sortable: false, filterable: true },
	{ key: 'visit_date', label: 'Dato', sortable: true, filterable: true },
	{ key: 'visit_time', label: 'Tidspunkt', sortable: true, filterable: false },
	{ key: 'visit_interval', label: 'Interval', sortable: false, filterable: false },
]

const visits = ref([])
const selectedVisitIds = ref([])
const error = ref(null)
const dataTableRef = ref(null)

onMounted(async () => {
	await getPlannedVisits()
})

async function getPlannedVisits() {
	try {
		const res = await api.get('/visits/planned')
		visits.value = (res.data || []).flatMap((konsulent) =>
			(konsulent.visits || []).map((visit) => ({
				...visit,
				konsulentName: konsulent.name,
			})),
		)
		visits.value.sort((a, b) => a.stop_nr - b.stop_nr)
		error.value = null
	} catch (err) {
		console.error('Error fetching planned visits:', err)
		error.value = 'Fejl ved hentning af planlagte besøg'
	}
}

function formatAddress(address) {
	if (!address) return ''
	return address.replace(/\r?\n/g, ', ')
}

function formatDate(date) {
	if (!date) return ''
	const d = new Date(date)
	return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

const handleSelectionChange = (selectedIds) => {
	selectedVisitIds.value = selectedIds
}

async function handleSendLetter() {
	if (!selectedVisitIds.value.length) return

	error.value = null
	try {
		const ops = selectedVisitIds.value.map((id) =>
			api.post('/visit/letterSent', null, { params: { id } }),
		)
		const results = await Promise.allSettled(ops)

		let hasErrors = false
		results.forEach((r, i) => {
			if (r.status !== 'fulfilled') {
				console.error(`Failed to send letter for ${selectedVisitIds.value[i]}:`, r.reason)
				hasErrors = true
			}
		})

		if (hasErrors) {
			error.value = 'Nogle breve blev ikke sendt. Prøv igen.'
		}

		selectedVisitIds.value = []
		dataTableRef.value?.clearSelection()
		await getPlannedVisits()
	} catch (err) {
		console.error('Error sending letters:', err)
		error.value = 'Fejl ved afsendelse af breve'
	}
}

async function handleDeleteVisits() {
	if (!selectedVisitIds.value.length) return

	error.value = null
	try {
		const ops = selectedVisitIds.value.map((id) =>
			api.delete('/visit/byId', { params: { id } }),
		)
		const results = await Promise.allSettled(ops)

		results.forEach((r, i) => {
			if (r.status !== 'fulfilled') {
				console.error(`Failed to delete ${selectedVisitIds.value[i]}:`, r.reason)
			}
		})

		selectedVisitIds.value = []
		dataTableRef.value?.clearSelection()
		await getPlannedVisits()
	} catch (err) {
		console.error('Error deleting visits:', err)
		error.value = 'Fejl ved sletning af besøg'
	}
}
</script>

<style scoped>
.actions {
	display: flex;
	gap: 1rem;
	margin-bottom: 1rem;
}

.actions button {
	padding: 0.5rem 1rem;
	border: 1px solid #d1d5db;
	background: white;
	border-radius: 0.375rem;
	cursor: pointer;
	font-size: 0.875rem;
	transition: all 0.2s;
}

.actions button:hover:not(:disabled) {
	background-color: #f3f4f6;
	border-color: #9ca3af;
}

.actions button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.error {
	color: red;
	padding: 10px;
	background-color: #fee;
	border: 1px solid #fcc;
	border-radius: 4px;
	margin-bottom: 1rem;
}
</style>
