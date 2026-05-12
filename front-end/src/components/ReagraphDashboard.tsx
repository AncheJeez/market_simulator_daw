import { useMemo } from 'react'
import { GraphCanvas, darkTheme } from 'reagraph'

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

const THEME = {
  card: '#1a2949',
  border: '#2b3139',
  primary: '#f0b90b',
  nodeAsset: '#31d2f2',
  edge: 'rgba(255, 255, 255, 0.15)',
  text: '#ffffff'
};

function ReagraphDashboard({ rows }: ReagraphDashboardProps) {
  const graph = useMemo(() => {
    const rootId = 'db-root'
    
    const nodes: GraphNode[] = [
      { 
        id: rootId, 
        label: 'MARKET ENGINE', 
        size: 30, 
        fill: THEME.primary 
      },
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
        fill: '#4e6697'
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
      className="mt-3"
      style={{ 
        height: 550, 
        overflow: 'hidden', 
        position: 'relative',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '8px',
        border: `1px solid ${THEME.border}`
      }}
    >
      <GraphCanvas
        nodes={graph.nodes}
        edges={graph.edges}
        layoutType="forceDirected2d"
        labelType="all"
        theme={{
          ...darkTheme,
          canvas: { 
            background: 'transparent' 
          },
          node: {
            ...darkTheme.node,
            fill: '#4e6697',
            label: {
              ...darkTheme.node.label,
              color: THEME.text,
              activeColor: THEME.primary,
              ...({ fontSize: 10 } as any) 
            }
          },
          edge: {
            ...darkTheme.edge,
            fill: THEME.edge,
            label: {
              ...darkTheme.edge.label,
              color: 'rgba(255, 255, 255, 0.5)',
              activeColor: THEME.primary,
              ...({ fontSize: 8 } as any)
            }
          }
        }}
        animated
      />
      
      {/* Overlay sutil de escaneo de radar */}
      <div className="radar-overlay"></div>

      <style>
        {`
          .radar-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            background: linear-gradient(rgba(240, 185, 11, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(240, 185, 11, 0.03) 1px, transparent 1px);
            background-size: 30px 30px;
            z-index: 2;
          }
        `}
      </style>
    </div>
  )
}

export default ReagraphDashboard