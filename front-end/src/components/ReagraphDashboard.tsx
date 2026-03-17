import { useMemo } from 'react'
import { GraphCanvas } from 'reagraph'

type OverviewRow = {
  symbol: string
  name: string
  dataPoints: number
  latestDate: string | null
  latestClose: number | null
}

type GraphNode = {
  id: string
  label: string
  size?: number
  fill?: string
}

type GraphEdge = {
  id: string
  source: string
  target: string
  label?: string
}

type ReagraphDashboardProps = {
  rows: OverviewRow[]
}

function ReagraphDashboard({ rows }: ReagraphDashboardProps) {
  const graph = useMemo(() => {
    const rootId = 'db-root'
    const nodes: GraphNode[] = [
      { id: rootId, label: 'Database', size: 24, fill: '#0d6efd' },
    ]

    const edges: GraphEdge[] = []

    const closes = rows
      .map((row) => row.latestClose)
      .filter((value): value is number => typeof value === 'number' && !Number.isNaN(value))
    const maxClose = closes.length ? Math.max(...closes) : 1

    rows.forEach((row) => {
      const symbolNodeId = `symbol-${row.symbol}`
      const closeValue = row.latestClose ?? 0
      const scaledSize = closeValue > 0 ? 14 + (closeValue / maxClose) * 30 : 12
      nodes.push({
        id: symbolNodeId,
        label: `${row.symbol}\n$${closeValue.toFixed(2)}`,
        size: Math.min(Math.max(scaledSize, 12), 44),
      })
      edges.push({
        id: `${rootId}-${symbolNodeId}`,
        source: rootId,
        target: symbolNodeId,
        label: row.name,
      })
    })

    return { nodes, edges }
  }, [rows])

  return (
    <div
      className="border rounded p-3 mt-3"
      style={{ height: 480, overflow: 'hidden', position: 'relative' }}
    >
      <GraphCanvas
        nodes={graph.nodes}
        edges={graph.edges}
        layoutType="forceDirected2d"
        labelType="all"
        animated
      />
    </div>
  )
}

export default ReagraphDashboard
