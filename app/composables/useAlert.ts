import { ref, shallowRef } from 'vue'

export type AlertIcon = 'success' | 'error' | 'warning' | 'info' | 'question'
export type AlertInput = 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select'
export type AlertButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type AlertDismissReason = 'cancel' | 'overlay' | 'escape' | 'timer' | 'close'

export interface AlertInputOption {
    label: string
    value: string
}

export interface AlertDialogProps {
    title?: string
    text?: string
    icon?: AlertIcon
    confirmText?: string
    cancelText?: string
    denyText?: string
    showCancel?: boolean
    showDeny?: boolean
    showConfirm?: boolean
    confirmVariant?: AlertButtonVariant
    focusCancel?: boolean
    showClose?: boolean
    input?: AlertInput
    inputLabel?: string
    inputPlaceholder?: string
    inputValue?: string
    inputOptions?: AlertInputOption[]
    inputValidator?: (value: string) => string | void | Promise<string | void>
    preConfirm?: (value?: string) => unknown
    timer?: number
    closeOnOverlay?: boolean
    closeOnEscape?: boolean
}

export interface AlertOptions extends Omit<AlertDialogProps, 'inputOptions'> {
    inputOptions?: AlertInputOption[] | Record<string, string>
}

export interface AlertResult {
    isConfirmed: boolean
    isDenied: boolean
    isDismissed: boolean
    dismiss?: AlertDismissReason
    value?: string
}

interface AlertEntry {
    id: number
    options: AlertDialogProps
    resolve: (result: AlertResult) => void
}

const queue: AlertEntry[] = []
const active = shallowRef<AlertEntry | null>(null)
const open = ref(false)

let seq = 0
let settling = false

const LEAVE_MS = 200

function dismissed(reason: AlertDismissReason): AlertResult {
    return {
        isConfirmed: false,
        isDenied: false,
        isDismissed: true,
        dismiss: reason,
    }
}

function normalizeInputOptions(options: AlertOptions['inputOptions']): AlertInputOption[] {
    if (!options) return []
    if (Array.isArray(options)) return options
    return Object.entries(options).map(([value, label]) => ({ value, label }))
}

function normalize(options: AlertOptions): AlertDialogProps {
    return {
        title: options.title,
        text: options.text,
        icon: options.icon,
        confirmText: options.confirmText ?? 'OK',
        cancelText: options.cancelText ?? 'Annuler',
        denyText: options.denyText ?? 'Refuser',
        showCancel: options.showCancel ?? false,
        showDeny: options.showDeny ?? false,
        showConfirm: options.showConfirm ?? true,
        confirmVariant: options.confirmVariant ?? 'primary',
        focusCancel: options.focusCancel,
        showClose: options.showClose ?? false,
        input: options.input,
        inputLabel: options.inputLabel,
        inputPlaceholder: options.inputPlaceholder,
        inputValue: options.inputValue,
        inputOptions: normalizeInputOptions(options.inputOptions),
        inputValidator: options.inputValidator,
        preConfirm: options.preConfirm,
        timer: options.timer,
        closeOnOverlay: options.closeOnOverlay ?? true,
        closeOnEscape: options.closeOnEscape ?? true,
    }
}

function pump() {
    if (settling || active.value) return
    const next = queue[0]
    if (!next) return
    active.value = next
    open.value = true
}

function settle(result: AlertResult) {
    const entry = active.value
    if (!entry || settling) return
    settling = true
    open.value = false

    const reduceMotion = import.meta.client
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const delay = reduceMotion ? 0 : LEAVE_MS

    window.setTimeout(() => {
        const index = queue.findIndex((item) => item.id === entry.id)
        if (index !== -1) queue.splice(index, 1)
        active.value = null
        settling = false
        entry.resolve(result)
        pump()
    }, delay)
}

function enqueue(options: AlertOptions) {
    if (import.meta.server) return Promise.resolve(dismissed('close'))

    return new Promise<AlertResult>((resolve) => {
        queue.push({
            id: ++seq,
            options: normalize(options),
            resolve,
        })
        pump()
    })
}

function fire(options: AlertOptions): Promise<AlertResult>
function fire(title: string, text?: string, icon?: AlertIcon): Promise<AlertResult>
function fire(titleOrOptions: AlertOptions | string, text?: string, icon?: AlertIcon) {
    const options = typeof titleOrOptions === 'string'
        ? { title: titleOrOptions, text, icon }
        : titleOrOptions
    return enqueue(options)
}

function withTitle(options: AlertOptions | string, base: AlertOptions) {
    return enqueue(typeof options === 'string' ? { ...base, title: options } : { ...base, ...options })
}

function success(title: string, text?: string) {
    return fire({ title, text, icon: 'success' })
}

function error(title: string, text?: string) {
    return fire({ title, text, icon: 'error' })
}

function warning(title: string, text?: string) {
    return fire({ title, text, icon: 'warning' })
}

function info(title: string, text?: string) {
    return fire({ title, text, icon: 'info' })
}

function confirm(options: AlertOptions | string) {
    return withTitle(options, {
        icon: 'warning',
        showCancel: true,
        confirmVariant: 'danger',
        focusCancel: true,
        confirmText: 'Confirmer',
    })
}

function prompt(options: AlertOptions | string) {
    return withTitle(options, {
        icon: 'question',
        showCancel: true,
        input: 'text',
        confirmText: 'Valider',
    })
}

function close() {
    settle(dismissed('close'))
}

export function useAlert() {
    return {
        fire,
        success,
        error,
        warning,
        info,
        confirm,
        prompt,
        close,
    }
}

export function useAlertHost() {
    return { active, open, settle }
}
