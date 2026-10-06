import { shallowRef } from 'vue'

export type ToastIcon = 'success' | 'error' | 'warning' | 'info'
export type ToastPosition =
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center'

export interface ToastOptions {
    title: string
    text?: string
    icon?: ToastIcon
    duration?: number
    closable?: boolean
    position?: ToastPosition
}

export interface ToastProps {
    title: string
    text?: string
    icon?: ToastIcon
    duration: number
    closable: boolean
}

export interface ToastEntry {
    id: number
    position: ToastPosition
    props: ToastProps
}

const items = shallowRef<ToastEntry[]>([])

let seq = 0

const MAX_PER_POSITION = 4

function normalize(options: ToastOptions) {
    return {
        position: options.position ?? 'top-right' as ToastPosition,
        props: {
            title: options.title,
            text: options.text,
            icon: options.icon,
            duration: options.duration ?? 5000,
            closable: options.closable ?? true,
        } satisfies ToastProps,
    }
}

function show(options: ToastOptions) {
    if (import.meta.server) return 0

    const id = ++seq
    const next = normalize(options)
    const samePosition = items.value.filter(item => item.position === next.position)
    const overflow = samePosition.length >= MAX_PER_POSITION
        ? samePosition.slice(0, samePosition.length - MAX_PER_POSITION + 1).map(item => item.id)
        : []

    items.value = [
        ...items.value.filter(item => !overflow.includes(item.id)),
        { id, position: next.position, props: next.props },
    ]

    return id
}

function dismiss(id: number) {
    items.value = items.value.filter(item => item.id !== id)
}

function clear() {
    items.value = []
}

function success(title: string, text?: string) {
    return show({ title, text, icon: 'success' })
}

function error(title: string, text?: string) {
    return show({ title, text, icon: 'error' })
}

function warning(title: string, text?: string) {
    return show({ title, text, icon: 'warning' })
}

function info(title: string, text?: string) {
    return show({ title, text, icon: 'info' })
}

export function useToast() {
    return {
        show,
        success,
        error,
        warning,
        info,
        dismiss,
        clear,
    }
}

export function useToastHost() {
    return { items, dismiss }
}
