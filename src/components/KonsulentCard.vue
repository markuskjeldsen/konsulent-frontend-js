<template>
	<div>
		<div class="auditor-card mb-3 text-center" @click="open">
			<div class="bubble mb-3">
				<div
					class="m-1 mx-auto d-inline-block"
					:style="{
						backgroundColor: randomColor(),
						height: '100px',
						width: '100px',
						borderRadius: '50%',
					}"
				/>
				<h2 class="h4 text-light auditor-name">{{ upperFirst(konsulent.name) }}</h2>
			</div>

			<div class="d-inline-block text-start mb-3">
				<CardStatusField
					:number="missingVisitsToday"
					active-class="text-danger"
					text="missing visits"
				/>
			</div>

			<div v-if="nextVisitTime" class="auditor-card-footer mt-auto">
				<p class="mb-1">Next today</p>
				<p class="fw-bold">
					{{ nextVisitTime }}
				</p>
			</div>
		</div>
	</div>
</template>

<script setup>
import CardStatusField from '@/components/CardStatusField.vue'
import { minBy } from 'lodash-es'
import { defineProps, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
	konsulent: {
		type: Object,
		required: true,
	},
})

function upperFirst(fullName) {
	if (typeof fullName !== 'string' || !fullName.trim()) {
		return ''
	}
	// Split the trimmed name by any whitespace
	const nameParts = fullName.trim().split(/\s+/)

	// Map each part to its first character and join them
	const initials = nameParts.map((part) => part[0].toUpperCase()).join('')

	return initials
}

function isToday(dateString) {
	const visitDate = new Date(dateString)
	const today = new Date()
	return (
		visitDate.getFullYear() === today.getFullYear() &&
		visitDate.getMonth() === today.getMonth() &&
		visitDate.getDate() === today.getDate()
	)
}

const nextVisitTime = computed(() => {
	const todayVisits = props.konsulent.visits.filter(
		(visit) => !visit.visit_response && isToday(visit.visit_date),
	)
	const minVisit = minBy(todayVisits, 'visit_time')
	return minVisit ? minVisit.visit_time : null
})

const missingVisitsToday = computed(() => {
	return Array.isArray(props.konsulent.visits)
		? props.konsulent.visits.filter(
				(visit) => isToday(visit.visit_date) && !visit.visit_response, // Update this to your business logic
			).length
		: 0
})

function open() {
	router.push(`/auditor/${props.konsulent.ID}`)
}

function randomColor() {
	const minLuminance = 0.6 // not too dark
	const maxLuminance = 0.9 // not too light
	let color
	let luminance
	do {
		color =
			'#' +
			Math.floor(Math.random() * 0xffffff)
				.toString(16)
				.padStart(6, '0')
		luminance = getLuminance(color)
	} while (luminance < minLuminance || luminance > maxLuminance)
	return color
}

function getLuminance(color) {
	const hex = color.replace(/^#/, '')
	const r = parseInt(hex.slice(0, 2), 16) / 255
	const g = parseInt(hex.slice(2, 4), 16) / 255
	const b = parseInt(hex.slice(4, 6), 16) / 255
	return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
</script>

<style scoped>
.auditor-card {
	cursor: pointer;
	transition: all 0.2s ease-in-out;
	min-height: 250px;
	padding: 20px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	background-color: rgba(99, 169, 219, 0.178);
	border-radius: 50px;
}

.auditor-card-footer {
	border-top: 1px solid #000000;
	padding-top: 10px;
	margin-top: 10px;
	font-size: 90%;
}

.auditor-card:hover {
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.bubble {
	text-align: center;
	position: relative;
}

.bubble .auditor-name {
	position: absolute;
	left: 50%;
	top: 51%;
	transform: translate(-50%, -50%);
	text-transform: uppercase;
}

.auditor-card-footer {
	margin: 0;
	font-size: 90%;
}
</style>
