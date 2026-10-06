import type { MaybeRefOrGetter, Ref } from 'vue'

type PopupAlign = 'start' | 'end'
type PopupMeasure = number | 'anchor'

type UseAnchoredPopupOptions = {
    align?: MaybeRefOrGetter<PopupAlign>
    width?: MaybeRefOrGetter<PopupMeasure | undefined>
    minWidth?: MaybeRefOrGetter<PopupMeasure | undefined>
}

export function useAnchoredPopup(
    anchor: Ref<HTMLElement | null>,
    popup: Ref<HTMLElement | null>,
    open: Ref<boolean>,
    options: UseAnchoredPopupOptions = {},
) {
    const style = ref<Record<string, string>>({
        position: 'fixed',
        top: '0px',
        left: '0px',
        zIndex: '120',
        visibility: 'hidden',
    })

    let frame = 0

    function measure(value: PopupMeasure | undefined, anchorWidth: number, fallback: number) {
        if (value === 'anchor') return anchorWidth
        if (typeof value === 'number') return value
        return fallback
    }

    function update() {
        if (!import.meta.client || !open.value) return
        const anchorEl = anchor.value
        const popupEl = popup.value
        if (!anchorEl || !popupEl) return

        const rect = anchorEl.getBoundingClientRect()
        const align = toValue(options.align) ?? 'start'
        const width = measure(toValue(options.width), rect.width, popupEl.offsetWidth)
        const minWidth = measure(toValue(options.minWidth), rect.width, 0)
        const usedWidth = Math.max(width, minWidth)
        const height = popupEl.offsetHeight
        const gap = 8
        const margin = 8
        const spaceBelow = window.innerHeight - rect.bottom - gap - margin
        const spaceAbove = rect.top - gap - margin
        const placeAbove = height > spaceBelow && spaceAbove > spaceBelow
        const top = placeAbove
            ? Math.max(margin, rect.top - gap - height)
            : Math.min(rect.bottom + gap, Math.max(margin, window.innerHeight - height - margin))

        let left = align === 'end' ? rect.right - usedWidth : rect.left
        left = Math.min(Math.max(margin, left), Math.max(margin, window.innerWidth - usedWidth - margin))

        const next: Record<string, string> = {
            position: 'fixed',
            top: `${Math.round(top)}px`,
            left: `${Math.round(left)}px`,
            zIndex: '120',
            visibility: 'visible',
        }

        const widthOption = toValue(options.width)
        if (widthOption != null) next.width = `${Math.round(width)}px`
        if (minWidth > 0) next.minWidth = `${Math.round(minWidth)}px`
        style.value = next
    }

    function schedule() {
        if (!import.meta.client || !open.value) return
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(update)
    }

    watch(open, (isOpen) => {
        if (!isOpen) {
            style.value = { ...style.value, visibility: 'hidden' }
            return
        }
        nextTick(() => {
            update()
            schedule()
        })
    }, { flush: 'post' })

    if (import.meta.client) {
        useEventListener(window, 'resize', schedule)
        useEventListener(window, 'scroll', schedule, { capture: true, passive: true })
    }

    onBeforeUnmount(() => {
        if (!import.meta.client) return
        cancelAnimationFrame(frame)
    })

    return { style, update }
}
