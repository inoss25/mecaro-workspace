<script setup lang="ts">
import type { MaintenanceRecord } from '../../maintenance-records/types'
import { maintenanceRecordLabel } from '../../maintenance-records/utils/options'
import { suggestOilTotal, type MaintenanceOilFormState } from '../utils/form'
import { OIL_UNIT_OPTIONS } from '../utils/options'

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

const recordId = defineModel<MaintenanceOilFormState['maintenance_record_id']>('recordId', { required: true })
const brand = defineModel<MaintenanceOilFormState['brand']>('brand', { required: true })
const productName = defineModel<MaintenanceOilFormState['product_name']>('productName', { required: true })
const viscosity = defineModel<MaintenanceOilFormState['viscosity']>('viscosity', { required: true })
const quantity = defineModel<MaintenanceOilFormState['quantity']>('quantity', { required: true })
const unit = defineModel<MaintenanceOilFormState['unit']>('unit', { required: true })
const unitPrice = defineModel<MaintenanceOilFormState['unit_price']>('unitPrice', { required: true })
const totalPrice = defineModel<MaintenanceOilFormState['total_price']>('totalPrice', { required: true })
const notes = defineModel<MaintenanceOilFormState['notes']>('notes', { required: true })

const recordSelectId = useId()
const unitSelectId = useId()
const totalTouched = ref(false)

const unitChoices = computed(() => {
    if (OIL_UNIT_OPTIONS.some(option => option.value === unit.value) || !unit.value) return OIL_UNIT_OPTIONS
    return [{ value: unit.value, label: unit.value }, ...OIL_UNIT_OPTIONS]
})

watch([quantity, unitPrice], () => {
    if (totalTouched.value) return
    const suggested = suggestOilTotal({
        maintenance_record_id: recordId.value,
        brand: brand.value,
        product_name: productName.value,
        viscosity: viscosity.value,
        quantity: quantity.value,
        unit: unit.value,
        unit_price: unitPrice.value,
        total_price: totalPrice.value,
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
            <label :for="recordSelectId" class="text-sm font-semibold text-neutral-900">
                Intervention
            </label>
            <div class="relative">
                <select
                    :id="recordSelectId"
                    v-model="recordId"
                    name="maintenance_record_id"
                    class="h-11 w-full appearance-none rounded-2xl border border-neutral-200 bg-white px-4 pr-10 text-sm text-neutral-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="disabled || optionsLoading || lockRecordId"
                    :aria-invalid="errors.maintenance_record_id ? 'true' : undefined"
                >
                    <option value="" disabled>
                        {{ optionsLoading ? 'Chargement…' : 'Choisir une intervention' }}
                    </option>
                    <option v-for="record in records" :key="record.id" :value="record.id">
                        {{ maintenanceRecordLabel(record) }}
                    </option>
                </select>
                <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-neutral-400" aria-hidden="true" />
            </div>
            <p v-if="errors.maintenance_record_id" class="text-sm text-red-600" role="alert">
                {{ errors.maintenance_record_id }}
            </p>
        </div>

        <UiInput v-model="productName" name="product_name" label="Produit" placeholder="Huile moteur 5W30" icon="fa-solid fa-oil-can" :disabled="disabled" data-autofocus />
        <UiInput v-model="brand" name="brand" label="Marque" placeholder="Total" icon="fa-solid fa-industry" :disabled="disabled" />
        <UiInput v-model="viscosity" name="viscosity" label="Viscosité" placeholder="5W30" icon="fa-solid fa-droplet" :disabled="disabled" />

        <div class="flex flex-col gap-2">
            <label :for="unitSelectId" class="text-sm font-semibold text-neutral-900">Unité</label>
            <div class="relative">
                <select
                    :id="unitSelectId"
                    v-model="unit"
                    name="unit"
                    class="h-11 w-full appearance-none rounded-2xl border border-neutral-200 bg-white px-4 pr-10 text-sm text-neutral-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="disabled"
                >
                    <option v-for="option in unitChoices" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </select>
                <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-neutral-400" aria-hidden="true" />
            </div>
            <p v-if="errors.unit" class="text-sm text-red-600">{{ errors.unit }}</p>
        </div>

        <UiInput v-model="quantity" name="quantity" label="Quantité" placeholder="4.5" icon="fa-solid fa-flask" :error="errors.quantity" :disabled="disabled" />
        <UiInput v-model="unitPrice" name="unit_price" label="Prix unitaire" placeholder="6500" icon="fa-solid fa-tag" :error="errors.unit_price" :disabled="disabled" />
        <UiInput
            v-model="totalPrice"
            name="total_price"
            label="Montant total"
            placeholder="29250"
            icon="fa-solid fa-coins"
            hint="Calculé si quantité et prix unitaire sont renseignés."
            :error="errors.total_price"
            :disabled="disabled"
        />
        <UiTextarea v-model="notes" name="notes" class="sm:col-span-2" label="Notes" placeholder="Filtre compris…" :disabled="disabled" />
    </div>
</template>
