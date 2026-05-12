import { useEffect, useState } from 'react'
import ReagraphDashboard from './ReagraphDashboard'
import { apiUrl } from '../utils/api'

type OverviewRow = {
  symbol: string
  name: string
  dataPoints: number
  latestDate: string | null
  latestClose: number | null
}

const THEME = {
  card: '#1a2949',
  border: '#2b3139',
  text: '#ffffff', // Blanco puro para máxima visibilidad
  primary: '#f0b90b', // Amarillo trading
  accent: '#31d2f2' // Cyan para datos técnicos
};

function DatabaseDashboard() {
  const [rows, setRows] = useState<OverviewRow[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(apiUrl('/api/market/overview'), {
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
    <div className="row justify-content-center px-2">
      <div className="col-12 col-lg-11">
        <div 
          className="card border-0 shadow-lg dashboard-entrance" 
          style={{ 
            backgroundColor: THEME.card, 
            border: `1px solid ${THEME.border}`,
            color: THEME.text,
            borderRadius: '12px',
            overflow: 'hidden'
          }}
        >
          {/* Header estilizado */}
          <div className="card-header border-0 p-4 pb-0 bg-transparent">
            <div className="d-flex align-items-center mb-1">
              <div className="status-indicator me-2"></div>
              <h1 className="h4 fw-bold mb-0 text-uppercase tracking-wider" style={{ color: THEME.text }}>
                Market <span style={{ color: THEME.primary }}>Intelligence</span> Dashboard
              </h1>
            </div>
            <p className="small" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Real-time synchronization with stored business assets and valuation metrics.
            </p>
          </div>

          <div className="card-body p-4">
            {error ? (
              <div 
                className="alert border-0 text-white shadow-sm" 
                style={{ backgroundColor: 'rgba(220, 53, 69, 0.2)', borderLeft: '4px solid #dc3545' }}
              >
                <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
              </div>
            ) : rows.length === 0 ? (
              <div className="py-5 text-center">
                <div className="spinner-border text-warning mb-3" role="status"></div>
                <div style={{ color: THEME.text }}>Scanning database for active data points...</div>
              </div>
            ) : null}

            {rows.length > 0 && (
              <div className="table-responsive-container">
                <ReagraphDashboard rows={rows} />
              </div>
            )}
          </div>

          {/* Footer técnico opcional */}
          <div className="card-footer bg-transparent border-0 px-4 pb-4">
            <div className="d-flex justify-content-between align-items-center p-2 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: `1px solid ${THEME.border}` }}>
              <span className="x-small text-white uppercase fw-bold">System Status: <span className="text-success">Operational</span></span>
              <span className="x-small text-white uppercase fw-bold">Total Assets: {rows.length}</span>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .dashboard-entrance {
            animation: fadeIn 0.5s ease-out forwards;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .status-indicator {
            width: 8px;
            height: 8px;
            background-color: ${THEME.primary};
            border-radius: 50%;
            box-shadow: 0 0 8px ${THEME.primary};
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
          }

          .tracking-wider {
            letter-spacing: 1.5px;
          }

          .x-small {
            font-size: 0.7rem;
          }

          /* Aseguramos que ReagraphDashboard no rompa el estilo */
          .table-responsive-container {
            border-radius: 8px;
            overflow: hidden;
          }
        `}
      </style>
    </div>
  )
}

export default DatabaseDashboard