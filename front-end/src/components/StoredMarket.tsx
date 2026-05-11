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
  if (value === null || value === undefined) {
    return '-'
  }
  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}$${Math.abs(value).toFixed(2)}`
}

function formatVolume(value: number | null | undefined) {
  return value === null || value === undefined ? '-' : Math.round(value).toLocaleString('en-US')
}

function movementClass(value: number | null | undefined) {
  if (value === null || value === undefined || value === 0) {
    return 'text-muted'
  }
  return value > 0 ? 'text-success' : 'text-danger'
}

function movementBadge(value: number | null | undefined) {
  if (value === null || value === undefined || value === 0) {
    return { label: 'Flat', className: 'bg-secondary' }
  }
  return value > 0
    ? { label: 'Raised', className: 'bg-success' }
    : { label: 'Lowered', className: 'bg-danger' }
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
    setSort((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  const renderArrow = (key: SortKey) => {
    if (sort.key !== key) {
      return ''
    }
    return sort.direction === 'asc' ? ' ^' : ' v'
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-11">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
              <div>
                <h1 className="h3 mb-1">Stored Stocks</h1>
                <div className="text-muted small">{rows.length} stocks with cached market data</div>
              </div>
              {selected && (
                <div className={`text-end ${movementClass(selected.priceChange)}`}>
                  <div className="fs-4 fw-semibold">{formatPrice(selected.close)}</div>
                  <div className="small">
                    {formatChange(selected.priceChange)} ({formatPercent(selected.changePercent)})
                  </div>
                </div>
              )}
            </div>

            <div className="row g-3">
              <div className="col-xl-8">
                <div className="table-responsive">
                  <table className="table table-sm table-hover align-middle">
                    <thead>
                      <tr>
                        <th role="button" onClick={() => toggleSort('symbol')}>
                          Stock {renderArrow('symbol')}
                        </th>
                        <th role="button" onClick={() => toggleSort('name')}>
                          Name {renderArrow('name')}
                        </th>
                        <th role="button" className="text-end" onClick={() => toggleSort('close')}>
                          Close {renderArrow('close')}
                        </th>
                        <th role="button" className="text-end" onClick={() => toggleSort('priceChange')}>
                          Change {renderArrow('priceChange')}
                        </th>
                        <th role="button" className="text-end" onClick={() => toggleSort('changePercent')}>
                          Change % {renderArrow('changePercent')}
                        </th>
                        <th role="button" onClick={() => toggleSort('latestDate')}>
                          Date {renderArrow('latestDate')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((row) => (
                        <tr
                          key={row.symbol}
                          role="button"
                          className={selected?.symbol === row.symbol ? 'table-active' : ''}
                          onClick={() => setSelectedSymbol(row.symbol)}
                        >
                          <td className="fw-semibold">{row.symbol}</td>
                          <td>{row.name}</td>
                          <td className={`text-end fw-semibold ${movementClass(row.priceChange)}`}>
                            {formatPrice(row.close)}
                          </td>
                          <td className={`text-end ${movementClass(row.priceChange)}`}>
                            {formatChange(row.priceChange)}
                          </td>
                          <td className={`text-end ${movementClass(row.changePercent)}`}>
                            {formatPercent(row.changePercent)}
                          </td>
                          <td>{row.latestDate ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="col-xl-4">
                {selected ? (
                  <div className="border rounded p-3 h-100">
                    <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                      <div>
                        <div className="h4 mb-0">{selected.symbol}</div>
                        <div className="text-muted">{selected.name}</div>
                      </div>
                      <span className={`badge ${movementBadge(selected.priceChange).className}`}>
                        {movementBadge(selected.priceChange).label}
                      </span>
                    </div>

                    <dl className="row mb-0 small">
                      <dt className="col-6 text-muted">Latest date</dt>
                      <dd className="col-6 text-end">{selected.latestDate ?? '-'}</dd>
                      <dt className="col-6 text-muted">Open</dt>
                      <dd className="col-6 text-end">{formatPrice(selected.open)}</dd>
                      <dt className="col-6 text-muted">High</dt>
                      <dd className="col-6 text-end text-success">{formatPrice(selected.high)}</dd>
                      <dt className="col-6 text-muted">Low</dt>
                      <dd className="col-6 text-end text-danger">{formatPrice(selected.low)}</dd>
                      <dt className="col-6 text-muted">Close</dt>
                      <dd className={`col-6 text-end fw-semibold ${movementClass(selected.priceChange)}`}>
                        {formatPrice(selected.close)}
                      </dd>
                      <dt className="col-6 text-muted">Previous close</dt>
                      <dd className="col-6 text-end">{formatPrice(selected.previousClose)}</dd>
                      <dt className="col-6 text-muted">Daily change</dt>
                      <dd className={`col-6 text-end ${movementClass(selected.priceChange)}`}>
                        {formatChange(selected.priceChange)}
                      </dd>
                      <dt className="col-6 text-muted">Daily change %</dt>
                      <dd className={`col-6 text-end ${movementClass(selected.changePercent)}`}>
                        {formatPercent(selected.changePercent)}
                      </dd>
                      <dt className="col-6 text-muted">Volume</dt>
                      <dd className="col-6 text-end">{formatVolume(selected.volume)}</dd>
                      <dt className="col-6 text-muted">Stored records</dt>
                      <dd className="col-6 text-end">
                        {(selected.records ?? 0).toLocaleString('en-US')}
                      </dd>
                      <dt className="col-6 text-muted">Last fetched</dt>
                      <dd className="col-6 text-end">
                        {selected.lastFetchedAt ? new Date(selected.lastFetchedAt).toLocaleString() : '-'}
                      </dd>
                    </dl>
                  </div>
                ) : (
                  <div className="border rounded p-3 text-muted">No stored stocks found.</div>
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
