<script setup lang="ts">
import type { MaintenanceRecord } from '../../maintenance-records/types'
import { maintenanceRecordLabel } from '../../maintenance-records/utils/options'
import { suggestPartTotal, type MaintenancePartFormState } from '../utils/form'

withDefaults(defineProps<{
    errors?: Record<string, string>
    disabled?: boolean
    records?: MaintenanceRecord[]
    optionsLoading?: boolean
    lockRecordId?: boolean
}>(), {
    errors: () => ({}),
    disabled: false,
    records: () => [],
    optionsLoading: false,
    lockRecordId: false,
})

const recordId = defineModel<MaintenancePartFormState['maintenance_record_id']>('recordId', { required: true })
const name = defineModel<MaintenancePartFormState['name']>('name', { required: true })
const reference = defineModel<MaintenancePartFormState['reference']>('reference', { required: true })
const quantity = defineModel<MaintenancePartFormState['quantity']>('quantity', { required: true })
const unitPrice = defineModel<MaintenancePartFormState['unit_price']>('unitPrice', { required: true })
const totalPrice = defineModel<MaintenancePartFormState['total_price']>('totalPrice', { required: true })
const brand = defineModel<MaintenancePartFormState['brand']>('brand', { required: true })
const notes = defineModel<MaintenancePartFormState['notes']>('notes', { required: true })

const recordSelectId = useId()
const totalTouched = ref(false)

watch([quantity, unitPrice], () => {
    if (totalTouched.value) return
    const suggested = suggestPartTotal({
        maintenance_record_id: recordId.value,
        name: name.value,
        reference: reference.value,
        quantity: quantity.value,
        unit_price: unitPrice.value,
        total_price: totalPrice.value,
        brand: brand.value,
        notes: notes.value,
    })
    if (suggested != null) totalPrice.value = String(suggested)
})

watch(totalPrice, () => {
    totalTouched.value = true
})
</script>

<template>
    <div class="grid gap-5 sm:grid-cols-2">
        <div class="flex flex-col gap-2 sm:col-span-2">
            <label :for="recordSelectId" class="text-sm font-semibold text-neutral-900">Intervention</label>
            <div class="relative">
                <select
                    :id="recordSelectId"
                    v-model="recordId"
                    name="maintenance_record_id"
                    class="h-11 w-full appearance-none rounded-2xl border border-neutral-200 bg-white px-4 pr-10 text-sm text-neutral-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="disabled || optionsLoading || lockRecordId"
                    :aria-invalid="errors.maintenance_record_id ? 'true' : undefined"
                >
                    <option value="" disabled>{{ optionsLoading ? 'Chargement…' : 'Choisir une intervention' }}</option>
                    <option v-for="record in records" :key="record.id" :value="record.id">{{ maintenanceRecordLabel(record) }}</option>
                </select>
                <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-neutral-400" aria-hidden="true" />
            </div>
            <p v-if="errors.maintenance_record_id" class="text-sm text-red-600" role="alert">{{ errors.maintenance_record_id }}</p>
        </div>

        <UiInput v-model="name" name="name" label="Nom" placeholder="Filtre à huile" icon="fa-solid fa-gears" :error="errors.name" :disabled="disabled" data-autofocus />
        <UiInput v-model="reference" name="reference" label="Référence" placeholder="OF-1234" icon="fa-solid fa-barcode" :disabled="disabled" />
        <UiInput v-model="brand" name="brand" label="Marque" placeholder="Bosch" icon="fa-solid fa-industry" :disabled="disabled" />
        <UiInput v-model="quantity" name="quantity" label="Quantité" placeholder="1" icon="fa-solid fa-hashtag" :error="errors.quantity" :disabled="disabled" />
        <UiInput v-model="unitPrice" name="unit_price" label="Prix unitaire" placeholder="4500" icon="fa-solid fa-tag" :error="errors.unit_price" :disabled="disabled" />
        <UiInput v-model="totalPrice" name="total_price" label="Montant total" placeholder="4500" icon="fa-solid fa-coins" hint="Calculé si quantité et prix unitaire sont renseignés." :error="errors.total_price" :disabled="disabled" />
        <UiTextarea v-model="notes" name="notes" class="sm:col-span-2" label="Notes" placeholder="Pièce d’origine…" :disabled="disabled" />
    </div>
</template>
