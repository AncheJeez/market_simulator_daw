import { useEffect, useState } from 'react'
import ReagraphDashboard from './ReagraphDashboard'

type OverviewRow = {
  symbol: string
  name: string
  dataPoints: number
  latestDate: string | null
  latestClose: number | null
}

function DatabaseDashboard() {
  const [rows, setRows] = useState<OverviewRow[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/market/overview', {
          credentials: 'include',
        })
        if (response.ok) {
          const data: OverviewRow[] = await response.json()
          setRows(data)
          setError(null)
        } else if (response.status === 401) {
          setError('Session expired. Please log in again.')
        } else {
          setError(`Request failed: ${response.status}`)
        }
      } catch (err) {
        setError('Failed to load overview data.')
      }
    }
    load()
  }, [])

  return (
    <div className="row justify-content-center">
      <div className="col-lg-11">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h1 className="h3 mb-1">Dashboard</h1>
            <p className="text-muted mb-4">Stored business &amp; their current value</p>
            {error ? (
              <div className="alert alert-warning">{error}</div>
            ) : rows.length === 0 ? (
              <div className="text-muted">No data available yet.</div>
            ) : null}
            {rows.length > 0 ? <ReagraphDashboard rows={rows} /> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DatabaseDashboard
