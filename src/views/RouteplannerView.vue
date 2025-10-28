<template>
	<div v-if="isAllowed">
		<!-- if user is on a phone or tablet then dont show anything below -->

		<button @click="PlannerStore.switchTab('createVisits')">Create Visits</button>
		<button @click="PlannerStore.switchTab('nonPlannedVisits')">Created Visits</button>
		<button @click="PlannerStore.switchTab('planVisits')">Plan Visits</button>
		<button @click="PlannerStore.switchTab('plannedVisits')">Planned Visits</button>
		<button @click="PlannerStore.switchTab('notVisitedVisits')">Not Visited Visits</button>
		<button @click="PlannerStore.switchTab('reviewVisits')">Review Visits</button>

		<div style="margin-top: 20px">
			<br />
			--------------------
			<br />
			<component :is="getActiveComponent" />
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import { usePlannerStore } from '@/stores/plannerStore'
import { useAuthStore } from '@/stores/auth.js'
import CreateVisits from '@/components/CreateVisits.vue'
import NonPlannedVisits from '@/components/NonPlannedVisits.vue'
import PlanVisits from '@/components/PlanVisits.vue'
import PlannedVisits from '@/components/PlannedVisits.vue'
import NotVisitedVisits from '@/components/NotVisitedVisits.vue'
import ReviewVisits from '@/components/ReviewVisits.vue'

const PlannerStore = usePlannerStore()
const AuthStore = useAuthStore()

const components = {
	createVisits: CreateVisits,
	nonPlannedVisits: NonPlannedVisits,
	planVisits: PlanVisits,
	plannedVisits: PlannedVisits,
	notVisitedVisits: NotVisitedVisits,
	reviewVisits: ReviewVisits,
}

const isAllowed = computed(() => {
	let allowed = false

	if (AuthStore.user?.rights === 'admin') {
		allowed = true
	}
	if (AuthStore.user?.rights === 'developer') {
		allowed = true
	}

	return allowed
})

const getActiveComponent = computed(() => components[PlannerStore.activeTab])
</script>
