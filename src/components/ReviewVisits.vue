<template>
  <!-- Error Display -->
  <div v-if="error" class="error">{{ error }}</div>

  <!-- Visits Table -->
  <table class="visits-table">
    <thead>
      <tr>
        <th>
          <input type="checkbox" @change="toggleAll" :checked="allSelected" />
        </th>
        <th>db id</th>
        <th>Sagsnr</th>
        <th>Status</th>
        <th>Address</th>
        <th>Debitors</th>
        <th>besøgs tidspnkt</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="visit in VisitStatus4" :key="visit.ID">
        <td>
          <input type="checkbox" v-model="selectedVisits" :value="visit.ID" />
        </td>
        <td>{{ visit.ID }}</td>

        <td>{{ visit.sagsnr }}</td>
        <td>{{ visit.status_id }}: to review</td>
        <td>{{ visit.address }}</td>
        <td>
          <div v-for="debitor in visit.debitors" :key="debitor.ID">
            {{ debitor.name }}
          </div>
        </td>
        <td>{{ visit.visit_response.actual_time.slice(0, 18) }}</td>
      </tr>
    </tbody>
  </table>

  <button @click="requestPdfs">Press here to get the PDF</button>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/utils/axios'

const selectedVisits = ref([])
const VisitStatus4 = ref([])
const error = ref(null)
const allSelected = computed(
  () => VisitStatus4.value.length > 0 && selectedVisits.value.length === VisitStatus4.value.length,
)

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

function requestPdfs() {
  selectedVisits.value.forEach((id) => {
    getPdf(id)
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
