<template>
  <div>
    <PurchaseForm v-if="visitData?.type?.ID === 1" :visitData="visitData" />
    <!--
    leasing 2
    blanco 3
    brev 4
    -->
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PurchaseForm from '@/components/forms/PurchaseForm.vue'
import api from '@/utils/axios'

const router = useRouter()
const route = useRoute()
const ID = Number(route.params.id)
const visitData = ref(null)
const isSubmitting = ref(false)
const isCapturingLocation = ref(false)
const debtData = ref(null)
const restgadoAntagetVal = ref(0)

const formData = reactive({
  debitor_is_home: false,
  civil_status: '',
  payment_received: false,
  asset_at_address: false,
  asset_damaged: false,
  has_work: false,
  position: '',
  salary: 0,
  children_under_18: 0,
  children_over_18: 0,
  comments: '',
  property_type: '',
  maintenance_status: '',
  ownership_status: '',
  actual_latitude: '',
  actual_longitude: '',
  posAccuracy: '',
  images: [],
})

onMounted(async () => {
  try {
    const response = await api.get('/visits/byId', {
      params: { id: ID },
    })
    visitData.value = response.data.visit
    const debtInfo = await api.get('/visits/debt', {
      params: { VisitId: ID },
    })
    debtData.value = debtInfo.data[0]
    await getLocation()
  } catch (error) {
    console.error('Error fetching visit:', error)
    // Handle error appropriately
  }

  const antaget = parseFloat(debtData.value.RestgeldAntaget)
  restgadoAntagetVal.value = antaget === 0 ? debtData.value.RestgeldVedBrev : antaget
})

const submitForm = async () => {
  if (formData.asset_at_address && formData.images.length === 0) {
    alert('Du skal tilføje mindst ét billede når køretøjet er til stede.')
    return
  }

  isSubmitting.value = true
  try {
    // first submit the data
    const jsonData = {
      visit_id: ID,
      actual_date: new Date().toISOString(),
      actual_time: new Date().toTimeString(),
      ...Object.fromEntries(Object.entries(formData).filter(([key]) => key !== 'images')),
    }

    const formResponse = await api.post('/visit-response/create', jsonData, {
      headers: { 'Content-Type': 'application/json' },
    })

    // 2. Upload images one by one
    if (formData.images.length > 0 && formResponse.data.ID) {
      for (const [index, image] of formData.images.entries()) {
        const imageFormData = new FormData()
        imageFormData.append('visit_response_id', formResponse.data.ID)
        imageFormData.append('image', image.file)
        imageFormData.append('sequence', index + 1) // Optional: track order

        const imageResponse = await api.post(
          '/visit-response/' + formResponse.data.ID + '/images',
          imageFormData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          },
        )
        console.log(imageResponse)
      }
    }

    router.push('/visits')
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    isSubmitting.value = false
  }
}

const getLocation = () => {
  // Fallback coordinates (e.g., a default location like Copenhagen, Denmark)
  const fallbackLocation = {
    latitude: '0',
    longitude: '0',
    accuracy: '0',
  }

  if (!navigator.geolocation) {
    alert('Geolocation ikke understøttet')
    formData.actual_latitude = fallbackLocation.latitude
    formData.actual_longitude = fallbackLocation.longitude
    formData.pos_accuracy = fallbackLocation.accuracy
    return
  }

  if (!window.isSecureContext) {
    alert('Geolocation kræver en sikker forbindelse (HTTPS). Fallback placering bruges.')
    formData.actual_latitude = fallbackLocation.latitude
    formData.actual_longitude = fallbackLocation.longitude
    formData.pos_accuracy = fallbackLocation.accuracy
    return
  }

  isCapturingLocation.value = true
  let bestPosition
  let watchId = null

  const finish = () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    if (bestPosition) {
      formData.actual_latitude = bestPosition.coords.latitude.toString()
      formData.actual_longitude = bestPosition.coords.longitude.toString()
      formData.pos_accuracy = bestPosition.coords.accuracy.toString()
    } else {
      formData.actual_latitude = fallbackLocation.latitude
      formData.actual_longitude = fallbackLocation.longitude
      formData.pos_accuracy = fallbackLocation.accuracy
    }
    isCapturingLocation.value = false

    console.log(formData.actual_latitude)
    console.log(formData.actual_longitude)
    console.log(formData.pos_accuracy)
  }

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
        bestPosition = position
        // Stop if accuracy is below 15 meters (customize as needed)
        if (position.coords.accuracy <= 15) finish()
      }
    },
    (error) => {
      console.error('GPS error:', error)
      alert('Kunne ikke hente præcis placering. Fallback placering bruges.')
      bestPosition = null
      finish()
    },
    { enableHighAccuracy: true },
  )

  // Force finish after 10 seconds to avoid infinite wait
  console.log('starting geolocation')
  setTimeout(finish, 10 * 1000)
}

const handleImageUpload = (event) => {
  const files = Array.from(event.target.files)
  files.forEach((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.images.push({
        file: file,
        preview: e.target.result,
        name: file.name,
      })
    }
    reader.readAsDataURL(file)
  })
}

const removeImage = (index) => {
  formData.images.splice(index, 1)
}
</script>
