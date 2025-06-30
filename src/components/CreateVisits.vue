<template>
  <button @click="fetchAvailableVisits">
    Press to get the available cases and debitors who are in status 5
  </button>
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
          <th>Name</th>
          <th>Address</th>
          <th>Case Number</th>
          <th>Status</th>
          <th>Info</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(visit, index) in availableVisits" :key="index">
          <td>
            <input
              type="checkbox"
              :id="'visit-' + visit.sagsnr"
              :value="visit.sagsnr"
              v-model="selectedVisitsSagsnr"
            />
          </td>
          <td>
            "{{ visit.debtors[0].navn }}"
            <div v-if="visit.debtors[1]">og "{{ visit.debtors[1].navn }}"</div>
            <div v-if="visit.debtors[2]">og "{{ visit.debtors[2].navn }}"</div>
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
import { ref, computed } from 'vue'
import api from '@/utils/axios.js'

const availableVisits = ref([])
const selectedVisitsSagsnr = ref([])
const error = ref(null)

const fetchAvailableVisits = async () => {
  try {
    const response = await api.get('/visits/AvailableVisit')
    availableVisits.value = response.data.results
    error.value = null
    console.log(response.data.results)
  } catch (err) {
    console.error(err)
    error.value = 'Failed to fetch available visits'
    availableVisits.value = []
  }
}
const createVisits = async () => {
  try {
    const selectedVisits = availableVisits.value.filter((visit) =>
      selectedVisitsSagsnr.value.includes(visit.sagsnr),
    )
    console.log(selectedVisits)

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
