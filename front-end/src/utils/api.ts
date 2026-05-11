// Keep empty default so Vite dev server proxy is used when running locally.
// If VITE_API_BASE_URL is provided, use it (for server deployment).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}

export function assetUrl(path: string, fallback: string) {
  if (!path) {
    return fallback
  }
  return apiUrl(path)
}
