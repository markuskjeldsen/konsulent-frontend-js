<template>
  <div>
    <h2>Ikke besøgt</h2>
    <p>man kan også sige at de mangler at blive besøgt</p>
  </div>
  <table class="visits-table">
    <thead>
      <tr>
        <th>besøgs id</th>
        <th>Konsulent</th>
        <th>Sagsnr</th>
        <th>Status</th>
        <th>Address</th>
        <th>Debitorer</th>
        <th>besøgs tidspnkt</th>
        <th>besøgs dato</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="visit in notVisitedVisits" :key="visit.ID">
        <td>{{ visit.ID }}</td>
        <td>{{ visit.user.name }}</td>
        <td>{{ visit.sagsnr }}</td>
        <td>{{ visit.status_id }}: {{ visit.status.text }}</td>
        <td>{{ visit.address }}</td>
        <td>
          <div v-for="debitor in visit.debitors" :key="debitor.ID">
            {{ debitor.name }}
          </div>
        </td>
        <td>{{ visit.visit_time }}</td>
        <td>{{ visit.visit_date }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import api from '@/utils/axios'
import { ref, onMounted } from 'vue'
import { parseISO, format } from 'date-fns'
import { da } from 'date-fns/locale/da'

const notVisitedVisits = ref([])
const error = ref(null)

onMounted(async () => {
  try {
    const response = await api.get('/visits/byStatus', {
      params: { status: '3' },
    })

    const visits = response.data.visit.map((visit) => {
      // Keep original unformatted date for sorting
      const trimmed = visit.visit_date.replace(/(\.\d{3})\d+/, '$1')
      return {
        ...visit,
        visit_date_raw: trimmed, // keep for sorting
        visit_date: format(parseISO(trimmed), 'P', { locale: da }), // for display
      }
    })

    // Sort by raw date then by time
    visits.sort((a, b) => {
      const dateA = new Date(a.visit_date_raw)
      const dateB = new Date(b.visit_date_raw)
      if (dateA - dateB !== 0) return dateA - dateB
      return a.visit_time.localeCompare(b.visit_time)
    })

    notVisitedVisits.value = visits
    error.value = null
  } catch (err) {
    error.value = 'Error fetching not visited visits: ' + err.message
    console.error('Error fetching not visited visits:', err)
  }
})
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
