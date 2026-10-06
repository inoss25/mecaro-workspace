export const truncateText = (text: string, maxLength: number) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}
export const lowercase = (text: string) => {
    return text.toLowerCase()
}

export const uppercase = (text: string) => {
    return text.toUpperCase()
}

export const capitalize = (text: string) => {
    return text[0] ? text[0].toUpperCase() + text.slice(1) : ''
}

export const camelCase = (text: string) => {
    return text.replace(/(?:^|_)([a-z])/g, (_, letter) => letter.toUpperCase())
}

export const snakeCase = (text: string) => {
    return text.replace(/([A-Z])/g, '_$1').toLowerCase()
}

export const kebabCase = (text: string) => {
    return text.replace(/([A-Z])/g, '-$1').toLowerCase()
}

export const pascalCase = (text: string) => {
    return text.replace(/(?:^|_)([a-z])/g, (_, letter) => letter.toUpperCase())
}

export const titleCase = (text: string) => {
    return text.replace(/(?:^|_)([a-z])/g, (_, letter) => letter.toUpperCase())
}

export const sentenceCase = (text: string) => {
    return text.replace(/(?:^|_)([a-z])/g, (_, letter) => letter.toUpperCase())
}

export const slugify = (text: string) => {
    return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
}
