import React, { useEffect, useState } from 'react';
import { apiUrl } from '../utils/api';

const THEME = {
  card: '#1a2949',
  border: '#2b3139',
  text: '#eaecef',
  muted: '#848e9c',
  primary: '#f0b90b',
  success: '#0ecb81',
  danger: '#f6465d',
};


interface OrderRow { id: number; symbol: string; status: string; orderType: string; price?: number | null; quantity?: number | null; timeInForce?: string | null; createdAt?: string }

type Position = {
  id: string;
  symbol: string;
  side: 'Long' | 'Short';
  entryPrice: number;
  currentPrice: number;
  size: number;
  liquidationPrice?: number | null;
};

function Positions() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/orders'), { credentials: 'include' });
      if (!res.ok) { setError('Failed to load orders'); setOrders([]); return }
      const list: OrderRow[] = await res.json();
      const open = list.filter(o => o.status === 'FILLED');
      setOrders(open);
      const symbols = Array.from(new Set(open.map(o => o.symbol))).slice(0, 50);
      if (symbols.length) {
        const md = await fetch(apiUrl('/api/market-data?symbols=' + symbols.join(',') + '&days=1'), { credentials: 'include' });
        if (md.ok) {
          const arr = await md.json();
          const map: Record<string, number> = {};
          for (const item of arr) {
            const pts = item.points || item.points || [];
            if (Array.isArray(pts) && pts.length) {
              const last = pts[pts.length - 1];
              if (last && typeof last.close === 'number') {
                map[item.symbol] = last.close;
              }
            }
          }
          setPrices(map);
        }
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const sameDay = (iso?: string) => {
    if (!iso) return false;
    try {
      const d = new Date(iso);
      const now = new Date();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    } catch { return false }
  };

  const handleSell = async (id: number) => {
    setError(null);
    try {
      const res = await fetch(apiUrl(`/api/orders/${id}/sell`), { method: 'POST', credentials: 'include' });
      if (!res.ok) {
        let body = await res.json().catch(() => ({}));
        setError(body?.message || 'Sell failed');
        return;
      }
      await load();
    } catch (e) {
      setError(String(e));
    }
  };

  function formatPnL(entry: number | undefined | null, current: number | undefined, quantity: number | undefined | null) {
    if (!entry || !current || !quantity) return '-';
    const diff = (current - entry) * quantity;
    return (diff >= 0 ? '+' : '-') + '$' + Math.abs(diff).toFixed(2);
  }

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#0f172a', minHeight: '80vh' }}>
      <div className="row justify-content-center">
        <div className="col-11">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="text-white">Positions</h3>
            <p className="small text-muted mb-0">Executed trades currently live in the market. Shows change since the order and allows selling (not on same day).</p>
          </div>

          <div className="card border-0 shadow-sm" style={{ backgroundColor: THEME.card }}>
            <div className="table-responsive">
              <table className="table table-hover mb-0" style={{ color: THEME.text }}>
                <thead>
                  <tr style={{ color: THEME.muted }}>
                    <th>SYMBOL</th>
                    <th className="text-end">ENTRY</th>
                    <th className="text-end">CURRENT</th>
                    <th className="text-end">CHANGE</th>
                    <th className="text-end">SIZE</th>
                    <th className="text-end">CREATED</th>
                    <th className="text-end">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="text-center small text-muted py-4">Loading...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan={7} className="text-center small text-muted py-4">No open positions.</td></tr>
                  ) : (
                    orders.map(o => {
                      const curr = prices[o.symbol];
                      const created = o.createdAt ? new Date(o.createdAt).toLocaleString() : '';
                      const disabled = sameDay(o.createdAt);
                      return (
                        <tr key={o.id}>
                          <td className="fw-bold">{o.symbol}</td>
                          <td className="text-end">{o.price == null ? '-' : `$${Number(o.price).toFixed(2)}`}</td>
                          <td className="text-end">{curr == null ? '-' : `$${Number(curr).toFixed(2)}`}</td>
                          <td className="text-end" style={{ color: (o.price && curr && (curr - (o.price||0)) * (o.quantity||0) > 0) ? THEME.success : THEME.danger }}>{formatPnL(o.price, curr, o.quantity)}</td>
                          <td className="text-end">{o.quantity == null ? '-' : Number(o.quantity).toFixed(6)}</td>
                          <td className="text-end small text-muted">{created}</td>
                          <td className="text-end">
                            <div className="d-flex justify-content-end gap-2">
                              <button className="btn btn-sm btn-outline-light text-muted" onClick={() => handleSell(o.id)} disabled={disabled || o.status !== 'FILLED'}>{disabled ? 'Same day' : 'Sell'}</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {error && <div className="mt-2 text-danger small">{error}</div>}
        </div>
      </div>
    </div>
  );
}

export default Positions;
