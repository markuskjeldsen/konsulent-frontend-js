<template>
	<div>
		<h2>Ikke besøgt</h2>
		<p>man kan også sige at de mangler at blive besøgt</p>
	</div>

	<button @click="DeleteVisits" :disabled="!selectedVisitIds.length">Slet besøg</button>

	<DataTable
		:data="notVisitedVisits"
		:columns="columns"
		selectable
		filterable
		paginated
		:page-size="100"
		@selection-ids-changed="handleIdSelection"
	>
		<template #cell-debitors="{ item }">
			<div v-for="debitor in item.debitors" :key="debitor.ID">
				{{ debitor.name }}
			</div>
		</template>
		<template #cell-status="{ item }"> {{ item.status.ID }}: {{ item.status.text }} </template>

		<template #cell-visit_date="{ item }">
			{{ item.visit_date }}
		</template>
	</DataTable>
</template>

<script setup>
import api from '@/utils/axios'
import { ref, onMounted } from 'vue'
import { parseISO, format } from 'date-fns'
import { da } from 'date-fns/locale/da'
import DataTable from './DataTable.vue'

const columns = [
	{ key: 'ID', label: 'besøgsid', sortable: true, filterable: false },
	{ key: 'sagsnr', label: 'Sags nummer', sortable: true, filterable: true },
	{ key: 'debitors', label: 'Debitorer', sortable: false, filterable: false },
	{ key: 'address', label: 'Adresse', sortable: false, filterable: true },
	{ key: 'status', label: 'Status', sortable: true, filterable: true },
	{ key: 'visit_date', label: 'Besøgs dato', sortable: true, filterable: true },
	{ key: 'type.text', label: 'Type', sortable: true, filterable: true },
]

const notVisitedVisits = ref([])
const selectedVisitIds = ref([])
const error = ref(null)

onMounted(requestNotVisitedVisits)

async function requestNotVisitedVisits() {
	try {
		const response = await api.get('/visits/byStatus', {
			params: { status: '3' },
		})

		const visits = response.data.visit.map((visit) => {
			// Keep original unformatted date for sorting
			const trimmed = visit.visit_date.replace(/(\.\d{3})\d+/, '$1')
			return {
				...visit,
				visit_date_raw: trimmed, // keep for sorting
				visit_date: format(parseISO(trimmed), 'P', { locale: da }), // for display
			}
		})

		// Sort by raw date then by time
		visits.sort((a, b) => {
			const dateA = new Date(a.visit_date_raw)
			const dateB = new Date(b.visit_date_raw)
			if (dateA - dateB !== 0) return dateA - dateB
			return a.visit_time.localeCompare(b.visit_time)
		})

		notVisitedVisits.value = visits
		error.value = null
	} catch (err) {
		error.value = 'Error fetching not visited visits: ' + err.message
		console.error('Error fetching not visited visits:', err)
	}
}

const handleIdSelection = (selectedItems) => {
	selectedVisitIds.value = selectedItems.map((item) => item)
}

async function DeleteVisits() {
	try {
		error.value = ''

		// prep
		const ops = selectedVisitIds.value.map((v) =>
			api.delete('/visit/byId', { params: { id: v } }),
		)

		// execution
		const results = await Promise.allSettled(ops)

		// logging
		results.forEach((r, i) => {
			if (r.status !== 'fulfilled') {
				console.error('Failed to delete', selectedVisitIds.value[i].id, r.reason)
			}
		})

		// Reset selections and refetch data
		selectedVisitIds.value = []
		requestNotVisitedVisits()

		console.log('Planning successful')
	} catch (err) {
		console.error('Planning failed:', err)
	}
}
</script>

<style scoped>
.visits-table {
	width: 100%;
	border-collapse: collapse;
	margin-top: 1rem;
}

.visits-table th,
.visits-table td {
	border: 1px solid #ddd;
	padding: 12px;
	text-align: left;
}

.visits-table th {
	background-color: #f5f5f5;
	font-weight: bold;
}

.visit-row {
	cursor: pointer;
	transition: background-color 0.2s;
}

.visit-row:hover {
	background-color: #f9f9f9;
}

.error {
	color: red;
	padding: 10px;
	background-color: #fee;
	border: 1px solid #fcc;
	border-radius: 4px;
	margin: 10px 0;
}

.no-data {
	text-align: center;
	padding: 20px;
	color: #666;
}
</style>
