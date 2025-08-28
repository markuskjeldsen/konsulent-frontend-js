<template>
  <!-- Error Display -->
  <div v-if="error" class="error">{{ error }}</div>

  <button @click="moveToStatus5">Press here to move selected visits to status 5</button>

  <!-- Visits Table -->
  <DataTable
    :data="VisitStatus4"
    :columns="columns"
    selectable
    filterable
    @selection-ids-changed="handleIdSelection"
  >
    <template #cell-debitors="{ item }">
      <div v-for="debitor in item.debitors" :key="debitor.ID">
        {{ debitor.name }}
      </div>
    </template>
    <template #cell-status="{ item }"> {{ item.status.ID }}: {{ item.status.text }} </template>
  </DataTable>
  <button @click="requestPdfs">Press here to get the PDF</button>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/utils/axios'
import DataTable from './DataTable.vue'

const selectedVisits = ref([])
const VisitStatus4 = ref([])
const error = ref(null)
const allSelected = computed(
  () => VisitStatus4.value.length > 0 && selectedVisits.value.length === VisitStatus4.value.length,
)

const columns = [
  { key: 'sagsnr', label: 'Sags nummer', sortable: true, filterable: true },
  { key: 'ID', label: 'besøgs id', sortable: true, filterable: true },
  { key: 'debitors', label: 'Debitorer', sortable: true, filterable: false },
  { key: 'address', label: 'Adresse', sortable: false, filterable: true },
  {
    key: 'visit_response.actual_time',
    label: 'Besøgs tidspunkt',
    sortable: false,
    filterable: false,
  },
  { key: 'status', label: 'Status', sortable: false, filterable: true },
  { key: 'type.text', label: 'Type', sortable: true, filterable: true },
]

const fetchVisits = async () => {
  try {
    const response = await api.get('/visits/byStatus', {
      params: { status: 4 },
    })
    VisitStatus4.value = response.data.visit
  } catch (error) {
    console.error('Error fetching visits:', error)
    // Optionally, show feedback to user
  }
}

// Fetch list when the component is mounted
onMounted(fetchVisits)

function moveToStatus5() {
  if (selectedVisits.value.length === 0) {
    error.value = 'Please select at least one visit to move to status 5.'
    return
  }
  error.value = null

  // for testing add a wrong id
  // selectedVisits.value.push(9999)
  const visitsToMove = [...selectedVisits.value]

  api
    .post('/visit/reviewed', { reviewed_ids: visitsToMove })
    .then((response) => {
      const result = response.data
      // Filter out items with an error
      const errors = result.filter((item) => item.err !== 'no error')
      if (errors.length) {
        // Concatenate all error messages
        error.value = errors.map((item) => `ID ${item.id}: ${item.err}`).join('; ')
      } else {
        selectedVisits.value = []
        fetchVisits()
        error.value = null
      }
    })
    .catch((err) => {
      console.error('Error moving visits to status 5:', err)
      error.value = 'Failed to move visits to status 5. Please try again.'
    })
  fetchVisits()
}

function requestPdfs() {
  selectedVisits.value.forEach((visit) => {
    getPdf(visit.ID)
  })
}

const getPdf = async (id) => {
  try {
    const response = await api.get('/visit/pdf', {
      params: { id: id },
      responseType: 'blob',
    })

    // Extract filename from Content-Disposition header
    const disposition = response.headers['content-disposition']
    console.log(disposition)
    let filename = 'visit.pdf'
    if (disposition && disposition.indexOf('filename=') !== -1) {
      filename = disposition.split('filename=')[1].replace(/["']/g, '')
    }

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error fetching PDF:', error)
  }
}

// Toggle all checkboxes
const toggleAll = () => {
  if (allSelected.value) {
    selectedVisits.value = []
  } else {
    selectedVisits.value = VisitStatus4.value.map((visit) => visit.ID)
  }
}

function handleIdSelection(selectedIds) {
  console.log('Selected IDs:', selectedIds)

  selectedVisits.value = selectedIds
    .map((id) => {
      const visit = VisitStatus4.value.find((v) => v.ID === id)
      return visit ? { ...visit } : null
    })
    .filter(Boolean)
  console.log('Selected visits:', selectedVisits.value)
}
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
