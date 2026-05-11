import { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import Select, { MultiValue, StylesConfig } from 'react-select';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import { apiUrl } from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const THEME = {
  bg: '#0f172a',
  card: '#1a2949',
  border: '#2b3139',
  text: '#eaecef',
  muted: '#848e9c',
  primary: '#f0b90b',
  success: '#0ecb81',
  danger: '#f6465d',
};

const CHART_COLORS = ['#f0b90b', '#0ecb81', '#4788ff', '#9c52fd', '#ff6611'];
const HISTORY_OPTIONS = [10, 30, 60, 90];

interface Option {
  value: string;
  label: string;
}

interface SymbolItem {
  id: number;
  ticker: string;
  name: string;
}

interface MarketPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface SeriesRow {
  symbol: string;
  name: string;
  points: MarketPoint[];
  cached?: boolean;
  fetchedAt?: string | null;
}

interface DataRow {
  symbol: string;
  name: string;
  latestDate: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  cached?: boolean;
  fetchedAt?: string | null;
}

const customSelectStyles: StylesConfig<Option, true> = {
  control: (base) => ({
    ...base,
    backgroundColor: THEME.card,
    borderColor: THEME.border,
    color: THEME.text,
    minHeight: '38px',
    '&:hover': { borderColor: THEME.primary }
  }),
  menu: (base) => ({ 
    ...base, 
    backgroundColor: THEME.card, 
    border: `1px solid ${THEME.border}`,
    zIndex: 9999 
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? THEME.border : 'transparent',
    color: THEME.text,
    '&:active': { backgroundColor: THEME.primary }
  }),
  multiValue: (base) => ({ 
    ...base, 
    backgroundColor: THEME.border,
    borderRadius: '4px' 
  }),
  multiValueLabel: (base) => ({ ...base, color: THEME.text }),
  multiValueRemove: (base) => ({
    ...base,
    color: THEME.muted,
    '&:hover': { backgroundColor: THEME.danger, color: 'white' }
  }),
  input: (base) => ({ ...base, color: THEME.text }),
  placeholder: (base) => ({ ...base, color: THEME.muted }),
  singleValue: (base) => ({ ...base, color: THEME.text }),
};

/**
 * HELPERS
 */
function formatPrice(value: number): string {
  return value.toFixed(2);
}

function formatVolume(value: number): string {
  return Math.round(value).toLocaleString('en-US');
}

function createDataRowsFromSeries(rows: SeriesRow[]): DataRow[] {
  return rows.filter((row) => row.points.length > 0).map((row) => {
    const latest = row.points[row.points.length - 1];
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
    };
  });
}

/**
 * COMPONENT
 */
