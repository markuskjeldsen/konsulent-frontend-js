<template>
	<div style="margin: 16px">
		<h1>Blanco</h1>
		<p>
			Dette betyder at skyldner ikke har pengene til at betale en lån som de har taget. Nu
			skal du finde ud af hvor meget man kan forvente at få ud af dem.
		</p>
	</div>

	<div style="margin: 16px">
		<p class="auditor-name" @click="toggleExpanded">
			Debitor: {{ filteredData?.debitors?.[0]?.name ?? '—' }}
		</p>
		<div v-if="expanded && filteredData?.debitors?.length">
			<p>Advopro_debitor_id: {{ filteredData.debitors[0]?.Advopro_debitor_id ?? '—' }}</p>
			<p>
				phone:
				{{ filteredData.debitors[0]?.phone ?? filteredData.debitors[0]?.phone_work ?? '—' }}
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

		<!-- Betaling modtaget? -->

		<YesNo
			label="Er betaling modtaget?"
			name="payment_received"
			v-model="fd.payment_received"
		/>

		<!-- Bilen skadet? -->
		<YesNo
			label="Er der en bil til stede på adressen?"
			name="asset_at_address"
			v-model="fd.asset_at_address"
			:required="true"
		/>
		<div class="Bil-questions" v-if="fd.asset_at_address" style="margin: 30px 0">
			<!-- Bilen til stede på adressen? -->

			<label v-if="fd.asset_at_address">
				Aktuel km-stand
				<input v-model.number="fd.odometer_km" type="number" min="0" step="1" required />
			</label>

			<!-- Bilen på værksted? -->
			<div
				v-if="
					!fd.asset_at_address && fd.asset_at_address != undefined && fd.debitor_is_home
				"
			>
				<label
					>Hvor er bilen lige nu? (værksted,ude og køre)
					<input
						v-model.trim="fd.asset_location"
						type="text"
						placeholder="Adresse/sted"
					/>
				</label>
				<label
					>Hvem kører den?
					<input v-model.trim="fd.asset_driver" type="text" placeholder="Navn/telefon" />
				</label>
			</div>

			<YesNo
				v-if="fd.asset_at_address || fd.debitor_is_home"
				label="Er bilen skadet?"
				name="asset_damaged"
				v-model="fd.asset_damaged"
			/>

			<!-- Bilen ryddet? -->
			<YesNo
				v-if="fd.asset_at_address"
				label="Er bilen ryddet?"
				name="asset_clean"
				v-model="fd.asset_clean"
			/>

			<!-- Nøgler givet/modtaget -->
			<YesNo
				label="Er nøgler givet til konsulenten?"
				name="keys_given"
				v-model="fd.keys_given"
			/>
		</div>

		<div class="hus-questions" style="margin: 30px 0">
			<!-- ejer de huset? -->
			<!-- Bolig type -->
			<SelectField
				label="Bolig type"
				inputLabel="bolig type"
				name="boligType"
				v-model="fd.property_type"
				:options="[
					'Fritliggende',
					'Byhus',
					'Kolonihave',
					'Lejlighed',
					'Rækkehus',
					'Sommerhus',
				]"
				placeholder="Vælg boligtype"
			/>
			<!-- Boligen skadet? -->
			<SelectField
				label="Bolig stand"
				input-label="bolig stand"
				name="boligStand"
				v-model="fd.maintenance_status"
				:options="['Velholdt', 'Forfalden']"
				placeholder="Vælg boligstand"
			/>

			<!-- Ejerforhold -->
			<SelectField
				label="Ejerforhold"
				inputLabel="ejerforhold"
				name="ownership_status"
				v-model="fd.ownership_status"
				:options="[
					{ value: 'EjerBolig', label: 'Ejer' },
					{ value: 'LejerBolig', label: 'Lejer' },
					{ value: 'AndelsBolig', label: 'Andels' },
				]"
				placeholder="Vælg ejerforhold"
			/>
		</div>

		<div class="family" style="margin: 30px 0">
			<!--Civil stand-->
			<SelectField
				label="Civil stand"
				inputLabel="Civil stand"
				name="CivilStand"
				v-model="fd.civil_status"
				:options="['Married', 'Single', 'Cohabiting']"
				placeholder="Vælg civil stand"
			/>
			<!--Children-->
			<YesNo label="Har skyldner børn" name="has_children" v-model="hasChildren" />
			<fieldset v-if="hasChildren">
				<legend>Hvor mange børn under 18 år</legend>
				<input v-model.number="fd.children_under_18" type="number" min="0" step="1" />
			</fieldset>
		</div>

		<div class="economy" style="margin: 30px 0">
			<!-- har skyldner et job? hvilket job? og hvad hvad tjener de?-->
			<YesNo label="Har skyldner Job?" name="has_job" v-model="fd.has_work" />
			<fieldset v-if="fd.has_work">
				<legend>Hvilket job har skyldner? (hvis flere så sæt komma)</legend>
				<input v-model.trim="fd.position" type="text" placeholder="Jobtitel" />
			</fieldset>

			<fieldset v-if="fd.has_work">
				<legend>Hvad tjener skyldner ved at arbejde?</legend>
				<input v-model.number="fd.salary" type="number" min="0" step="100" required />
			</fieldset>

			<fieldset>
				<legend>Månedlige indkomst med løn</legend>
				<input v-model.number="fd.income_payment" type="number" min="0" step="100" />
			</fieldset>
			<fieldset>
				<legend>Hvad har de så at rutte med når regningerne er betalt?</legend>
				<input
					v-model.number="fd.monthly_disposable_amount"
					type="number"
					min="0"
					step="100"
				/>
			</fieldset>

			<YesNo
				label="Har skyldner anden gæld?"
				name="has_additional_debt"
				v-model="additionalDebt"
				:required="true"
			/>
			<fieldset
				v-if="additionalDebt"
				style="
					display: grid;
					grid-template-columns: 12rem 1fr;
					align-items: center;
					gap: 0.5rem 1rem;
				"
			>
				<legend style="grid-column: 1 / -1">første gæld</legend>
				<label for="creditor">Kreditor</label>
				<input v-model.number="fd.creditor" type="text" />
				<label for="debt_amount">Gældsbeløb</label>
				<input v-model.number="fd.debt_amount" type="number" min="0" step="100" />
				<label for="settlement">Forlig</label>
				<input v-model.number="fd.settlement" type="text" />
			</fieldset>
			<fieldset
				v-if="additionalDebt"
				style="
					display: grid;
					grid-template-columns: 12rem 1fr;
					align-items: center;
					gap: 0.5rem 1rem;
				"
			>
				<legend style="grid-column: 1 / -1">anden gæld</legend>
				<label for="creditor_2">Kreditor</label>
				<input v-model.number="fd.creditor_2" type="text" />
				<label for="debt_amount_2">Gældsbeløb</label>
				<input v-model.number="fd.debt_amount_2" type="number" min="0" step="100" />
				<label for="settlement_2">Forlig</label>
				<input v-model.number="fd.settlement_2" type="text" />
			</fieldset>
		</div>

		<!-- Billeder af huset -->
		<FileUpload
			id="house-photo"
			title="Billede af huset og postkasse"
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

			<textarea
				v-model.trim="fd.comments"
				cols="50"
				rows="4"
				placeholder="Evt. noter"
			></textarea>
		</label>
		<br />
		<button type="submit" :disabled="isSubmitting">Aflever svar</button>
	</form>

	<!--

        <div class="form-section">
          <h4>Boligen</h4>
          <div class="checkbox-group">
            Bolig type
            <label for="boligType" class="checkbox-label"> bolig type</label>
            <select id="boligType" v-model="formData.property_type" class="form-select">
              <option value="Fritliggende">Fritliggende</option>
              <option value="Byhus">Byhus</option>
              <option value="Kolonihave">Kolonihave</option>
              <option value="lejlighed">Lejlighed</option>
              <option value="rækkehus">Rækkehus</option>
              <option value="sommerhus">Sommerhus</option>
            </select>
            Stand
            <label for="maintenance_status" class="checkbox-label"> bolig stand</label>
            <select
              id="maintenance_status"
              v-model="formData.maintenance_status"
              class="form-select"
            >
              <option value="god">God</option>
              <option value="dårlig">Dårlig</option>
            </select>
            ownership_status
            <label for="ownership_status" class="checkbox-label"> ejerforhold</label>
            <select id="ownership_status" v-model="formData.ownership_status" class="form-select">
              <option value="EjerBolig">Ejer</option>
              <option value="LejerBolig">Lejer</option>
              <option value="AndelsBolig">Andels</option>
            </select>
          </div>
        </div>

blanco skal man bare have penge ud.
mere personen end aktiver
hvordan ser ejendommen ud?
hvor rig er personen?
billeder af huset og haven og andet.


hvad kan debitor rutte med? hvad er deres rådigheds beløb
hvad tjener debitor? hvordan er deres økonomi. hvor mange børn? job?
har de andre aktiver/sommerhus eller noget 

hvis eksporteret, hvorfor har du ikke indfriet gælden?


potentiel afdrags ordning
--></template>

<script setup>
import { computed, ref } from 'vue'
import YesNo from '@/components/forms/YesNo.vue'
import FileUpload from '@/components/forms/FileUpload.vue'
import SelectField from '@/components/forms/SelectField.vue'

const expanded = ref(false)
const hasChildren = ref(undefined)
const additionalDebt = ref(false)

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
