import React, { useEffect, useState } from 'react';
import { apiUrl } from '../utils/api';

interface SymbolItem { id: number; ticker: string; name: string }
interface OrderPreview { symbol: string; price: number; investAmount: number; quantity: number }
interface OrderRow { id: number; symbol: string; status: string; orderType: string; price?: number | null; quantity?: number | null; timeInForce?: string | null; createdAt?: string }

function OrdersView() {
  const [symbols, setSymbols] = useState<SymbolItem[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [invest, setInvest] = useState<string>('');
  const [preview, setPreview] = useState<OrderPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<string>('Market');
  const [timeInForce, setTimeInForce] = useState<string>('GTC');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(apiUrl('/api/symbols'), { credentials: 'include' });
        if (!res.ok) return;
        const list = await res.json();
        setSymbols(list);
        if (list.length) setSelected(list[0].ticker);
      } catch (e) {
        console.error(e);
      }
    };
    load();
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await fetch(apiUrl('/api/orders'), { credentials: 'include' });
      if (!res.ok) return;
      const list = await res.json();
      setOrders(list);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePreview = async () => {
    setError(null);
    if (!selected) { setError('Select a symbol'); return }
    const investAmount = parseInt(invest || '0', 10);
    setLoadingPreview(true);
    try {
      const res = await fetch(apiUrl('/api/orders/preview'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ symbol: selected, investAmount })
      });
      if (!res.ok) {
        let bodyText = '';
        try {
          const json = await res.json();
          bodyText = json?.message || JSON.stringify(json);
        } catch (e) {
          try { bodyText = await res.text(); } catch (e2) { bodyText = res.statusText }
        }
        setError(bodyText || `Preview failed: ${res.status}`);
        setPreview(null);
        return;
      }
      const p = await res.json();
      setPreview(p);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoadingPreview(false);
    }
  };

  const handlePlace = async () => {
    setError(null);
    if (!selected) { setError('Select a symbol'); return }
    const investAmount = parseInt(invest || '0', 10);
    if (investAmount <= 0) { setError('Invest amount must be > 0'); return }
    setPlacing(true);
    try {
      const payload = { symbol: selected, investAmount, orderType, timeInForce };
      const res = await fetch(apiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.message || 'Place order failed');
        return;
      }
      await loadOrders();
      setPreview(null);
      setInvest('');
    } catch (e) {
      setError('Place order failed');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#0f172a', minHeight: '80vh' }}>
      <div className="row justify-content-center">
        <div className="col-11">
          <h3 className="text-white">Create Order</h3>
          <div className="card p-3 mb-3" style={{ backgroundColor: '#1a2949' }}>
            <div className="row g-2 align-items-end">
              <div className="col-12 col-md-4">
                <label className="form-label small text-white">Symbol</label>
                <select className="form-select" value={selected} onChange={e => setSelected(e.target.value)}>
                  {symbols.map((s: SymbolItem) => (<option key={s.ticker} value={s.ticker}>{s.ticker} - {s.name}</option>))}
                </select>
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label small text-white">Invest Amount</label>
                <input className="form-control" value={invest} onChange={e => setInvest(e.target.value)} placeholder="Amount in your currency" />
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label small text-white">Order Type</label>
                <select className="form-select" value={orderType} onChange={e => setOrderType(e.target.value)}>
                  <option>Market</option>
                  <option>Limit</option>
                  <option>Stop-Loss</option>
                  <option>Take-Profit</option>
                </select>
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label small text-white">Time-in-Force</label>
                <select className="form-select" value={timeInForce} onChange={e => setTimeInForce(e.target.value)}>
                  <option>GTC</option>
                  <option>IOC</option>
                </select>
              </div>
              <div className="col-12 col-md-1 d-grid">
                <button className="btn btn-sm btn-primary" onClick={handlePreview} disabled={loadingPreview}>{loadingPreview ? '...' : 'Preview'}</button>
              </div>
            </div>
            {error && <div className="mt-2 text-danger small">{error}</div>}
            {preview && (
              <div className="mt-3 p-2 rounded" style={{ background: '#0f172a' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="small text-white">Price</div>
                    <div className="fw-bold text-white">${preview.price.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="small text-white">Quantity</div>
                    <div className="fw-bold text-white">{preview.quantity.toFixed(6)}</div>
                  </div>
                  <div>
                    <div className="small text-white">Invest</div>
                    <div className="fw-bold text-white">{preview.investAmount.toLocaleString()}</div>
                  </div>
                  <div>
                    <button className="btn btn-sm btn-success" onClick={handlePlace} disabled={placing}>{placing ? 'Placing...' : 'Place Order'}</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <h4 className="text-white">Your Orders</h4>
          <div className="card p-0" style={{ backgroundColor: '#1a2949' }}>
            <div className="table-responsive">
              <table className="table mb-0 table-hover" style={{ color: '#eaecef' }}>
                <thead>
                  <tr className="small text-muted">
                    <th>SYMBOL</th>
                    <th>TYPE</th>
                    <th className="text-end">PRICE</th>
                    <th className="text-end">QUANTITY</th>
                    <th className="text-end">STATUS</th>
                    <th className="text-end">CREATED</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={6} className="text-center small text-muted py-4">No orders placed.</td></tr>
                  ) : (
                    orders.map(o => (
                      <tr key={o.id}>
                        <td className="fw-bold">{o.symbol}</td>
                        <td>{o.orderType}</td>
                        <td className="text-end">{o.price == null ? 'MKT' : `$${Number(o.price).toFixed(2)}`}</td>
                        <td className="text-end">{o.quantity == null ? '-' : Number(o.quantity).toFixed(6)}</td>
                        <td className="text-end">{o.status}</td>
                        <td className="text-end">{o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrdersView;