function Simulations() {
  const [symbols, setSymbols] = useState<SymbolItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [data, setData] = useState<DataRow[]>([]);
  const [series, setSeries] = useState<SeriesRow[]>([]);
  const [historyDays, setHistoryDays] = useState<number>(30);

  useEffect(() => {
    const loadSymbols = async () => {
      try {
        const response = await fetch(apiUrl('/api/symbols'), {
          credentials: 'include',
        });
        if (!response.ok) {
          setError('Failed to connect to market symbols.');
          return;
        }
        const list: SymbolItem[] = await response.json();
        setSymbols(list);
      } catch (err) {
        setError('Market symbols unavailable.');
      }
    };
    loadSymbols();
  }, []);

  const loadData = async () => {
    if (!selected.length) {
      setError('Select at least one ticker to simulate.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const symbolsParam = selected.join(',');
      const response = await fetch(
        apiUrl(`/api/market-data?symbols=${encodeURIComponent(symbolsParam)}&days=${historyDays}`),
        { credentials: 'include' }
      );
      
      if (!response.ok) {
        setError(`Data sync failed. Status: ${response.status}`);
        return;
      }

      const payload: SeriesRow[] = await response.json();
      const validRows = payload.filter((item) => item.points.length > 0);

      if (validRows.length === 0) {
        setError('No historical data found for selection.');
        return;
      }

      setSeries(validRows);
      setData(createDataRowsFromSeries(validRows));
    } catch (err) {
      setError('Market data stream interrupted.');
    } finally {
      setLoading(false);
    }
  };

  const symbolOptions: Option[] = useMemo(() => 
    symbols.map(item => ({
      value: item.ticker,
      label: `${item.ticker} - ${item.name}`
    })), [symbols]
  );

  const chartData: ChartData<'line'> | null = useMemo(() => {
    if (!series.length) return null;

    const allDates = Array.from(
      new Set(series.flatMap((s) => s.points.map((p) => p.date)))
    ).sort();

    return {
      labels: allDates,
      datasets: series.map((s, i) => ({
        label: s.symbol,
        data: allDates.map((d) => s.points.find((p) => p.date === d)?.close ?? null),
        borderColor: CHART_COLORS[i % CHART_COLORS.length],
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return undefined;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, CHART_COLORS[i % CHART_COLORS.length] + '44');
          gradient.addColorStop(1, 'transparent');
          return gradient;
        },
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 2,
      }))
    };
  }, [series]);

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: THEME.muted, boxWidth: 10, font: { size: 12, weight: 'bold' } }
      },
      tooltip: {
        backgroundColor: THEME.card,
        titleColor: THEME.primary,
        bodyColor: THEME.text,
        borderColor: THEME.border,
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
      }
    },
    scales: {
      y: {
        grid: { color: THEME.border },
        ticks: { 
          color: THEME.muted,
          callback: (value: string | number) => `$${value}`
        }
      },
      x: {
        grid: { display: false },
        ticks: { color: THEME.muted, maxRotation: 0 }
      }
    }
  };

  return (
    <div className="container-fluid min-vh-100 py-4" style={{ backgroundColor: THEME.bg, color: THEME.text }}>
      <div className="row g-4 justify-content-center">
        <div className="col-11 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom pb-3 mb-2" style={{ borderColor: THEME.border }}>
          <div>
            <h1 className="h4 fw-bold mb-0 text-uppercase tracking-tight">Terminal <span style={{ color: THEME.primary }}>Simulations</span></h1>
            <p className="small mb-0" style={{ color: THEME.muted }}>PROPRIETARY TRADING ENGINE v2.6</p>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0">
            <div 
              className="d-flex align-items-center px-2 rounded border" 
              style={{ 
                borderColor: THEME.border, 
                backgroundColor: THEME.card,
                cursor: 'pointer'
              }}
            >
              <span className="small fw-bold ms-1" style={{ color: THEME.muted, whiteSpace: 'nowrap' }}>
                RANGE
              </span>
              <select
                className="form-select form-select-sm border-0 bg-transparent text-white custom-select-yellow-arrow"
                value={historyDays}
                onChange={(e) => setHistoryDays(Number(e.target.value))}
                style={{ 
                  width: 'auto', 
                  minWidth: '110px',
                  boxShadow: 'none',
                  paddingLeft: '8px',
                  cursor: 'pointer'
                }}
              >
                {HISTORY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} style={{ backgroundColor: THEME.card, color: '#fff' }}>
                    {opt} Days
                  </option>
                ))}
              </select>

              <style>
                {`
                  /* Custom yellow arrow for the select */
                  .custom-select-yellow-arrow {
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23f0b90b' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e") !important;
                    background-size: 12px 12px;
                  }

                  /* Ensure the select options don't look weird on different browsers */
                  select option {
                    background: ${THEME.card};
                    color: white;
                  }
                `}
              </style>
            </div>
            <button 
              className="btn btn-sm fw-bold px-4 shadow-sm" 
              style={{ backgroundColor: THEME.primary, color: '#000' }}
              onClick={loadData}
              disabled={loading}
            >
              {loading ? 'SYNCING...' : 'REFRESH ENGINE'}
            </button>
          </div>
        </div>

        {/* SIDEBAR: SELECTION */}
        <div className="col-11 col-lg-3">
          <div className="card border-0 shadow-sm" style={{ backgroundColor: THEME.card }}>
            <div className="card-body p-3">
              <label className="form-label small fw-bold text-uppercase mb-3" style={{ color: THEME.muted }}>Asset Intelligence</label>
              <Select
                isMulti
                options={symbolOptions}
                styles={customSelectStyles}
                placeholder="Find Tickers..."
                onChange={(newValue: MultiValue<Option>) => {
                  setSelected(newValue ? newValue.map(opt => opt.value) : []);
                }}
              />
              <div className="mt-4">
                <div className="p-3 rounded border" style={{ borderColor: THEME.border, backgroundColor: THEME.bg }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small text-white">Network</span>
                    <span className="small text-success fw-bold">ONLINE</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="small text-white">Precision</span>
                    <span className="small text-white">64-BIT</span>
                  </div>
                </div>
                {error && <div className="alert alert-danger p-2 mt-3 small border-0 bg-danger bg-opacity-25 text-danger">{error}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN VIEW: CHART & TABLE */}
        <div className="col-11 col-lg-8">
          <div className="card border-0 shadow-sm mb-4" style={{ backgroundColor: THEME.card }}>
            <div className="card-body p-3" style={{ height: '400px' }}>
              {chartData ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center opacity-50">
                  <h6 style={{ color: THEME.muted }}>AWAITING SYMBOL INITIALIZATION</h6>
                  <p className="small text-muted">Select assets from the sidebar to visualize market trajectory.</p>
                </div>
              )}
            </div>
          </div>

          {data.length > 0 && (
            <div className="card border-0 shadow-lg overflow-hidden" style={{ backgroundColor: THEME.card }}>
              <div className="table-responsive">
                <table className="table table-hover mb-0" style={{ fontSize: '0.85rem', color: THEME.text }}>
                  <thead style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    <tr>
                      <th className="px-3 border-0 py-3 fw-normal" style={{ color: THEME.muted }}>SYMBOL</th>
                      <th className="border-0 py-3 text-end fw-normal" style={{ color: THEME.muted }}>OPEN</th>
                      <th className="border-0 py-3 text-end fw-normal" style={{ color: THEME.muted }}>HIGH</th>
                      <th className="border-0 py-3 text-end fw-normal" style={{ color: THEME.muted }}>LOW</th>
                      <th className="border-0 py-3 text-end fw-normal" style={{ color: THEME.muted }}>CLOSE</th>
                      <th className="border-0 py-3 text-end fw-normal" style={{ color: THEME.muted }}>VOL (24H)</th>
                      <th className="border-0 py-3 text-center fw-normal" style={{ color: THEME.muted }}>SOURCE</th>
                    </tr>
                  </thead>
                  <tbody style={{ borderTop: 'none' }}>
                    {data.map((row) => (
                      <tr 
                        key={row.symbol} 
                        style={{ 
                          borderBottom: `1px solid ${THEME.border}`,
                          transition: 'background-color 0.2s ease'
                        }}
                        className="align-middle"
                      >
                        <td className="px-3 py-3 fw-bold" style={{ color: THEME.primary }}>{row.symbol}</td>
                        <td className="text-end py-3" style={{ color: THEME.text }}>${row.open}</td>
                        <td className="text-end py-3" style={{ color: THEME.success }}>${row.high}</td>
                        <td className="text-end py-3" style={{ color: THEME.danger }}>${row.low}</td>
                        <td className="text-end py-3 fw-bold" style={{ color: THEME.text }}>${row.close}</td>
                        <td className="text-end py-3" style={{ color: THEME.muted }}>{row.volume}</td>
                        <td className="text-center py-3">
                          <span 
                            className="badge rounded-1" 
                            style={{ 
                              fontSize: '0.65rem', 
                              padding: '0.4em 0.6em',
                              backgroundColor: row.cached ? 'rgba(132, 142, 156, 0.1)' : `rgba(14, 203, 129, 0.15)`,
                              border: `1px solid ${row.cached ? THEME.border : THEME.success}`,
                              color: row.cached ? THEME.muted : THEME.success
                            }}
                          >
                            {row.cached ? 'DB_CACHE' : 'YAHOO_LIVE'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <style>
                {`
                  .table-hover tbody tr:hover {
                    background-color: #253a66 !important;
                    color: white !important;
                  }
                  .table {
                    --bs-table-bg: transparent;
                    --bs-table-accent-bg: transparent;
                  }
                `}
              </style>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Simulations;