<template>
  <div class="auditor-view"></div>
  <div class="card">
    <VisitCard v-for="visit in visibleVisits" :key="visit.id" :visit="visit" />
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
      const retnStemnt = new Date(visitDay) >= new Date(todayString) || !visit.visited
      return retnStemnt
    })
  } else {
    // Optional: handle other roles
    console.error('Unknown user role:', role)
    return []
  }
})

/** @typedef {Object} Visit
 *  @property {number} user_id
 * @property {string} address
 * @property {string} DebitorName
 * @property {string} DebitorPhone
 * @property {string} latitude
 * @property {string} longitude
 * @property {string} notes
 * @property {number} sagsnr
 * @property {string} VisitDate
 * @property {string} VisitTime
 * @property {string} visit_interval
 * @property {boolean} visited
 */
</script>

<style scoped>
.auditor-view {
  padding: 20px;
}
.card {
  display: flex;
  flex-direction: column;
  gap: 2px; /* space between cards */
  margin: 0px; /* space between cards */
  align-items: flex-start; /* align the tops */
}
</style>
