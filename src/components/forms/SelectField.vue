<!-- src/components/forms/SelectField.vue -->
<template>
	<fieldset class="select-field">
		<legend>{{ label }}</legend>

		<!-- Keeping a separate label to match your existing markup/classes -->
		<label :for="id" class="checkbox-label">{{ inputLabel || label }}</label>

		<select
			:id="id"
			class="form-select"
			:name="name"
			v-model="val"
			:required="required && (val === null || val === '')"
			:disabled="disabled"
		>
			<option v-if="placeholder" value="" disabled hidden>
				{{ placeholder }}
			</option>

			<option v-for="opt in normalizedOptions" :key="opt.value" :value="opt.value">
				{{ opt.label }}
			</option>
		</select>
	</fieldset>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	label: { type: String, required: true },
	name: { type: String, required: true }, // unique per question
	modelValue: { type: [String, Number, Boolean, null], default: null },
	required: { type: Boolean, default: false },
	disabled: { type: Boolean, default: false },

	// List of options: can be ['A', 'B'] or [{ value: 'A', label: 'A' }, ...]
	options: {
		type: Array,
		required: true,
		validator: (arr) =>
			arr.every(
				(o) =>
					typeof o === 'string' ||
					(o && typeof o === 'object' && 'value' in o && 'label' in o),
			),
	},

	// Optional UI niceties
	placeholder: { type: String, default: '' },
	inputLabel: { type: String, default: '' }, // if you want label text different from legend
})

const emit = defineEmits(['update:modelValue'])

const val = computed({
	get: () => props.modelValue,
	set: (v) => emit('update:modelValue', v),
})

const id = `${props.name}-select`

const normalizedOptions = computed(() =>
	props.options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o)),
)
</script>

<style scoped>
/* Optional: reuse your existing classes or add minor tweaks here */
.select-field {
	margin: 0 0 1rem 0;
}
</style>
