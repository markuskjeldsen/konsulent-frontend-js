<template>
  <tr style="width: 100%">
    <td v-if="!visit.visit_response && visit.status_id == 3">
      <button class="visit-btn" @click="open">Besøg</button>
    </td>
    <td v-else-if="visit.status_id == 4">
      <button class="visit-btn" @click="edit">Rediger</button>
    </td>
    <td v-else>
      <button class="visit-btn">Afvent</button>
    </td>

    <td>{{ visit.address }}</td>
    <td>
      <span v-for="(debitor, i) in visit.debitors" :key="debitor.id">
        {{ debitor.name }}<span v-if="i < visit.debitors.length - 1">, </span>
      </span>
    </td>
    <td>{{ visit.visit_interval }}</td>
    <td>{{ visit.visit_time }}</td>
    <td class="checkmark-cell">
      <span> {{ visit.status_id }}: {{ visit.status.text }}</span>
      <!-- v-if="visit.visit_response" class="checkmark"-->
    </td>
  </tr>
</template>

<script setup>
import router from '@/router'

const props = defineProps({
  visit: Object,
})

function open() {
  console.log('/form:' + props.visit.ID)
  router.push({
    name: 'form',
    params: { id: props.visit.ID },
  })
}
function edit() {
  // You can emit here if needed
  console.log(props.visit)
}
</script>

<style scoped>
.visit-btn {
  min-width: 60px;
}
/* Optional: checkmark cell alignment */
.checkmark {
  color: green;
  font-size: 1.5em;
  font-weight: bold;
  justify-self: auto;
}
</style>
