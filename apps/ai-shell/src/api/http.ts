import i18n from '../i18n'

/**
 * `fetch` wrapper that stamps the user's chosen language onto every `/api` call
 * via the standard `Accept-Language` header, so both backends (MSW mock + Hono)
 * can serve locale-specific content. Reads the current language from the shared
 * i18n instance, defaulting to English before init settles.
 */
export function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('Accept-Language', i18n.language || 'en')
  return fetch(input, { ...init, headers })
}
