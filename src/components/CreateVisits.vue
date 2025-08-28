<template>
  <div v-if="availableVisits.length > 0">
    <button @click="createVisits" :disabled="isCreateDisabled">Create Visits</button>
    <!-- visit_type selection drop down menu -->
    <select v-model="selectedVisitType">
      <option v-for="type in visitTypes" :key="type.ID" :value="type.ID">
        {{ type.text }}
      </option>
    </select>
    <p>Selected: {{ selectedVisitIds.length }} visits</p>

    <DataTable
      :data="availableVisits"
      :columns="columns"
      selectable
      filterable
      :page-size="100"
      @selection-changed="handleSelectionChange"
      @selection-ids-changed="handleSelectionIdsChange"
    >
      <template #cell-debtors="{ item }">
        <div v-for="(debtor, dIndex) in item.debtors" :key="debtor.navn">
          <input
            type="checkbox"
            :checked="selectedDebtors[getVisitKey(item)]?.includes(dIndex)"
            @change="toggleDebtorSelection(getVisitKey(item), dIndex)"
          />
          "{{ debtor.navn }}"
        </div>
      </template>

      <template #cell-adresse="{ item }">
        {{ item.adresse }}, {{ item.postnr }} {{ item.bynavn }}
      </template>
    </DataTable>
  </div>
  <div v-else-if="error">{{ error }}</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/axios.js'
import DataTable from '@/components/DataTable.vue'

const columns = [
  { key: 'sagsnr', label: 'Sags nummer', sortable: true, filterable: true },
  { key: 'debtors', label: 'Debitorer', sortable: false, filterable: false },
  { key: 'adresse', label: 'Adresse', sortable: false, filterable: true },
  { key: 'status', label: 'Advopro Status', sortable: true, filterable: true },
  { key: 'frist_dato', label: 'Frist dato', sortable: true, filterable: true },
]

const availableVisits = ref([])
const selectedVisitsSagsnr = ref([])
const selectedVisitIds = ref([])
const selectedDebtors = ref({})
const error = ref(null)
const selectedVisitType = ref(null)
const visitTypes = ref([])

visitTypes.value = onMounted(fetchVisitTypes)

async function fetchVisitTypes() {
  const { data } = await api.get('/visits/types')
  visitTypes.value = data
}

const isCreateDisabled = computed(() => {
  const hasSagsnr = (selectedVisitsSagsnr.value?.length ?? 0) > 0
  const hasType = !!selectedVisitType.value // or just !!selectedVisitType.value if it’s a primitive
  const result = !(hasSagsnr && hasType)
  return result
})

const getVisitKey = (visit) => {
  // Create a unique key using sagsnr + adresse + postnr + first debtor name
  return `${visit.sagsnr}-${visit.adresse}-${visit.postnr}-${visit.debtors[0]?.navn || ''}`
}

const fetchAvailableVisits = async () => {
  try {
    const response = await api.get('/visits/AvailableVisit')

    availableVisits.value = response.data.results.sort((a, b) => {
      return Number(a.sagsnr) - Number(b.sagsnr)
    })

    selectedDebtors.value = {}
    availableVisits.value.forEach((visit) => {
      const visitKey = getVisitKey(visit)
      selectedDebtors.value[visitKey] = visit.debtors.map((_, i) => i)
    })

    error.value = null
  } catch (err) {
    console.error(err)
    error.value = 'Failed to fetch available visits'
    availableVisits.value = []
  }
}

const handleSelectionChange = (selectedSagsnrs) => {
  selectedVisitsSagsnr.value = selectedSagsnrs
}
const handleSelectionIdsChange = (selectedIds) => {
  selectedVisitIds.value = selectedIds
}

const createVisits = async () => {
  try {
    const Data = selectedVisitIds.value
      .map((id) => {
        const visit = availableVisits.value.find((v) => String(v.sagsnr) + String(v.index) === id)
        if (!visit) return null
        const visitKey = getVisitKey(visit)
        return {
          ...visit,
          debtors: selectedDebtors.value[visitKey]
            ? selectedDebtors.value[visitKey].map((idx) => visit.debtors[idx])
            : [],
        }
      })
      .filter((v) => v !== null)

    const visitType = visitTypes.value.find((type) => type.ID === selectedVisitType.value)

    const DataWithType = Data.map((line) => ({ ...line, visit_type: visitType }))

    const response = await api.post('/visits/create', DataWithType, {
      responseType: 'blob',
    })

    // Create blob and download
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download =
      'visits' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + visitType.text + '.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Failed to create visits:', err)
    // Consider adding user feedback here
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

function toggleDebtorSelection(visitKey, dIndex) {
  const current = selectedDebtors.value[visitKey] || []
  if (current.includes(dIndex)) {
    selectedDebtors.value[visitKey] = current.filter((idx) => idx !== dIndex)
  } else {
    selectedDebtors.value[visitKey] = [...current, dIndex]
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
