import { formatDate } from '../../../../shared/utils/date'

const MONTHS: Record<string, { short: string, long: string }> = {
    January: { short: 'janv.', long: 'janvier' },
    February: { short: 'févr.', long: 'février' },
    March: { short: 'mars', long: 'mars' },
    April: { short: 'avr.', long: 'avril' },
    May: { short: 'mai', long: 'mai' },
    June: { short: 'juin', long: 'juin' },
    July: { short: 'juil.', long: 'juillet' },
    August: { short: 'août', long: 'août' },
    September: { short: 'sept.', long: 'septembre' },
    October: { short: 'oct.', long: 'octobre' },
    November: { short: 'nov.', long: 'novembre' },
    December: { short: 'déc.', long: 'décembre' },
}

export function chartMonthLabel(label: string, style: 'short' | 'long' = 'short') {
    const match = label.trim().match(/^([A-Za-z]+)\s+(\d{4})$/)
    if (!match) return label

    const month = MONTHS[match[1] ?? '']
    const year = match[2] ?? ''
    if (!month) return label

    if (style === 'long') return `${month.long} ${year}`
    return `${month.short} ${year.slice(2)}`
}

export function formatCount(value: number) {
    return new Intl.NumberFormat('fr-FR').format(value)
}

export function formatDashboardDate(value: string) {
    const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(value)
        ? value.replace(' ', 'T')
        : value
    return formatDate(normalized)
}
