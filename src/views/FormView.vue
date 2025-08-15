<template>
  <div class="visit-form-container">
    <div class="visit-form">
      <header class="form-header">
        <h1>Besøgs spørgeskema</h1>
      </header>

      <div v-if="visitData" class="debtor-info-card">
        <h3>Debitor Info</h3>
        <div class="info-grid">
          <template v-for="(debitor, idx) in visitData.visit.debitors" :key="debitor.id || idx">
            <div class="info-item">
              <span class="label" style="font-size: large">Navn:</span>
              <span class="value">{{ debitor.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">Telefon:</span>
              <span class="value">{{ debitor.phone }}</span>
            </div>
            <div v-if="debitor.birthday" class="info-item">
              <span class="label">fødselsdag:</span>
              <span class="value">{{ debitor.birthday.slice(0, 10) }}</span>
            </div>
            <div v-if="debitor.birthday" class="info-item">
              <span class="label">Age:</span>
              <span class="value">{{ calculateAge(debitor.birthday) }}</span>
            </div>
          </template>
          <div class="info-item">
            <span class="label">Adresse:</span>
            <span class="value">{{ visitData.visit.address }}</span>
          </div>
          <div class="info-item">
            <span class="label">Sagsnr:</span>
            <span class="value">{{ visitData.visit.sagsnr }}</span>
          </div>
        </div>
        <br />
        <h3 @click="toggleExpanded">Gælds info</h3>
        <div v-if="expanded">
          <div v-if="debtData">
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Restgæld Antaget:</span>
                <span class="value"> {{ restgadoAntagetVal }}</span>
              </div>

              <div v-if="debtData.RestgeldVedBrev" class="info-item">
                <span class="label">Restgæld ved afsent brev:</span>
                <span class="value"> {{ debtData.RestgeldVedBrev }}</span>
              </div>
              <div class="info-item">
                <span class="label">indbetalinger ved afsent brev:</span>
                <span class="value"> {{ debtData.SumIndbetalingVedBrev }}</span>
              </div>
              <div class="info-item">
                <span class="label">RestanceDato:</span>
                <span class="value">{{
                  debtData.RestanceDato
                    ? new Date(debtData.RestanceDato).toLocaleDateString('da-DK')
                    : ''
                }}</span>
              </div>
              <div class="info-item">
                <span class="label">SumIndbetalinger i alt:</span>
                <span class="value">{{ debtData.SumIndbetalinger }}</span>
              </div>
            </div>
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
            <h4>Personinfo & Arbejde</h4>
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

          <div class="form-group">
            <label for="CivilStatus" class="input-label">Civilstand:</label>
            <select id="CivilStatus" v-model="formData.civil_status" class="form-select" required>
              <option value="gift">Gift</option>
              <option value="samboende">Samboende</option>
              <option value="enlig">Enlig</option>
            </select>
          </div>

          <div class="form-section">
            <h4>Børn</h4>
            <div class="input-row">
              <div class="form-group">
                <label class="input-label">Børn under 18:</label>
                <input
                  type="number"
                  inputmode="numeric"
                  v-model="formData.children_under_18"
                  min="0"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="input-label">Børn over 18:</label>
                <input
                  type="number"
                  inputmode="numeric"
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
              Aktivet på adressen?
            </label>
            <div v-if="formData.asset_at_address" class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.asset_delivered" />
                <span class="checkmark"></span>
                Aktivet Afleveret?
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.KeysReceived" />
                <span class="checkmark"></span>
                Nøgler Modtaget?
              </label>
            </div>
            <div v-if="formData.asset_at_address" class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.vehicle_damaged" />
                <span class="checkmark"></span>
                Er køretøjet beskadiget?
              </label>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h4>Boligen</h4>
          <div class="checkbox-group">
            <!-- Bolig type -->
            <label for="boligType" class="checkbox-label"> bolig type</label>
            <select id="boligType" v-model="formData.property_type" class="form-select">
              <option value="Fritliggende">Fritliggende</option>
              <option value="Byhus">Byhus</option>
              <option value="Kolonihave">Kolonihave</option>
              <option value="lejlighed">Lejlighed</option>
              <option value="rækkehus">Rækkehus</option>
              <option value="sommerhus">Sommerhus</option>
            </select>
            <!-- Stand -->
            <label for="maintenance_status" class="checkbox-label"> bolig stand</label>
            <select
              id="maintenance_status"
              v-model="formData.maintenance_status"
              class="form-select"
            >
              <option value="god">God</option>
              <option value="dårlig">Dårlig</option>
            </select>
            <!-- ownership_status -->
            <label for="ownership_status" class="checkbox-label"> ejerforhold</label>
            <select id="ownership_status" v-model="formData.ownership_status" class="form-select">
              <option value="EjerBolig">Ejer</option>
              <option value="LejerBolig">Lejer</option>
              <option value="AndelsBolig">Andels</option>
            </select>
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

const router = useRouter()
const route = useRoute()
const ID = Number(route.params.id)
const visitData = ref(null)
const isSubmitting = ref(false)
const isCapturingLocation = ref(false)
const debtData = ref(null)
const restgadoAntagetVal = ref(0)
const expanded = ref(true)

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

function toggleExpanded() {
  expanded.value = !expanded.value
}

onMounted(async () => {
  await getLocation()
  try {
    const response = await api.get('/visits/byId', {
      params: { id: ID },
    })
    visitData.value = response.data
    const debtInfo = await api.get('/visits/debt', {
      params: { VisitId: ID },
    })
    debtData.value = debtInfo.data[0]
  } catch (error) {
    console.error('Error fetching visit:', error)
    // Handle error appropriately
  }

  const antaget = parseFloat(debtData.value.RestgeldAntaget)
  restgadoAntagetVal.value = antaget === 0 ? debtData.value.RestgeldVedBrev : antaget
})

function calculateAge(birthday) {
  if (!birthday) return ''
  const birthDate = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

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

.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
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
