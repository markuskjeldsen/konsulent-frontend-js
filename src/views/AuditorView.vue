// AuditorView
<template>
  <div class="auditor-view">
    <h2>Konsulent Info</h2>
    <p class="auditor-name" @click="toggleExpanded">Konsulent: {{ auditor?.name }}</p>
    <div v-if="expanded" class="auditor-details">
      <p>telefonnr: {{ auditor.phone }}</p>
      <p>Mail: {{ auditor.email }}</p>
      <p>id: {{ ID }}</p>
    </div>
    <span v-if="canEdit">
      <button class="manage-button" @click="EditRoute">Rediger Ruter</button>
    </span>
    <div style="width: 100%">
      <AuditorInformation v-if="auditor" :auditor="auditor" />
      <div v-else>Loading auditor info…</div>
    </div>
  </div>
</template>

<script setup>
/**
 * @typedef {Object} Visit
 * @property {number} user_id
 * @property {string} address
 * @property {string} DebitorName
 * @property {string} DebitorPhone
 * @property {string} latitude
 * @property {string} longitude
 * @property {string} notes
 * @property {number} sagsnr
 * @property {string} visit_date
 * @property {string} visit_time
 * @property {string} visit_interval
 * @property {boolean} visited
 */
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/axios.js'
import AuditorInformation from '@/components/AuditorInformation.vue'
import { useAuthStore } from '@/stores/auth.js'

const ROLES = {
  ADMIN: 'admin',
  DEV: 'developer',
  USER: 'user',
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)
const auditor = ref()

const canEdit = computed(() => {
  const role = user.value?.rights
  return role === ROLES.ADMIN || role === ROLES.DEV
})

// Get the id from the route parameters
const ID = Number(route.params.id)

const expanded = ref(false)
function toggleExpanded() {
  expanded.value = !expanded.value
}

api
  .get('/visit-response/all')
  .then((response) => {
    auditor.value = response.data.users.find((user) => user.ID === ID)
  })
  .catch((error) => {
    console.error('Error fetching auditor data:', error)
    // Fallback to mock data if API call fails
  })

function EditRoute() {
  if (!canEdit.value) {
    console.warn('User does not have permission to edit auditors.')
    return null
  }
  // Redirect to the edit route for the auditor
  router.push({
    name: 'routeEditor',
    params: { id: ID },
  })
  console.log('Redirecting to edit route for auditor with ID:', ID)
}
</script>

<style scoped>
.auditor-view {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* aligns text to the left */
  gap: 0.2rem; /* space between elements */
}

.auditor-view p {
  font-size: larger;
}

.auditor-details {
  margin-left: 1rem;
  border-left: 2px solid #eee;
  padding-left: 1rem;
}

p.auditor-name {
  cursor: zoom-in;
  font-size: x-large;
}
</style>
