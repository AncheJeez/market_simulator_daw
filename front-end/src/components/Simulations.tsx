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
import {
  getAlphaVantageEnabled,
  getAlphaVantageKey,
  getDailyQuota,
  getQuotaRemaining,
  decrementQuota,
} from '../utils/settings'

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
  points: { date: string; close: number }[]
  cached?: boolean
  fetchedAt?: string | null
}

type ScenarioKey = 'normal' | 'bull' | 'bear' | 'crash2008' | 'covid2020' | 'sideways' | 'volatile'

const COLORS = ['#0d6efd', '#198754', '#dc3545', '#6f42c1', '#fd7e14', '#20c997', '#0dcaf0', '#6c757d']
const HISTORY_OPTIONS = [10, 30, 60, 90]
const MAX_SAMPLE_DAYS = 90
const SCENARIOS: { key: ScenarioKey; label: string }[] = [
  { key: 'normal', label: 'Normal market' },
  { key: 'bull', label: 'Bull run' },
  { key: 'bear', label: 'Bear market' },
  { key: 'crash2008', label: '2008 crash' },
  { key: 'covid2020', label: '2020 COVID shock' },
  { key: 'sideways', label: 'Sideways' },
  { key: 'volatile', label: 'High volatility' },
]

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function formatPrice(value: number) {
  return value.toFixed(2)
}

function formatVolume(value: number) {
  return Math.round(value).toLocaleString('en-US')
}

function getRecentDates(count: number) {
  const dates: string[] = []
  const current = new Date()
  for (let i = 0; i < count; i += 1) {
    const d = new Date(current)
    d.setDate(current.getDate() - i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates.reverse()
}

function applyScenarioStep(current: number, index: number, total: number, scenario: ScenarioKey) {
  const progress = index / Math.max(total - 1, 1)

  switch (scenario) {
    case 'bull':
      return current + randomBetween(0.2, 1.5)
    case 'bear':
      return current - randomBetween(0.2, 1.2)
    case 'sideways':
      return current + randomBetween(-0.6, 0.6)
    case 'volatile':
      return current + randomBetween(-3.5, 3.5)
    case 'crash2008': {
      if (progress < 0.35) {
        return current + randomBetween(0.1, 1.0)
      }
      if (progress < 0.6) {
        return current - randomBetween(2.5, 6.5)
      }
      return current + randomBetween(0.2, 1.8)
    }
    case 'covid2020': {
      if (progress < 0.25) {
        return current + randomBetween(0.1, 0.9)
      }
      if (progress < 0.45) {
        return current - randomBetween(3.0, 7.0)
      }
      return current + randomBetween(0.5, 2.5)
    }
    case 'normal':
    default:
      return current + randomBetween(-1.2, 1.2)
  }
}

function createScenarioSeries(item: SymbolItem, days: number, scenario: ScenarioKey): SeriesRow {
  const base = randomBetween(50, 500)
  let current = base
  const dates = getRecentDates(days)
  const points = dates.map((date, index) => {
    current = applyScenarioStep(current, index, dates.length, scenario)
    return { date, close: Number(formatPrice(Math.max(current, 1))) }
  })
  return { symbol: item.ticker, name: item.name, points }
}

function createDataRowsFromSeries(rows: SeriesRow[]): DataRow[] {
  return rows.map((row) => {
    const latest = row.points[row.points.length - 1]
    const open = latest.close + randomBetween(-2, 2)
    const high = Math.max(open, latest.close) + randomBetween(0.5, 4)
    const low = Math.min(open, latest.close) - randomBetween(0.5, 4)
    const volume = randomBetween(500000, 12000000)

    return {
      symbol: row.symbol,
      name: row.name,
      latestDate: latest.date,
      open: formatPrice(open),
      high: formatPrice(high),
      low: formatPrice(low),
      close: formatPrice(latest.close),
      volume: formatVolume(volume),
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
  const [sampleScenario, setSampleScenario] = useState<ScenarioKey>('normal')
  const [quotaRemaining, setQuotaRemaining] = useState(getQuotaRemaining())

  const apiKey = getAlphaVantageKey()
  const apiEnabled = getAlphaVantageEnabled()

  useEffect(() => {
    setQuotaRemaining(getQuotaRemaining())
  }, [apiEnabled])

  useEffect(() => {
    const loadSymbols = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/symbols', {
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

  const loadSampleData = () => {
    const mockSeries = selectedSymbols.map((item) =>
      createScenarioSeries(item, MAX_SAMPLE_DAYS, sampleScenario),
    )
    setSeries(mockSeries)
    setData(createDataRowsFromSeries(mockSeries))
  }

  const loadLiveData = async () => {
    setError('')
    setLoading(true)
    setData([])
    setSeries([])

    if (!apiKey) {
      setError('AlphaVantage API key is missing. Add it in Settings.')
      setLoading(false)
      return
    }

    try {
      const symbolsParam = selectedSymbols.map((item) => item.ticker).join(',')
      const response = await fetch(
        `http://localhost:8080/api/market-data?symbols=${encodeURIComponent(
          symbolsParam,
        )}&days=${historyDays}&apiKey=${encodeURIComponent(apiKey)}`,
        { credentials: 'include' },
      )
      if (!response.ok) {
        setError('Failed to load data from server.')
        return
      }
      const payload: Array<{
        symbol: string
        name: string
        cached: boolean
        fetchedAt: string | null
        points: { date: string; open: number; high: number; low: number; close: number; volume: number }[]
      }> = await response.json()

      const mappedSeries: SeriesRow[] = payload.map((item) => ({
        symbol: item.symbol,
        name: item.name,
        cached: item.cached,
        fetchedAt: item.fetchedAt,
        points: item.points.map((p) => ({ date: p.date, close: p.close })),
      }))

      const refetchedCount = payload.filter((item) => !item.cached).length
      if (refetchedCount > 0) {
        const remaining = decrementQuota(refetchedCount)
        setQuotaRemaining(remaining)
      }

      setSeries(mappedSeries)
      setData(createDataRowsFromSeries(mappedSeries))
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

    if (!apiEnabled) {
      loadSampleData()
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
    const labels = slicedSeries[0].points.map((point) => point.date)
    const datasets = slicedSeries.map((row, index) => ({
      label: row.symbol,
      data: row.points.map((point) => point.close),
      borderColor: COLORS[index % COLORS.length],
      backgroundColor: COLORS[index % COLORS.length],
      tension: 0.3,
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
                API: {apiEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <span className="badge bg-light text-dark">
                API Key: {apiKey ? 'Set' : 'Not set'}
              </span>
              {apiEnabled && (
                <span className="badge bg-warning text-dark">
                  Remaining daily fetches: {quotaRemaining} / {getDailyQuota()}
                </span>
              )}
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
                      {loading ? 'Loading...' : apiEnabled ? 'Fetch Live Data' : 'Load Sample Data'}
                    </button>
                  </div>
                  {!apiEnabled && (
                    <div className="mb-3">
                      <label className="form-label">Sample data scenario</label>
                      <select
                        className="form-select"
                        value={sampleScenario}
                        onChange={(event) => setSampleScenario(event.target.value as ScenarioKey)}
                      >
                        {SCENARIOS.map((scenario) => (
                          <option key={scenario.key} value={scenario.key}>
                            {scenario.label}
                          </option>
                        ))}
                      </select>
                      <div className="text-muted small mt-2">
                        Changing scenario only affects the next sample load.
                      </div>
                    </div>
                  )}
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
