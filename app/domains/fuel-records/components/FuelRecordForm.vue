<script setup lang="ts">
import type { Vehicle } from '../../vehicles/types'
import { FUEL_TYPE_OPTIONS } from '../utils/options'
import { suggestTotalPrice, type FuelRecordFormState } from '../utils/form'

const props = withDefaults(defineProps<{
    errors?: Record<string, string>
    disabled?: boolean
    vehicles?: Vehicle[]
    optionsLoading?: boolean
    lockVehicleId?: boolean
    vehicleOptionLabel?: (vehicle: Vehicle) => string
}>(), {
    errors: () => ({}),
    disabled: false,
    vehicles: () => [],
    optionsLoading: false,
    lockVehicleId: false,
    vehicleOptionLabel: (vehicle: Vehicle) => vehicle.name ?? vehicle.registration_number ?? vehicle.id,
})

const vehicleId = defineModel<FuelRecordFormState['vehicle_id']>('vehicleId', { required: true })
const fuelType = defineModel<FuelRecordFormState['fuel_type']>('fuelType', { required: true })
const mileage = defineModel<FuelRecordFormState['mileage']>('mileage', { required: true })
const quantity = defineModel<FuelRecordFormState['quantity']>('quantity', { required: true })
const unitPrice = defineModel<FuelRecordFormState['unit_price']>('unitPrice', { required: true })
const totalPrice = defineModel<FuelRecordFormState['total_price']>('totalPrice', { required: true })
const fuelDate = defineModel<FuelRecordFormState['fuel_date']>('fuelDate', { required: true })
const paymentMethod = defineModel<FuelRecordFormState['payment_method']>('paymentMethod', { required: true })
const fullTank = defineModel<FuelRecordFormState['full_tank']>('fullTank', { required: true })
const notes = defineModel<FuelRecordFormState['notes']>('notes', { required: true })

const vehicleSelectId = useId()
const totalTouched = ref(false)

watch([quantity, unitPrice], () => {
    if (totalTouched.value) return
    const suggested = suggestTotalPrice({
        vehicle_id: vehicleId.value,
        fuel_type: fuelType.value,
        mileage: mileage.value,
        quantity: quantity.value,
        unit_price: unitPrice.value,
        total_price: totalPrice.value,
        fuel_date: fuelDate.value,
        payment_method: paymentMethod.value,
        full_tank: fullTank.value,
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
            <label :for="vehicleSelectId" class="text-sm font-semibold text-neutral-900">
                Véhicule
            </label>
            <div class="relative">
                <select
                    :id="vehicleSelectId"
                    v-model="vehicleId"
                    name="vehicle_id"
                    class="h-11 w-full appearance-none rounded-2xl border border-neutral-200 bg-white px-4 pr-10 text-sm text-neutral-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="disabled || optionsLoading || lockVehicleId"
                    :aria-invalid="errors.vehicle_id ? 'true' : undefined"
                >
                    <option value="" disabled>
                        {{ optionsLoading ? 'Chargement…' : 'Choisir un véhicule' }}
                    </option>
                    <option
                        v-for="vehicle in vehicles"
                        :key="vehicle.id"
                        :value="vehicle.id"
                    >
                        {{ vehicleOptionLabel(vehicle) }}
                    </option>
                </select>
                <i class="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-neutral-400" aria-hidden="true" />
            </div>
            <p v-if="errors.vehicle_id" class="text-sm text-red-600" role="alert">
                {{ errors.vehicle_id }}
            </p>
        </div>

        <fieldset class="sm:col-span-2">
            <legend class="text-sm font-semibold text-neutral-900">
                Carburant
            </legend>
            <div class="mt-2 flex flex-wrap gap-2">
                <button
                    v-for="option in FUEL_TYPE_OPTIONS"
                    :key="option.value"
                    type="button"
                    class="h-10 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                    :class="fuelType === option.value
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'"
                    :aria-pressed="fuelType === option.value"
                    :disabled="disabled"
                    @click="fuelType = option.value"
                >
                    {{ option.label }}
                </button>
            </div>
            <p v-if="errors.fuel_type" class="mt-2 text-sm text-red-600">
                {{ errors.fuel_type }}
            </p>
        </fieldset>

        <UiInput
            v-model="fuelDate"
            name="fuel_date"
            type="date"
            label="Date du plein"
            icon="fa-regular fa-calendar"
            :error="errors.fuel_date"
            :disabled="disabled"
            data-autofocus
        />

        <UiInput
            v-model="mileage"
            name="mileage"
            label="Kilométrage"
            placeholder="45000"
            icon="fa-solid fa-road"
            :error="errors.mileage"
            :disabled="disabled"
        />

        <UiInput
            v-model="quantity"
            name="quantity"
            label="Quantité (L)"
            placeholder="45"
            icon="fa-solid fa-droplet"
            :error="errors.quantity"
            :disabled="disabled"
        />

        <UiInput
            v-model="unitPrice"
            name="unit_price"
            label="Prix unitaire"
            placeholder="750"
            icon="fa-solid fa-tag"
            :error="errors.unit_price"
            :disabled="disabled"
        />

        <UiInput
            v-model="totalPrice"
            name="total_price"
            label="Montant total"
            placeholder="33750"
            icon="fa-solid fa-coins"
            hint="Calculé automatiquement si quantité et prix unitaire sont renseignés."
            :error="errors.total_price"
            :disabled="disabled"
        />

        <UiInput
            v-model="paymentMethod"
            name="payment_method"
            label="Mode de paiement"
            placeholder="Espèces, carte…"
            icon="fa-regular fa-credit-card"
            :disabled="disabled"
        />

        <div class="flex items-end">
            <UiSwitch
                v-model="fullTank"
                name="full_tank"
                label="Plein complet"
                description="Indique si le réservoir a été rempli."
                :disabled="disabled"
            />
        </div>

        <UiTextarea
            v-model="notes"
            name="notes"
            class="sm:col-span-2"
            label="Notes"
            placeholder="Station, commentaire…"
            :disabled="disabled"
        />
    </div>
</template>
