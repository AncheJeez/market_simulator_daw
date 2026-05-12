import React, { useEffect, useState } from 'react';
import { apiUrl } from '../utils/api';

type SellRow = { id: number; symbol: string; price?: number | null; quantity?: number | null; proceeds?: number | null; createdAt?: string };

function Portfolio() {
  const [rows, setRows] = useState<SellRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(apiUrl('/api/orders/sell-history'), { credentials: 'include' });
      if (!res.ok) { setError('Failed to load'); setRows([]); return }
      const list: SellRow[] = await res.json();
      setRows(list);
    } catch (e) { setError(String(e)); }
    finally { setLoading(false); }
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#0f172a', minHeight: '80vh' }}>
      <div className="row justify-content-center">
        <div className="col-11">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="text-white">Portfolio (Sell history)</h3>
            <p className="small text-muted mb-0">All sells made by the user. Read-only.</p>
          </div>

          <div className="card p-0" style={{ backgroundColor: '#1a2949' }}>
            <div className="table-responsive">
              <table className="table mb-0 table-hover" style={{ color: '#eaecef' }}>
                <thead>
                  <tr className="small text-muted">
                    <th>SYMBOL</th>
                    <th className="text-end">PRICE</th>
                    <th className="text-end">QUANTITY</th>
                    <th className="text-end">PROCEEDS</th>
                    <th className="text-end">CREATED</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="text-center small text-muted py-4">Loading...</td></tr>
                  ) : rows.length === 0 ? (
                    <tr><td colSpan={5} className="text-center small text-muted py-4">No sells yet.</td></tr>
                  ) : (
                    rows.map(r => (
                      <tr key={r.id}>
                        <td className="fw-bold">{r.symbol}</td>
                        <td className="text-end">{r.price == null ? '-' : `$${Number(r.price).toFixed(2)}`}</td>
                        <td className="text-end">{r.quantity == null ? '-' : Number(r.quantity).toFixed(6)}</td>
                        <td className="text-end">{r.proceeds == null ? '-' : `$${Number(r.proceeds).toLocaleString()}`}</td>
                        <td className="text-end small text-muted">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</td>
                      </tr>
                    ))
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

export default Portfolio;
