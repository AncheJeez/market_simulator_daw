import { useEffect, useMemo, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { apiUrl } from '../utils/api'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

type SymbolItem = {
  id: number
  ticker: string
  name: string
}

type DataRow = {
  symbol: string
  name: string
  latestDate: string
  open: string
  high: string
  low: string
  close: string
  volume: string
  cached?: boolean
  fetchedAt?: string | null
}

type SeriesRow = {
  symbol: string
  name: string
  points: MarketPoint[]
  cached?: boolean
  fetchedAt?: string | null
}

type MarketPoint = {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

const COLORS = ['#0d6efd', '#198754', '#dc3545', '#6f42c1', '#fd7e14', '#20c997', '#0dcaf0', '#6c757d']
const HISTORY_OPTIONS = [10, 30, 60, 90]

function formatPrice(value: number) {
  return value.toFixed(2)
}

function formatVolume(value: number) {
  return Math.round(value).toLocaleString('en-US')
}

function createDataRowsFromSeries(rows: SeriesRow[]): DataRow[] {
  return rows.filter((row) => row.points.length > 0).map((row) => {
    const latest = row.points[row.points.length - 1]

    return {
      symbol: row.symbol,
      name: row.name,
      latestDate: latest.date,
      open: formatPrice(latest.open),
      high: formatPrice(latest.high),
      low: formatPrice(latest.low),
      close: formatPrice(latest.close),
      volume: formatVolume(latest.volume),
      cached: row.cached,
      fetchedAt: row.fetchedAt,
    }
  })
}

function Simulations() {
  const [symbols, setSymbols] = useState<SymbolItem[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<DataRow[]>([])
  const [series, setSeries] = useState<SeriesRow[]>([])
  const [historyDays, setHistoryDays] = useState(30)

  useEffect(() => {
    const loadSymbols = async () => {
      try {
        const response = await fetch(apiUrl('/api/symbols'), {
          credentials: 'include',
        })
        if (!response.ok) {
          setError('Failed to load symbols.')
          return
        }
        const list: SymbolItem[] = await response.json()
        setSymbols(list)
      } catch (err) {
        setError('Failed to load symbols.')
      }
    }

    loadSymbols()
  }, [])

  const toggleSymbol = (ticker: string) => {
    setSelected((prev) =>
      prev.includes(ticker) ? prev.filter((item) => item !== ticker) : [...prev, ticker]
    )
  }

  const selectedSymbols = useMemo(
    () => symbols.filter((item) => selected.includes(item.ticker)),
    [symbols, selected],
  )

  const loadLiveData = async () => {
    setError('')
    setLoading(true)
    setData([])
    setSeries([])

    try {
      const symbolsParam = selectedSymbols.map((item) => item.ticker).join(',')
      const response = await fetch(
        apiUrl(`/api/market-data?symbols=${encodeURIComponent(
          symbolsParam,
        )}&days=${historyDays}`),
        { credentials: 'include' },
      )
      if (!response.ok) {
        setError(`Failed to load data from server. Status: ${response.status}.`)
        return
      }
      const payload: Array<{
        symbol: string
        name: string
        cached: boolean
        fetchedAt: string | null
        points: MarketPoint[]
      }> = await response.json()

      const mappedSeries: SeriesRow[] = payload.map((item) => ({
        symbol: item.symbol,
        name: item.name,
        cached: item.cached,
        fetchedAt: item.fetchedAt,
        points: item.points,
      }))
      const rowsWithData = mappedSeries.filter((item) => item.points.length > 0)

      if (!rowsWithData.length) {
        setError('Yahoo Finance returned no price history for the selected symbols.')
        return
      }

      const missingSymbols = mappedSeries
        .filter((item) => item.points.length === 0)
        .map((item) => item.symbol)
      if (missingSymbols.length) {
        setError(`No Yahoo Finance data returned for: ${missingSymbols.join(', ')}.`)
      }

      setSeries(rowsWithData)
      setData(createDataRowsFromSeries(rowsWithData))
    } catch (err) {
      setError('Failed to fetch data.')
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    setError('')

    if (!selected.length) {
      setError('Select at least one symbol.')
      return
    }

    await loadLiveData()
  }

  const slicedSeries = useMemo(() => {
    if (!series.length) {
      return []
    }
    return series.map((row) => ({
      ...row,
      points: row.points.slice(-historyDays),
    }))
  }, [series, historyDays])

  const chartData = useMemo(() => {
    if (!slicedSeries.length || !slicedSeries[0].points.length) {
      return null
    }
    const labels = Array.from(new Set(slicedSeries.flatMap((row) => row.points.map((point) => point.date)))).sort()
    const datasets = slicedSeries.map((row, index) => ({
      label: row.symbol,
      data: labels.map((label) => row.points.find((point) => point.date === label)?.close ?? null),
      borderColor: COLORS[index % COLORS.length],
      backgroundColor: COLORS[index % COLORS.length],
      tension: 0.3,
      spanGaps: true,
    }))

    return { labels, datasets }
  }, [slicedSeries])

  const handleHistoryChange = (value: number) => {
    setHistoryDays(value)
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-11">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h1 className="h3 mb-3">Simulations</h1>
            <div className="d-flex flex-wrap gap-2 mb-3">
              <span className="badge bg-secondary">
                Source: Yahoo Finance
              </span>
            </div>

            <div className="row g-4">
              <div className="col-lg-4">
                <div className="border rounded p-3 h-100">
                  <h2 className="h6 mb-3">Symbols</h2>
                  <div className="d-grid gap-2">
                    {symbols.map((item) => (
                      <label key={item.ticker} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={selected.includes(item.ticker)}
                          onChange={() => toggleSymbol(item.ticker)}
                        />
                        <span className="ms-2">
                          {item.ticker} - {item.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-lg-8">
                <div className="border rounded p-3">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h2 className="h6 mb-0">Data</h2>
                    <button className="btn btn-primary" type="button" onClick={loadData} disabled={loading}>
                      {loading ? 'Loading...' : 'Fetch Yahoo Data'}
                    </button>
                  </div>
                  {error && <div className="alert alert-danger">{error}</div>}
                  {!error && !data.length && (
                    <div className="text-muted">Select symbols and load data.</div>
                  )}
                  {data.length > 0 && (
                    <div className="table-responsive mb-4">
                      <table className="table table-sm align-middle">
                        <thead>
                          <tr>
                            <th>Symbol</th>
                            <th>Name</th>
                            <th>Date</th>
                            <th>Open</th>
                            <th>High</th>
                            <th>Low</th>
                            <th>Close</th>
                            <th>Volume</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((row) => (
                            <tr key={row.symbol}>
                              <td className="fw-semibold">{row.symbol}</td>
                              <td>{row.name}</td>
                              <td>{row.latestDate}</td>
                              <td>{row.open}</td>
                              <td>{row.high}</td>
                              <td>{row.low}</td>
                              <td>{row.close}</td>
                              <td>{row.volume}</td>
                              <td>
                                {row.cached === undefined ? (
                                  <span className="text-muted">sample</span>
                                ) : row.cached ? (
                                  <span className="text-success">cached</span>
                                ) : (
                                  <span className="text-warning">refetched</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {chartData && (
                    <div>
                      <div className="border rounded p-3" style={{ height: 360 }}>
                        <Line
                          data={chartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { position: 'bottom' },
                              title: { display: false },
                            },
                            scales: {
                              y: {
                                title: { display: true, text: 'Price (USD)' },
                                ticks: {
                                  callback: (value) => `$${value}`,
                                },
                              },
                            },
                          }}
                        />
                      </div>
                      <div className="mt-3">
                        <label className="form-label">History length</label>
                        <select
                          className="form-select"
                          value={historyDays}
                          onChange={(event) => handleHistoryChange(Number(event.target.value))}
                        >
                          {HISTORY_OPTIONS.map((value) => (
                            <option key={value} value={value}>
                              {value} days
                            </option>
                          ))}
                        </select>
                        <div className="text-muted small mt-2">
                          Changing length only slices existing data. Press load to refresh data.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Simulations
