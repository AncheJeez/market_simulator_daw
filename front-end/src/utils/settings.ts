const KEY_STORAGE = 'alphavantage_api_key'
const ENABLED_STORAGE = 'alphavantage_api_enabled'
const QUOTA_STORAGE = 'alphavantage_quota_remaining'
const QUOTA_DATE_STORAGE = 'alphavantage_quota_date'
const DAILY_QUOTA = 25

export function getAlphaVantageKey() {
  return localStorage.getItem(KEY_STORAGE) || ''
}

export function setAlphaVantageKey(value) {
  if (!value) {
    localStorage.removeItem(KEY_STORAGE)
    return
  }
  localStorage.setItem(KEY_STORAGE, value)
}

export function getAlphaVantageEnabled() {
  return localStorage.getItem(ENABLED_STORAGE) === 'true'
}

export function setAlphaVantageEnabled(enabled) {
  localStorage.setItem(ENABLED_STORAGE, enabled ? 'true' : 'false')
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function getQuotaRemaining() {
  const storedDate = localStorage.getItem(QUOTA_DATE_STORAGE)
  const today = todayKey()
  if (storedDate !== today) {
    localStorage.setItem(QUOTA_DATE_STORAGE, today)
    localStorage.setItem(QUOTA_STORAGE, String(DAILY_QUOTA))
    return DAILY_QUOTA
  }
  const raw = localStorage.getItem(QUOTA_STORAGE)
  return raw ? Number(raw) : DAILY_QUOTA
}

export function decrementQuota(amount) {
  const remaining = Math.max(getQuotaRemaining() - amount, 0)
  localStorage.setItem(QUOTA_STORAGE, String(remaining))
  return remaining
}

export function getDailyQuota() {
  return DAILY_QUOTA
}
