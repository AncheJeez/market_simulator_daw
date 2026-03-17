import { useEffect, useMemo, useState } from 'react'


type StoredSymbol = {
  symbol: string
  name: string
  lastFetchedAt: string | null
}

type SortKey = 'symbol' | 'name' | 'lastFetchedAt'

type SortState = {
  key: SortKey
  direction: 'asc' | 'desc'
}

function StoredMarket() {
  const [rows, setRows] = useState<StoredSymbol[]>([])
  const [sort, setSort] = useState<SortState>({ key: 'symbol', direction: 'asc' })

  useEffect(() => {
    const load = async () => {
      const response = await fetch('http://localhost:8080/api/market/stored', {
        credentials: 'include',
      })
      if (response.ok) {
        const data: StoredSymbol[] = await response.json()
        setRows(data)
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
      return '?'
    }
    return sort.direction === 'asc' ? '?' : '?'
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-10">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h1 className="h3 mb-3">Stored Symbols</h1>
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th role="button" onClick={() => toggleSort('symbol')}>
                      Symbol {renderArrow('symbol')}
                    </th>
                    <th role="button" onClick={() => toggleSort('name')}>
                      Name {renderArrow('name')}
                    </th>
                    <th role="button" onClick={() => toggleSort('lastFetchedAt')}>
                      Last Fetched {renderArrow('lastFetchedAt')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((row) => (
                    <tr key={row.symbol}>
                      <td className="fw-semibold">{row.symbol}</td>
                      <td>{row.name}</td>
                      <td>{row.lastFetchedAt ? new Date(row.lastFetchedAt).toLocaleString() : '�'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoredMarket
