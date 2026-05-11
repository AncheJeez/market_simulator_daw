import { useEffect, useMemo, useState } from 'react'
import { apiUrl } from '../utils/api'

type StoredStock = {
  symbol: string
  name: string
  lastFetchedAt: string | null
  latestDate: string | null
  open: number
  high: number
  low: number
  close: number
  volume: number
  previousClose: number | null
  priceChange: number | null
  changePercent: number | null
  records: number
}

// Updated THEME with lighter, desaturated slate tones
const THEME = {
  bg: '#f8fafc',      // Very light slate for page background (if applicable)
  card: '#334155',    // Lighter Steel Blue/Slate for the main card
  border: '#475569',  // Lighter border for separation
  text: '#f1f5f9',    // Brighter off-white for primary text
  muted: '#94a3b8',   // Lighter gray-blue for secondary text
  primary: '#fbbf24', // Brighter Gold/Amber
  success: '#22c55e', // Vibrant Green
  danger: '#ef4444',  // Vibrant Red
  hover: '#3e4e63'    // Lighter hover state
};

type SortKey = 'symbol' | 'name' | 'latestDate' | 'close' | 'priceChange' | 'changePercent' | 'volume' | 'lastFetchedAt'

type SortState = {
  key: SortKey
  direction: 'asc' | 'desc'
}

function formatPrice(value: number | null | undefined) {
  return value === null || value === undefined ? '-' : `$${value.toFixed(2)}`
}

function formatPercent(value: number | null | undefined) {
  return value === null || value === undefined ? '-' : `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

function formatChange(value: number | null | undefined) {
  if (value === null || value === undefined) return '-'
  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}$${Math.abs(value).toFixed(2)}`
}

function formatVolume(value: number | null | undefined) {
  return value === null || value === undefined ? '-' : Math.round(value).toLocaleString('en-US')
}

function movementColor(value: number | null | undefined) {
  if (value === null || value === undefined || value === 0) return THEME.muted
  return value > 0 ? THEME.success : THEME.danger
}

function StoredMarket() {
  const [rows, setRows] = useState<StoredStock[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [sort, setSort] = useState<SortState>({ key: 'symbol', direction: 'asc' })

  useEffect(() => {
    const load = async () => {
      const response = await fetch(apiUrl('/api/market/stored'), {
        credentials: 'include',
      })
      if (response.ok) {
        const data: StoredStock[] = await response.json()
        setRows(data)
        setSelectedSymbol((current) => current ?? data[0]?.symbol ?? null)
      }
    }
    load()
  }, [])

  const sorted = useMemo(() => {
    const sortedRows = [...rows]
    sortedRows.sort((a, b) => {
      const direction = sort.direction === 'asc' ? 1 : -1
      const aValue = a[sort.key] ?? ''
      const bValue = b[sort.key] ?? ''
      if (aValue < bValue) return -1 * direction
      if (aValue > bValue) return 1 * direction
      return 0
    })
    return sortedRows
  }, [rows, sort])

  const selected = useMemo(
    () => rows.find((row) => row.symbol === selectedSymbol) ?? sorted[0] ?? null,
    [rows, selectedSymbol, sorted],
  )

  const toggleSort = (key: SortKey) => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  return (
    <div className="row justify-content-center">
      <style>
        {`
          .custom-table-hover tbody tr:hover {
            background-color: ${THEME.hover} !important;
          }
          .table-active-row {
            background-color: rgba(251, 191, 36, 0.15) !important;
            border-left: 3px solid ${THEME.primary} !important;
          }
          .detail-label { color: ${THEME.muted}; font-weight: 500; }
          .detail-value { color: ${THEME.text}; text-align: right; }
          
          /* Force override for the table container transparency */
          .table, .table > :not(caption) > * > * {
            background-color: transparent !important;
            box-shadow: none !important;
            border-color: ${THEME.border} !important;
          }
        `}
      </style>

      <div className="col-lg-11">
        <div className="card border-0 shadow-lg" style={{ backgroundColor: THEME.card, color: THEME.text }}>
          <div className="card-body p-4">
            <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
              <div>
                <h1 className="h3 mb-1 fw-bold" style={{ color: THEME.primary }}>Stored Stocks</h1>
                <div style={{ color: THEME.muted, fontSize: '0.85rem' }}>
                  {rows.length} assets currently indexed in local cache
                </div>
              </div>
              {selected && (
                <div className="text-end">
                  <div className="fs-3 fw-bold" style={{ color: movementColor(selected.priceChange) }}>
                    {formatPrice(selected.close)}
                  </div>
                  <div className="small fw-medium" style={{ color: movementColor(selected.priceChange) }}>
                    {formatChange(selected.priceChange)} ({formatPercent(selected.changePercent)})
                  </div>
                </div>
              )}
            </div>

            <div className="row g-4">
              <div className="col-xl-8">
                <div className="table-responsive">
                  <table 
                    className="table align-middle mb-0" 
                    style={{ 
                      color: THEME.text,
                      borderCollapse: 'separate',
                      borderSpacing: '0'
                    }}
                  >
                    <thead style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}>
                      <tr>
                        {['symbol', 'name', 'close', 'priceChange', 'changePercent', 'latestDate'].map((k) => (
                          <th 
                            key={k}
                            role="button" 
                            className="border-0 py-3 px-3"
                            style={{ 
                              color: THEME.muted, 
                              fontSize: '0.75rem', 
                              textTransform: 'uppercase'
                            }}
                            onClick={() => toggleSort(k as SortKey)}
                          >
                            <div className={`d-flex align-items-center ${k !== 'symbol' && k !== 'name' && k !== 'latestDate' ? 'justify-content-end' : ''}`}>
                              {k.replace(/([A-Z])/g, ' $1')}
                              <span className="ms-1" style={{ color: THEME.primary, width: '10px' }}>
                                {sort.key === k ? (sort.direction === 'asc' ? '↑' : '↓') : ''}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody style={{ borderTop: 'none' }}>
                      {sorted.map((row) => (
                        <tr
                          key={row.symbol}
                          role="button"
                          className={selected?.symbol === row.symbol ? 'table-active-row' : ''}
                          style={{ 
                            borderBottom: `1px solid ${THEME.border}`,
                            transition: '0.2s'
                          }}
                          onClick={() => setSelectedSymbol(row.symbol)}
                        >
                          <td className="fw-bold py-3 px-3" style={{ color: THEME.primary }}>{row.symbol}</td>
                          <td className="small" style={{color: '#ffffff'}}>{row.name}</td>
                          <td className="text-end fw-bold" style={{color: '#ffffff'}}>{formatPrice(row.close)}</td>
                          <td className="text-end fw-medium" style={{ color: movementColor(row.priceChange) }}>
                            {formatChange(row.priceChange)}
                          </td>
                          <td className="text-end fw-medium" style={{ color: movementColor(row.changePercent) }}>
                            {formatPercent(row.changePercent)}
                          </td>
                          <td className="small px-3" style={{ color: THEME.muted }}>{row.latestDate ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="col-xl-4">
                {selected ? (
                  <div className="p-4 rounded border" style={{ borderColor: THEME.border, backgroundColor: 'rgba(255,255,255,0.03)' }}>
                    <div className="d-flex align-items-start justify-content-between mb-4">
                      <div>
                        <div className="h4 mb-0 fw-bold" style={{ color: THEME.primary }}>{selected.symbol}</div>
                        <div className="small" style={{ color: THEME.muted }}>{selected.name}</div>
                      </div>
                      <span 
                        className="badge rounded-1" 
                        style={{ 
                          backgroundColor: `${movementColor(selected.priceChange)}15`, 
                          color: movementColor(selected.priceChange),
                          border: `1px solid ${movementColor(selected.priceChange)}`,
                          fontSize: '0.7rem',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {selected.priceChange && selected.priceChange >= 0 ? 'BULLISH' : 'BEARISH'}
                      </span>
                    </div>

                    <div className="d-flex flex-column gap-2 small">
                      {[
                        { label: 'Market Open', value: formatPrice(selected.open) },
                        { label: 'Daily High', value: formatPrice(selected.high), color: THEME.success },
                        { label: 'Daily Low', value: formatPrice(selected.low), color: THEME.danger },
                        { label: 'Prev Close', value: formatPrice(selected.previousClose) },
                        { label: 'Volume', value: formatVolume(selected.volume) },
                        { label: 'Cached Records', value: (selected.records ?? 0).toLocaleString() },
                      ].map((item, idx) => (
                        <div key={idx} className="d-flex justify-content-between py-2 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                          <span className="detail-label">{item.label}</span>
                          <span className="detail-value fw-bold" style={{ color: item.color || THEME.text }}>{item.value}</span>
                        </div>
                      ))}
                      <div className="mt-3 p-2 rounded text-center" style={{ backgroundColor: 'rgba(0,0,0,0.1)', fontSize: '0.7rem', color: THEME.muted }}>
                        LAST SYNC: {selected.lastFetchedAt ? new Date(selected.lastFetchedAt).toLocaleString() : 'NEVER'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded border text-center" style={{ borderColor: THEME.border, color: THEME.muted }}>
                    Select an asset to view intelligence
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoredMarket