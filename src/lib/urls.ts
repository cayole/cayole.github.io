const SAFE_DATA_IMAGE = /^data:image\/(?:png|jpeg|webp|gif);base64,[a-z0-9+/=\s]+$/i

export function isSafeDataImage(value: string) {
  return SAFE_DATA_IMAGE.test(value)
}

export function safeImageUrl(value?: string) {
  if (!value) return undefined
  if (isSafeDataImage(value)) return value

  try {
    const parsed = new URL(value, window.location.href)
    if (parsed.protocol === 'https:') return parsed.href
    if (parsed.protocol === 'http:' && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')) {
      return parsed.href
    }
    if (parsed.origin === window.location.origin) return parsed.href
  } catch {
    return undefined
  }

  return undefined
}
