<template>
  <div><h1>Købe kontrakt</h1></div>
  <p>
    Fordi det er en købekontrakt saa ejer skyldner bilen men de har ikke betalt de penge som de
    skylder i den. Proev at faa dem til at signere kontrakten.
  </p>
  <p class="auditor-name" @click="toggleExpanded">
    Debitor: {{ filteredData?.debitors?.[0]?.name ?? '—' }}
  </p>
  <div v-if="expanded && filteredData?.debitors?.length">
    <p>Advopro_debitor_id: {{ filteredData.debitors[0]?.Advopro_debitor_id ?? '—' }}</p>
    <p>
      phone: {{ filteredData.debitors[0]?.phone ?? filteredData.debitors[0]?.phone_work ?? '—' }}
    </p>
    <p>Mail: {{ filteredData.debitors[0]?.email ?? '—' }}</p>
    <p>gender: {{ filteredData.debitors[0]?.gender ?? '—' }}</p>
    <p>age: {{ filteredData.debitors[0]?.age ?? '—' }}</p>
  </div>

  <form id="visit-form" novalidate>
    <!-- Visit -->
    <input type="hidden" name="visit_id" id="visit_id" value="" />

    <!-- Debitor hjemme? -->
    <fieldset>
      <legend>Er debitor hjemme?</legend>
      <label><input type="radio" name="debitor_is_home" value="true" required /> Ja</label>
      <label><input type="radio" name="debitor_is_home" value="false" /> Nej</label>
    </fieldset>

    <!-- Betaling modtaget? -->
    <fieldset>
      <legend>Er betaling modtaget?</legend>
      <label><input type="radio" name="payment_received" value="true" required /> Ja</label>
      <label><input type="radio" name="payment_received" value="false" /> Nej</label>
    </fieldset>

    <!-- Bilen til stede på adressen? -->
    <fieldset>
      <legend>Er bilen til stede på adressen?</legend>
      <label><input type="radio" name="asset_at_address" value="true" required /> Ja</label>
      <label><input type="radio" name="asset_at_address" value="false" /> Nej</label>
    </fieldset>

    <!-- Bilen på værksted? -->
    <fieldset>
      <legend>Er bilen på værksted?</legend>
      <label><input type="radio" name="asset_at_workshop" value="true" required /> Ja</label>
      <label><input type="radio" name="asset_at_workshop" value="false" /> Nej</label>
    </fieldset>

    <!-- Hvor er bilen nu? (vises/kræves kun hvis ikke på adressen) -->
    <div id="asset-location-wrap" style="display: none">
      <label
        >Hvor er bilen lige nu?
        <input type="text" id="asset_location" placeholder="Adresse/sted" />
      </label>
      <label
        >Hvem kører den?
        <input type="text" id="asset_driver" placeholder="Navn/telefon" />
      </label>
    </div>

    <!-- Bilen skadet? -->
    <fieldset>
      <legend>Er bilen skadet?</legend>
      <label><input type="radio" name="asset_damaged" value="true" required /> Ja</label>
      <label><input type="radio" name="asset_damaged" value="false" /> Nej</label>
    </fieldset>

    <!-- Bilen ryddet? -->
    <fieldset>
      <legend>Er bilen ryddet?</legend>
      <label><input type="radio" name="asset_clean" value="true" required /> Ja</label>
      <label><input type="radio" name="asset_clean" value="false" /> Nej</label>
    </fieldset>

    <!-- Aktuel km-stand -->
    <label
      >Aktuel km-stand
      <input type="number" id="odometer_km" inputmode="numeric" min="0" step="1" required />
    </label>

    <!-- Nøgler givet/modtaget -->
    <fieldset>
      <legend>Er nøgler givet?</legend>
      <label><input type="radio" name="keys_given" value="true" required /> Ja</label>
      <label><input type="radio" name="keys_given" value="false" /> Nej</label>
    </fieldset>
    <fieldset>
      <legend>Er nøgler modtaget?</legend>
      <label><input type="radio" name="keys_received" value="true" required /> Ja</label>
      <label><input type="radio" name="keys_received" value="false" /> Nej</label>
    </fieldset>

    <!-- Salgsfuldmagt/kontrakt underskrevet -->
    <fieldset>
      <legend>Salgsfuldmagt underskrevet?</legend>
      <label><input type="radio" name="sf_signed" value="true" required /> Ja</label>
      <label><input type="radio" name="sf_signed" value="false" /> Nej</label>
    </fieldset>
    <fieldset>
      <legend>Salgs-/eftergivelseaftale underskrevet?</legend>
      <label><input type="radio" name="se_signed" value="true" required /> Ja</label>
      <label><input type="radio" name="se_signed" value="false" /> Nej</label>
    </fieldset>

    <!-- Billeder af bilen -->
    <label
      >Billeder af bilen
      <input type="file" id="images" accept="image/*" multiple required />
    </label>
    <small>Tag gerne billeder af skader, km-stand og stelnummer.</small>
    <!-- Kommentarer -->
    <label
      >Kommentarer
      <textarea id="comments" rows="3" placeholder="Evt. noter"></textarea>
    </label>

    <button type="submit" id="submit-btn">Gem svar</button>
  </form>

  <!--
  købekontrakt tage bilen hvis underskrift (salgs fuldmagt)
  mere målrettet mod aktivet istedet for personen
  check bokse er bilen skadet? er den ryddet? hvor langt er bilen kørt lige nu?
  billeder af bilen 
  er bilen tilstede? er den på værkstedet? hvor er den lige nu? hvis ikke hjemme så hvor og hvem kører den?
  er bilen tilskade? normale spørgsmål.
  
  
  -->

  <!--
  <pre v-if="expanded" v-text="JSONData"></pre>
  -->
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

const formData = reactive({
  debitor_is_home: false,
  civil_status: '',
  payment_received: false,
  asset_at_address: false,
  asset_damaged: false,

  asset_at_workshop: false,
  asset_clean: false,
  asset_location: '',
  asset_comments: '',
  odometer_km: 0,

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

const expanded = ref(false)
const toggleExpanded = () => {
  expanded.value = !expanded.value
}

const props = defineProps({
  visitData: { type: Object, required: true },
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

const filteredData = computed(() => {
  const visit = props.visitData || {}
  const debitors = (visit.debitors || []).map((d) => ({
    ...d,
    age: calculateAge(d.birthday),
  }))
  return { ...visit, debitors }
})
</script>
