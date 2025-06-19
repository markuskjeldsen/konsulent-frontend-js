// RouteEditorView.vue //this page displays all the routes and allows editing them // can also add
new ones
<template>
  <div class="card">
    <div v-for="date in Object.keys(visitsByDate).sort()" :key="date" class="visit-group">
      <h3>{{ date.slice(0, 10) }}</h3>
      <VisitCard v-for="visit in visitsByDate[date]" :key="visit.sagsnr" :visit="visit" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import VisitCard from '@/components/VisitCard.vue'
import { useAuthStore } from '@/stores/auth.js'
import api from '@/utils/axios.js'
import { useRoute } from 'vue-router'
const route = useRoute()

const ROLES = {
  ADMIN: 'admin',
  DEV: 'developer',
  USER: 'user',
}

const authStore = useAuthStore()
const user = computed(() => authStore.user) // user could change

const ID = Number(route.params.id)
const auditor = ref()

api
  .get('/visit_responses')
  .then((response) => {
    auditor.value = response.data.users.find((user) => user.ID === ID)
  })
  .catch((error) => {
    console.error('Error fetching auditor data:', error)
    // Fallback to mock data if API call fails
  })

const visitsByDate = computed(() => {
  console.log('Computing visitsByDate for auditor:', auditor.value.visits)
  const visits = auditor.value?.visits || []
  // dateMap = { '2024-06-22': [visit1, visit2], '2024-06-23': [visit3]}
  return visits.reduce((dateMap, visit) => {
    const date = visit.visit_date
    if (!dateMap[date]) {
      dateMap[date] = []
    }
    dateMap[date].push(visit)
    return dateMap
  }, {})
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

<style scoped></style>
