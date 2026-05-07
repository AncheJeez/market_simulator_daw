import { useEffect, useState } from 'react'
import { getYahooFinanceEnabled, setYahooFinanceEnabled } from '../utils/settings'

function Settings() {
  const [enabled, setEnabled] = useState(getYahooFinanceEnabled())
  const [message, setMessage] = useState('')

  useEffect(() => {
    setEnabled(getYahooFinanceEnabled())
  }, [])

  const handleSave = () => {
    setYahooFinanceEnabled(enabled)
    setMessage('Settings saved.')
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-7">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h1 className="h3 mb-3">Settings</h1>
            <form className="d-grid gap-4" onSubmit={(event) => event.preventDefault()}>
              <div>
                <label className="form-label fw-semibold">Theme</label>
                <div className="d-flex gap-3 flex-wrap">
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="theme" id="themeLight" defaultChecked />
                    <label className="form-check-label" htmlFor="themeLight">
                      White Theme
                    </label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="theme" id="themeDark" />
                    <label className="form-check-label" htmlFor="themeDark">
                      Dark Theme
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label fw-semibold">Language</label>
                <select className="form-select">
                  <option>English</option>
                  <option>Spanish</option>
                </select>
              </div>

              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="alphaToggle"
                  checked={enabled}
                  onChange={(event) => setEnabled(event.target.checked)}
                />
                <label className="form-check-label" htmlFor="alphaToggle">
                  Enable Yahoo Finance API calls
                </label>
              </div>

              <button className="btn btn-primary" type="button" onClick={handleSave}>
                Save Settings
              </button>
              {message && <div className="text-success">{message}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
