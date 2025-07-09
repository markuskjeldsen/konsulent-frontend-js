<template>
  <div v-if="availableVisits.length > 0">
    <button @click="createVisits" :disabled="selectedVisitsSagsnr.length === 0">
      Create Visits
    </button>
    <p>
      Selected Visits: {{ displayedSelectedVisits }}
      <span v-if="selectedVisitsSagsnr.length > 10"
        >... and {{ selectedVisitsSagsnr.length - 10 }} more</span
      >
    </p>

    <h2>Available Visits:</h2>
    <table>
      <thead>
        <tr>
          <th>
            <input type="checkbox" :checked="isSelectAll" @change="selectAllVisits($event)" />
          </th>
          <th>Navn</th>
          <th>Adresse</th>
          <th>Sags nummer</th>
          <th>Status</th>
          <th>Info</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="visit in availableVisits" :key="visit.sagsnr">
          <!-- index was used -->
          <td>
            <input
              type="checkbox"
              :id="'visit-' + visit.sagsnr"
              :value="visit.sagsnr"
              v-model="selectedVisitsSagsnr"
            />
          </td>
          <td>
            <div v-for="(debtor, dIndex) in visit.debtors" :key="debtor.navn">
              <input
                type="checkbox"
                :id="`visit-${visit.sagsnr}-debtor-${dIndex}`"
                :checked="selectedDebtors[visit.sagsnr]?.includes(dIndex)"
                @change="toggleDebtorSelection(visit.sagsnr, dIndex)"
              />
              "{{ debtor.navn }}"
            </div>
          </td>

          <td>{{ visit.adresse }}, {{ visit.postnr }} {{ visit.bynavn }}</td>
          <td>{{ visit.sagsnr }}</td>
          <td>{{ visit.status }}</td>
          <td>{{ visit.forlobInfo }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else-if="error">
    {{ error }}
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/axios.js'

const availableVisits = ref([])
const selectedVisitsSagsnr = ref([])
const selectedDebtors = ref({})
const error = ref(null)

const fetchAvailableVisits = async () => {
  try {
    const response = await api.get('/visits/AvailableVisit')
    availableVisits.value = response.data.results

    selectedDebtors.value = {}
    availableVisits.value.forEach((visit) => {
      selectedDebtors.value[visit.sagsnr] = visit.debtors.map((_, i) => i)
    })
    error.value = null
  } catch (err) {
    console.error(err)
    error.value = 'Failed to fetch available visits'
    availableVisits.value = []
  }
}
const createVisits = async () => {
  try {
    const selectedVisits = availableVisits.value
      .filter((visit) => selectedVisitsSagsnr.value.includes(visit.sagsnr))
      .map((visit) => ({
        ...visit,
        debtors: selectedDebtors.value[visit.sagsnr]
          ? selectedDebtors.value[visit.sagsnr].map((idx) => visit.debtors[idx])
          : [],
      }))

    const response = await api.post('/visits/create', selectedVisits, {
      responseType: 'blob', // Important: tell axios to expect binary data
    })

    // Create blob and download
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
  } catch (err) {
    console.error(err)
  }
}

const isSelectAll = computed(() => {
  return selectedVisitsSagsnr.value.length === availableVisits.value.length
})

const selectAllVisits = (event) => {
  if (event.target.checked) {
    selectedVisitsSagsnr.value = availableVisits.value.map((visit) => visit.sagsnr)
  } else {
    selectedVisitsSagsnr.value = []
  }
}
const displayedSelectedVisits = computed(() => {
  return selectedVisitsSagsnr.value.slice(0, 10).join(', ')
})

function toggleDebtorSelection(sagsnr, dIndex) {
  const current = selectedDebtors.value[sagsnr] || []
  if (current.includes(dIndex)) {
    selectedDebtors.value[sagsnr] = current.filter((idx) => idx !== dIndex)
  } else {
    selectedDebtors.value[sagsnr] = [...current, dIndex]
  }
}

onMounted(() => {
  fetchAvailableVisits()
})
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
