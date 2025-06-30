<template>
  <div class="visit-form-container">
    <div class="visit-form">
      <header class="form-header">
        <h1>Besøgs spørgeskema</h1>
      </header>

      <div v-if="visitData" class="debtor-info-card">
        <h3>Debitor Information</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Navn:</span>
            <span class="value">{{ visitData.visit.debitors[0].name }}</span>
          </div>
          <div class="info-item">
            <span class="label">Telefon:</span>
            <span class="value">{{ visitData.visit.debitors[0].phone }}</span>
          </div>
          <div class="info-item">
            <span class="label">Adresse:</span>
            <span class="value">{{ visitData.visit.address }}</span>
          </div>
          <div class="info-item">
            <span class="label">Sagsnr:</span>
            <span class="value">{{ visitData.visit.sagsnr }}</span>
          </div>
        </div>
      </div>

      <form @submit.prevent="submitForm" class="response-form">
        <!-- Primary Questions -->
        <div class="form-section">
          <h4>Besøgsstatus</h4>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.debitor_is_home" />
              <span class="checkmark"></span>
              Er debitor hjemme?
            </label>
          </div>
        </div>

        <!-- Conditional sections -->
        <div v-if="formData.debitor_is_home" class="conditional-section">
          <div class="form-section">
            <h4>Betaling & Arbejde</h4>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.payment_received" />
                <span class="checkmark"></span>
                Modtaget betaling?
              </label>

              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.has_work" />
                <span class="checkmark"></span>
                Har arbejde?
              </label>
            </div>

            <div v-if="formData.has_work" class="input-group">
              <div class="form-group">
                <label class="input-label">Stilling:</label>
                <input type="text" v-model="formData.position" class="form-input" />
              </div>
              <div class="form-group">
                <label class="input-label">Månedlig løn:</label>
                <input type="number" v-model="formData.salary" step="0.01" class="form-input" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h4>Børn</h4>
            <div class="input-row">
              <div class="form-group">
                <label class="input-label">Børn under 18:</label>
                <input
                  type="number"
                  v-model="formData.children_under_18"
                  min="0"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="input-label">Børn over 18:</label>
                <input
                  type="number"
                  v-model="formData.children_over_18"
                  min="0"
                  class="form-input"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Asset Questions -->
        <div class="form-section">
          <h4>Aktiver</h4>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.asset_at_address" />
              <span class="checkmark"></span>
              Aktiver på adressen?
            </label>
          </div>
        </div>

        <!-- GPS Coordinates -->
        <div class="form-section">
          <h4>GPS Koordinater</h4>
          <button
            type="button"
            @click="getLocation"
            :disabled="isCapturingLocation"
            class="gps-button"
          >
            <span class="button-icon">📍</span>
            {{ isCapturingLocation ? 'Henter position...' : 'Hent GPS koordinater' }}
          </button>
          <div v-if="formData.actual_latitude" class="gps-info">
            <small
              >Lat: {{ formData.actual_latitude }}, Long: {{ formData.actual_longitude }}</small
            >
          </div>
        </div>

        <!-- Image Upload -->
        <div class="form-section">
          <h4>Billeder</h4>
          <div class="file-upload-wrapper">
            <input
              type="file"
              @change="handleImageUpload"
              accept="image/*"
              multiple
              capture="environment"
              class="file-input"
              id="imageUpload"
            />
            <label for="imageUpload" class="file-label">
              <span class="button-icon">📷</span>
              Tilføj billeder
            </label>
          </div>
          <div v-if="formData.images.length" class="image-preview">
            <div v-for="(image, index) in formData.images" :key="index" class="image-item">
              <img :src="image.preview" alt="Preview" />
              <button type="button" @click="removeImage(index)" class="remove-btn">×</button>
            </div>
          </div>
        </div>

        <!-- Comments -->
        <div class="form-section">
          <h4>Kommentarer</h4>
          <div class="form-group">
            <textarea
              v-model="formData.comments"
              rows="4"
              class="form-textarea"
              placeholder="Tilføj eventuelle kommentarer..."
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="isSubmitting" class="submit-button">
            {{ isSubmitting ? 'Gemmer...' : 'Gem besøg' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/axios'

const route = useRoute()
const router = useRouter()
const ID = Number(route.params.id)
const visitData = ref(null)
const isSubmitting = ref(false)
const isCapturingLocation = ref(false)

const formData = reactive({
  debitor_is_home: false,
  payment_received: false,
  asset_at_address: false,
  has_work: false,
  position: '',
  salary: 0,
  children_under_18: 0,
  children_over_18: 0,
  comments: '',
  actual_latitude: '',
  actual_longitude: '',
  images: [],
})

onMounted(async () => {
  try {
    const response = await api.get(`/visits/${ID}`)
    visitData.value = response.data
  } catch (error) {
    console.error('Error fetching visit:', error)
    // Handle error appropriately
  }
})

const submitForm = async () => {
  isSubmitting.value = true

  try {
    const formDataToSend = new FormData()
    formDataToSend.append('visit_id', ID)
    formDataToSend.append('actual_date', new Date().toISOString())
    formDataToSend.append('actual_time', new Date().toTimeString())

    // Add form fields
    Object.keys(formData).forEach((key) => {
      if (key !== 'images') {
        formDataToSend.append(key, formData[key])
      }
    })

    // Add images
    formData.images.forEach((image, index) => {
      formDataToSend.append(`images`, image.file)
    })

    await api.post('/visit-responses', formDataToSend, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    router.push('/visits')
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    isSubmitting.value = false
  }
}

const getLocation = () => {
  if (!navigator.geolocation) {
    alert('Geolocation ikke understøttet')
    return
  }

  isCapturingLocation.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      formData.actual_latitude = position.coords.latitude.toString()
      formData.actual_longitude = position.coords.longitude.toString()
      isCapturingLocation.value = false
    },
    (error) => {
      console.error('GPS error:', error)
      isCapturingLocation.value = false
    },
    { enableHighAccuracy: true, timeout: 10000 },
  )
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

<style scoped>
.visit-form-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.visit-form {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.form-header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 30px;
  text-align: center;
}

.form-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 300;
}

.debtor-info-card {
  background: #f8f9fa;
  padding: 25px;
  border-bottom: 1px solid #e9ecef;
}

.debtor-info-card h3 {
  margin: 0 0 20px 0;
  color: #495057;
  font-weight: 500;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
  margin-bottom: 4px;
}

.value {
  font-size: 1rem;
  color: #212529;
  font-weight: 600;
}

.response-form {
  padding: 30px;
}

.form-section {
  margin-bottom: 35px;
  padding-bottom: 25px;
  border-bottom: 1px solid #e9ecef;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.form-section h4 {
  margin: 0 0 20px 0;
  color: #495057;
  font-size: 1.2rem;
  font-weight: 500;
}

.conditional-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  color: #495057;
  position: relative;
  padding-left: 35px;
}

.checkbox-label input[type='checkbox'] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 22px;
  width: 22px;
  background-color: #fff;
  border: 2px solid #dee2e6;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.checkbox-label:hover input ~ .checkmark {
  border-color: #4facfe;
}

.checkbox-label input:checked ~ .checkmark {
  background-color: #4facfe;
  border-color: #4facfe;
}

.checkmark:after {
  content: '';
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 12px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-label input:checked ~ .checkmark:after {
  display: block;
}

.input-group {
  margin-top: 20px;
}

.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.form-textarea:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

.gps-button,
.submit-button {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.gps-button:hover,
.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
}

.gps-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.gps-info {
  margin-top: 10px;
  padding: 8px 12px;
  background: #e7f3ff;
  border-radius: 4px;
  color: #0066cc;
}

.file-upload-wrapper {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.file-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #28a745;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.file-label:hover {
  background: #218838;
}

.image-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.image-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-item img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}

.remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-actions {
  text-align: center;
  padding-top: 20px;
}

.submit-button {
  min-width: 200px;
  padding: 15px 30px;
  font-size: 1.1rem;
}

.button-icon {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .visit-form-container {
    padding: 10px;
  }

  .input-row {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .image-preview {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>
