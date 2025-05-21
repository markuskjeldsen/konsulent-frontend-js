<template>
  <p :class="[applyClassToAll && number ? activeClass : '']">
    <span :class="[!applyClassToAll && number ? activeClass : '']">{{ number }}</span> {{ text }}
  </p>
</template>

<script>
export default {
  props: {
    number: { type: Number, required: true },
    text: { type: String, required: true },
    activeClass: { type: String, default: '' },
    applyClassToAll: { type: Boolean, default: false },
  },
}
</script>

<style lang="sass" scoped>
p
  margin: 0
  font-size: 90%
</style>
