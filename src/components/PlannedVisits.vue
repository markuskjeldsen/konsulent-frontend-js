<template>
  <div>
    <h2>Planned Visits</h2>
    <div v-if="visits.length > 0">
      <p>
        Selected Visits: {{ displayedSelectedVisits }}
        <span v-if="selectedVisitIds.length > 10">
          ... and {{ selectedVisitIds.length - 10 }} more
        </span>
      </p>
      <table>
        <thead>
          <tr>
            <th>
              <!--  <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll($event)" />  -->
            </th>
            <th>Konsulent</th>
            <th>Visit ID</th>
            <th>Debitors</th>
            <th>Address</th>
            <th>Visit day</th>
            <th>Visit Time</th>
            <th>Visit Interval</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="visit in visits" :key="visit.ID">
            <td v-if="editingId === visit.ID">
              <button @click="saveEdit(visit.ID)">Save</button>
              <button @click="cancelEdit">Cancel</button>
            </td>
            <td v-else>
              <button @click="markAsSent(visit.ID)">LetterSent</button>
              <button @click="editVisit(visit.ID)">Edit visit</button>
            </td>

            <td v-if="editingId === visit.ID">
              <select v-model="editFields.konsulentId" required>
                <option value="" disabled>Vælg konsulent</option>
                <option v-for="user in users" :key="user.ID" :value="user.ID">
                  {{ user.name }}
                </option>
              </select>
            </td>
            <td v-else>
              {{ visit.konsulentName }}
            </td>

            <td>{{ visit.ID }}</td>

            <td>
              <div v-for="debitor in visit.debitors" :key="debitor.ID">
                {{ debitor.name }}
              </div>
            </td>

            <td v-if="editingId === visit.ID">
              <textarea v-model="editFields.address" rows="2" style="width: 100%" />
            </td>
            <td v-else>{{ visit.address.replace(/\r?\n/g, ', ') }}</td>

            <td v-if="editingId === visit.ID">
              <input v-model="editFields.visit_date" type="date" />
            </td>
            <td v-else>{{ formatDate(visit.visit_date) }}</td>

            <td v-if="editingId === visit.ID"><input v-model="editFields.visit_time" /></td>
            <td v-else>{{ visit.visit_time }}</td>

            <td v-if="editingId === visit.ID"><input v-model="editFields.visit_interval" /></td>
            <td v-else>{{ visit.visit_interval }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else-if="error">
      {{ error }}
    </div>
    <div v-else>No planned visits found</div>
  </div>
</template>

<script setup>
import api from '@/utils/axios'
import { ref, computed, onMounted } from 'vue'

// Flat list of visits for easy rendering/selection
const visits = ref([])
const error = ref(null)
const selectedVisitIds = ref([])
const editingId = ref(null)
const editFields = ref({})
const users = ref([])

onMounted(async () => {
  try {
    await getPlannedVisits()
    await getUsers()
  } catch (e) {
    console.log(e)
    error.value = 'Failed to load visits'
  }
})

async function getUsers() {
  const response = await api.get('/users')
  users.value = response.data.users || []
}

async function getPlannedVisits() {
  const res = await api.get('/visits/planned')
  // Flatten data to visits array, keeping konsulentName on visit
  visits.value = (res.data || []).flatMap((konsulent) =>
    (konsulent.visits || []).map((visit) => ({
      ...visit,
      konsulentName: konsulent.name,
    })),
  )
  visits.value.sort((a, b) => a.stop_nr - b.stop_nr)
  visits.value.forEach((visit) => {
    visit.visit_date = new Date(visit.visit_date)
  })
}

function formatDate(date) {
  if (!(date instanceof Date)) date = new Date(date)
  return (
    `${date.getDate().toString().padStart(2, '0')}/` +
    `${(date.getMonth() + 1).toString().padStart(2, '0')}/` +
    date.getFullYear()
  )
}
function toISODateString(date) {
  if (!(date instanceof Date)) date = new Date(date)
  return date.toISOString().split('T')[0]
}
function toRFC3339DateString(date) {
  if (!date) return ''
  if (typeof date === 'string' && date.length === 10) {
    // "yyyy-mm-dd" from the date input
    return `${date}T00:00:00Z`
  }
  if (!(date instanceof Date)) date = new Date(date)
  return date.toISOString()
}

const displayedSelectedVisits = computed(() => selectedVisitIds.value.slice(0, 10).join(', '))

async function saveEdit(visitId) {
  try {
    const payload = {
      ...editFields.value,
      user_id: editFields.value.konsulentId,
      visit_date: toRFC3339DateString(editFields.value.visit_date),
    }
    const res = await api.patch(`/visits/planned/${visitId}`, payload)

    console.log(res)
    // Update local visits
    const idx = visits.value.findIndex((v) => v.ID === visitId)
    if (idx !== -1) visits.value[idx] = { ...editFields.value }
    editingId.value = null
  } catch (e) {
    console.log(e)
    e.value = 'Failed to save changes'
    error.value = e.value
  }
}

function cancelEdit() {
  editingId.value = null
}

// Placeholder for when you want to change values
function editVisit(visitId) {
  editingId.value = visitId
  const visit = visits.value.find((v) => v.ID === visitId)
  editFields.value = {
    ...visit,
    konsulentId: visit.user_id,
    visit_date: toISODateString(visit.visit_date),
  }
}

function markAsSent(visitId) {
  api
    // i want to send it as a parameter, not in the body
    .post('/visit/letterSent', null, { params: { id: visitId } })
    .then(() => {
      // Optionally, show feedback to user
      console.log(`Visit ${visitId} marked as sent`)

      // remount the component to refresh data
      editingId.value = null
      getPlannedVisits()
    })
    .catch((err) => {
      console.error('Error marking visit as sent:', err)
      error.value = 'Failed to mark visit as sent. Please try again.'
    })
}
</script>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f0f0f0;
}
</style>
