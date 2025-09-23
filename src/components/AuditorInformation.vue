<template>
	<div class="auditor-view"></div>
	<div v-for="group in groupedVisitsByDate" :key="group.date" class="visit-group">
		<h3 class="date-header">
			{{
				new Date(group.date).toLocaleDateString('da-DK', {
					day: '2-digit',
					month: '2-digit',
					year: 'numeric',
				})
			}}
		</h3>

		<table class="visit-table">
			<thead>
				<tr>
					<th></th>
					<th>Adresse</th>
					<th>Debitor Navn</th>
					<th>Besøgs interval</th>
					<th>Est. ank.</th>
					<th>status and type</th>
				</tr>
			</thead>
			<tbody>
				<VisitCard v-for="visit in group.visits" :key="visit.id" :visit="visit" />
			</tbody>
		</table>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import VisitCard from './VisitCard.vue'
import { useAuthStore } from '@/stores/auth.js'
const ROLES = {
	ADMIN: 'admin',
	DEV: 'developer',
	USER: 'user',
}
const props = defineProps({
	auditor: {
		// prop name should match usage in parent components
		type: Object,
		required: true,
	},
})

// Helper: get today's date in YYYY-MM-DD
function getTodayString() {
	const today = new Date()
	const yyyy = today.getFullYear()
	const mm = String(today.getMonth() + 1).padStart(2, '0')
	const dd = String(today.getDate()).padStart(2, '0')
	return `${yyyy}-${mm}-${dd}`
}

const authStore = useAuthStore()
const user = computed(() => authStore.user) // user could change

// Only recompute visits to display if props or user change
const visibleVisits = computed(() => {
	const allVisits = props.auditor?.visits || [] // remove the ? at some point
	const role = user.value?.rights

	if (role === ROLES.ADMIN || role === ROLES.DEV) {
		return allVisits
	} else if (role === ROLES.USER) {
		const todayString = getTodayString()
		return allVisits.filter((visit) => {
			// Extract only the date part, ignore time and timezone
			const visitDay = visit.visit_date?.slice(0, 10)
			const retnStemnt = new Date(visitDay) >= new Date(todayString) && visit.status_id === 3
			return retnStemnt
		})
	} else {
		// Optional: handle other roles
		console.error('Unknown user role:', role)
		return []
	}
})

const timeToMs = (t) => {
	if (!t) return 0
	const [h, m = 0, s = 0] = t.split(':').map(Number)
	return ((h * 60 + m) * 60 + s) * 1000
}

const dayFromUtcISO = (iso) => iso.slice(0, 10) // "YYYY-MM-DD" from ISO-UTC

// Group visits by date, sorted by date (newest/oldest as needed)
const groupedVisitsByDate = computed(() => {
	// 1) Sort globally by date+time to keep final order stable
	const sorted = [...visibleVisits.value].sort((a, b) => {
		const aKey = Date.parse(`${dayFromUtcISO(a.visit_date)}T${a.visit_time || '00:00:00'}Z`)
		const bKey = Date.parse(`${dayFromUtcISO(b.visit_date)}T${b.visit_time || '00:00:00'}Z`)
		return aKey - bKey
	})

	// 2) Group by day
	const map = new Map()
	for (const v of sorted) {
		const day = dayFromUtcISO(v.visit_date)
		if (!map.has(day)) map.set(day, [])
		map.get(day).push(v)
	}

	// 3) Ensure each day's items are sorted by visit_time
	for (const arr of map.values()) {
		arr.sort((a, b) => timeToMs(a.visit_time) - timeToMs(b.visit_time))
	}

	return [...map.entries()].map(([date, visits]) => ({ date, visits }))
})
</script>

<style scoped>
.auditor-view {
	padding: 20px;
}
.visit-table {
	width: 100%; /* Make table much wider */
	min-width: 720px; /* Nice min width for readability */
	border-collapse: separate;
	border-spacing: 0 0.5em;
	background: white;
}
.visit-table th,
.visit-table td {
	padding: 8px 10px;
	text-align: left;
	/* adjust width as desired */
}
.visit-table th {
	background: #f5f5fb;
	border-bottom: 1px solid #ddd;
	font-weight: 600;
}
.visit-table tr {
	background: #fff;
	border-radius: 8px;
	box-shadow: 0 0 0 1px #e5e5e5;
}
.checkmark-cell {
	width: 32px;
	text-align: center;
}
.date-header {
	margin-top: 20px;
	margin-bottom: 2px;
	font-size: 1.15em;
	font-weight: bold;
}
.visit-group {
	width: 100%;
	margin-bottom: 24px;
}
</style>
