const ENABLED_STORAGE = 'yahoo_finance_api_enabled'
const LEGACY_ENABLED_STORAGE = 'alphavantage_api_enabled'

export function getYahooFinanceEnabled() {
  return localStorage.getItem(ENABLED_STORAGE) === 'true' || localStorage.getItem(LEGACY_ENABLED_STORAGE) === 'true'
}

export function setYahooFinanceEnabled(enabled: boolean) {
  localStorage.setItem(ENABLED_STORAGE, enabled ? 'true' : 'false')
}
