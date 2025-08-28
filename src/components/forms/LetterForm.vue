<template>
  <div style="margin: 16px">
    <h1>Brev</h1>
    <p>
      Du skal bare aflevere brevet til skyldner.
      <br />
      Mest sandsynligt i postkassen. Tag gerne et billede af postkassen på addresen hvis navnet ikke
      står på postkassen.
    </p>
  </div>

  <div style="margin: 16px">
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
      <p>AntagetHovedstol: {{ filteredData.debt?.KreditorHovedstol ?? '—' }}</p>
      <p>RestanceDato: {{ filteredData.debt?.RestanceDato ?? '—' }}</p>
      <p>Antaget restgæld: {{ filteredData.debt?.RestgeldAntaget ?? '—' }}</p>
      <p>restgæld ved afsendt brev: {{ filteredData.debt?.RestgeldVedBrev ?? '—' }}</p>
      <p>Sum af indbetalinger: {{ filteredData.debt?.SumIndbetalinger ?? '—' }}</p>
      <p>
        Sum af indbetalinger ved afsendt brev:
        {{ filteredData.debt?.SumIndbetalingVedBrev ?? '—' }}
      </p>
    </div>
  </div>

  <form @submit.prevent="emit('submit')">
    <!-- debitor hjemme? -->
    <YesNo
      label="Er debitor hjemme?"
      name="debitor_is_home"
      v-model="fd.debitor_is_home"
      :required="true"
    />

    <!-- Billede af postkassen -->
    <FileUpload
      id="mailbox-photo"
      title="Billede af postkassen"
      hint="Tryk for at vælge billeder (flere tilladt)"
      icon="📷"
      accept="image/*"
      :multiple="true"
      @images="onFileChange"
    />

    <br />
    <label
      >Kommentarer
      <br />

      <textarea v-model.trim="fd.comments" cols="50" rows="4" placeholder="Evt. noter"></textarea>
    </label>
    <br />
    <button type="submit" :disabled="isSubmitting">Aflever svar</button>
  </form>

  <!--
leasing kan man bare tage bilen
mere målrettet mod aktivet istedet for personen
check bokse er bilen skadet? er den ryddet? hvor langt er bilen kørt lige nu?, 
billeder af bilen 
er bilen tilstede? er den på værkstedet? hvor er den lige nu? hvis ikke hjemme så hvor og hvem kører den?
er bilen tilskade? normale spørgsmål.
--></template>

<script setup>
import { computed, ref } from 'vue'
import YesNo from '@/components/forms/YesNo.vue'
import FileUpload from './FileUpload.vue'

const expanded = ref(false)
const toggleExpanded = () => {
  expanded.value = !expanded.value
}

const props = defineProps({
  visitData: { type: Object, required: true },
  formData: { type: Object, required: true },
  isSubmitting: { type: Boolean, default: false },
})
const emit = defineEmits(['update:formData', 'submit', 'images'])

const fd = computed({
  get: () => props.formData,
  set: (v) => emit('update:formData', v),
})

function onFileChange(e) {
  emit('images', e)
}

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
