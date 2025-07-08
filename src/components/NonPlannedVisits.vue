<template>
  <div>
    <h3>These visits have not yet been planned</h3>

    <!-- Selection Form -->
    <form @submit.prevent="handlePlanVisits" class="planning-form">
      <div class="form-row">
        <button type="submit" :disabled="!selectedVisits.length || isPlanning">
          Plan Selected Visits
        </button>
      </div>
    </form>

    <!-- Error Display -->
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Visits Table -->
    <table class="visits-table">
      <thead>
        <tr>
          <th>
            <input type="checkbox" @change="toggleAll" :checked="allSelected" />
          </th>
          <th>Sagsnr</th>
          <th>Status</th>
          <th>besøgs id</th>
          <th>Address</th>
          <th>Debitors</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="visit in plannedVisits" :key="visit.ID">
          <td>
            <input type="checkbox" v-model="selectedVisits" :value="visit.ID" />
          </td>
          <td>{{ visit.sagsnr }}</td>
          <td>{{ visit.status_id }}</td>
          <td>{{ visit.ID }}</td>
          <td>{{ visit.address }}</td>
          <td>
            <div v-for="debitor in visit.debitors" :key="debitor.ID">
              {{ debitor.name }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import api from '@/utils/axios'
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth' // Adjust import path

const selectedVisits = ref([])
const selectedUser = ref('')
const selectedDate = ref('')
const users = ref([]) // You'll need to fetch this
const isPlanning = ref(false)
const authStore = useAuthStore()
const plannedVisits = ref([])
const error = ref()

const today = computed(() => new Date().toISOString().split('T')[0])
const allSelected = computed(
  () =>
    plannedVisits.value.length > 0 && selectedVisits.value.length === plannedVisits.value.length,
)

// Toggle all checkboxes
const toggleAll = () => {
  if (allSelected.value) {
    selectedVisits.value = []
  } else {
    selectedVisits.value = plannedVisits.value.map((visit) => visit.ID)
  }
}

const fetchCreatedVisits = async () => {
  try {
    const response = await api.get('/visits/create')
    plannedVisits.value = response.data.data
    error.value = null
  } catch (err) {
    console.error(err)
    error.value = 'Failed to fetch available visits'
    plannedVisits.value = []
  }
}

const handlePlanVisits = async () => {
  if (!authStore.isAuthenticated) {
    error.value = 'Du skal være logget ind'
    authStore.toLoginScreen()
    return
  }

  try {
    isPlanning.value = true
    error.value = ''

    const planData = {
      visitIds: selectedVisits.value,
      userId: selectedUser.value,
      date: selectedDate.value,
    }
    console.log(planData)
    const response = await api.post('/visits/visitfile', planData, { responseType: 'blob' })

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'visits' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    // Reset selections and refetch data
    selectedVisits.value = []
    selectedUser.value = ''
    selectedDate.value = ''
    await fetchCreatedVisits()

    console.log('Planning successful:', response.data)
  } catch (err) {
    console.error('Planning failed:', err)
    if (err.response?.status === 401) {
      authStore.logout()
      error.value = 'Session udløbet. Log ind igen.'
    } else {
      error.value = err.response?.data?.message || 'Planning failed. Try again.'
    }
  } finally {
    isPlanning.value = false
  }
}
// Fetch users function (add this)
const fetchUsers = async () => {
  try {
    const response = await api.get('/users') // Adjust endpoint
    users.value = response.data.users
  } catch (err) {
    console.error('Failed to fetch users:', err)
  }
}

// Call fetchUsers on component mount
fetchUsers()

fetchCreatedVisits()
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
