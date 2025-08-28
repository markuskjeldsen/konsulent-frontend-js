<!-- src/components/forms/YesNo.vue -->
<template>
	<fieldset class="yn">
		<legend>{{ label }}</legend>

		<label :for="idYes">
			<input
				:id="idYes"
				type="radio"
				:name="name"
				:value="true"
				v-model="val"
				:required="required && val === null"
				:disabled="disabled"
			/>
			Ja
		</label>

		<label :for="idNo">
			<input
				:id="idNo"
				type="radio"
				:name="name"
				:value="false"
				v-model="val"
				:disabled="disabled"
			/>
			Nej
		</label>
	</fieldset>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	label: { type: String, required: true },
	name: { type: String, required: true }, // unique per question
	modelValue: { type: [Boolean, null], default: null }, // use null initially
	required: { type: Boolean, default: false },
	disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const val = computed({
	get: () => props.modelValue,
	set: (v) => emit('update:modelValue', v),
})

const idYes = `${props.name}-yes`
const idNo = `${props.name}-no`
</script>
