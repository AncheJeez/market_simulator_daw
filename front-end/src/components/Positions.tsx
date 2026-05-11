import React from 'react';

const THEME = {
  card: '#1a2949',
  border: '#2b3139',
  text: '#eaecef',
  muted: '#848e9c',
  primary: '#f0b90b',
  success: '#0ecb81',
  danger: '#f6465d',
};

type Position = {
  id: string;
  symbol: string;
  side: 'Long' | 'Short';
  entryPrice: number;
  currentPrice: number;
  size: number;
  liquidationPrice?: number | null;
};

const samplePositions: Position[] = [];

function formatPnL(entry: number, current: number, size: number, side: 'Long' | 'Short') {
  const diff = side === 'Long' ? (current - entry) : (entry - current);
  return (diff * size).toFixed(2);
}

function Positions() {
  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#0f172a', minHeight: '80vh' }}>
      <div className="row justify-content-center">
        <div className="col-11">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="text-white">Positions</h3>
            <p className="small text-muted mb-0">The reality: executed trades currently live in the market.</p>
          </div>

          <div className="card border-0 shadow-sm" style={{ backgroundColor: THEME.card }}>
            <div className="table-responsive">
              <table className="table table-hover mb-0" style={{ color: THEME.text }}>
                <thead>
                  <tr style={{ color: THEME.muted }}>
                    <th>SYMBOL</th>
                    <th>SIDE</th>
                    <th className="text-end">ENTRY PRICE</th>
                    <th className="text-end">CURRENT PRICE</th>
                    <th className="text-end">UNREALIZED P&L</th>
                    <th className="text-end">LIQUIDATION</th>
                    <th className="text-end">SIZE</th>
                  </tr>
                </thead>
                <tbody>
                  {samplePositions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center small text-muted py-4">No open positions.</td>
                    </tr>
                  ) : (
                    samplePositions.map((p) => (
                      <tr key={p.id}>
                        <td className="fw-bold">{p.symbol}</td>
                        <td>{p.side}</td>
                        <td className="text-end">${p.entryPrice.toFixed(2)}</td>
                        <td className="text-end">${p.currentPrice.toFixed(2)}</td>
                        <td className="text-end">${formatPnL(p.entryPrice, p.currentPrice, p.size, p.side)}</td>
                        <td className="text-end">{p.liquidationPrice ? `$${p.liquidationPrice.toFixed(2)}` : '-'}</td>
                        <td className="text-end">{p.size}</td>
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

export default Positions;
