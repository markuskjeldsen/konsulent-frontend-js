<template>
  <div class="card">
    <div class="card-row">
      <button class="card-header" @click="open">Besøg</button>
      <span class="field"
        ><strong>Address</strong> <span>{{ visit.address }}</span></span
      >
      <span class="field"
        ><strong>Debitor Name:</strong> <span>{{ visit.debitor_name }}</span></span
      >
      <span class="field"
        ><strong>Besøgs interval</strong> <span>{{ visit.visit_interval }}</span></span
      >
      <span class="field">
        <strong>Dato</strong> <span>{{ formattedVisitDate }}</span></span
      >
      <span class="field">
        <strong>est. ank.</strong> <span>{{ visit.visit_time }}</span></span
      >
      <span v-if="visit.visited" class="checkmark">✓</span>
    </div>
  </div>
</template>

<script setup>
/**
 * @typedef {Object} Visit
 * @property {number} user_id
 * @property {string} address
 * @property {string} DebitorName
 * @property {string} DebitorPhone
 * @property {string} latitude
 * @property {string} longitude
 * @property {string} notes
 * @property {number} sagsnr
 * @property {string} visit_date
 * @property {string} visit_time
 * @property {string} visit_interval
 * @property {boolean} visited
 */

/** @type {Visit} */
import { computed } from 'vue'

const props = defineProps({
  visit: {
    type: Object,
    required: true,
  },
})

const formattedVisitDate = computed(() => {
  const raw = props.visit.visit_date
  if (!raw) return ''
  const date = new Date(raw)
  // Format as e.g. 21-05-2025 15:32
  return date.toLocaleString('da-DK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    //hour: '2-digit',
    //minute: '2-digit',
    //hour12: false,
  })
})

function open() {
  // Emit an event to the parent component to handle the opening of the form
  console.log(props.visit)
}
</script>

<style scoped>
button {
  width: min-content;
}

.card {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  margin: 10px;
  width: fit-content;
}
.card-row {
  display: grid;
  /* Now we have 7 columns, last is for checkmark */
  grid-template-columns: auto 1fr 1fr 1fr 1fr 1fr 32px;
  align-items: center;
  gap: 16px;
}
.checkmark {
  color: green;
  font-size: 1.5em;
  margin-left: 0; /* Remove if you want strict right alignment */
  display: flex;
  justify-content: flex-end;
  height: 100%;
  align-items: center;
  /* Optionally: min-width */
  min-width: 32px;
}

.field {
  display: flex;
  gap: 4px;
  align-items: center;
}
</style>
