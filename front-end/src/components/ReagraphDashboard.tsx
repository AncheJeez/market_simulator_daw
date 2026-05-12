import { useMemo } from 'react';
import { GraphCanvas, darkTheme } from 'reagraph';

type OverviewRow = {
  symbol: string;
  name: string;
  dataPoints: number;
  latestDate: string | null;
  latestClose: number | null;
};

type GraphNode = {
  id: string;
  label: string;
  size?: number;
  fill?: string;
};

type GraphEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
};

type ReagraphDashboardProps = {
  rows: OverviewRow[];
};

const THEME = {
  card: '#1a2949',
  border: '#2b3139',
  primary: '#f0b90b', // Amarillo Binance
  text: '#ffffff',
  edge: 'rgba(255, 255, 255, 0.1)',
};

// Diccionario de mapeo para organizar los activos por sectores (Tópicos)
const SECTOR_MAP: Record<string, { label: string; color: string }> = {
  // Tecnología y Semiconductores
  AAPL: { label: 'TECH', color: '#31d2f2' }, MSFT: { label: 'TECH', color: '#31d2f2' },
  GOOGL: { label: 'TECH', color: '#31d2f2' }, AMZN: { label: 'TECH', color: '#31d2f2' },
  NVDA: { label: 'TECH', color: '#31d2f2' }, META: { label: 'TECH', color: '#31d2f2' },
  TSLA: { label: 'TECH', color: '#31d2f2' }, AMD: { label: 'TECH', color: '#31d2f2' },
  // Finanzas
  JPM: { label: 'FINANCE', color: '#00ff88' }, BAC: { label: 'FINANCE', color: '#00ff88' },
  GS: { label: 'FINANCE', color: '#00ff88' }, V: { label: 'FINANCE', color: '#00ff88' },
  MA: { label: 'FINANCE', color: '#00ff88' },
  // Energía e Industria
  XOM: { label: 'ENERGY', color: '#f0b90b' }, CVX: { label: 'ENERGY', color: '#f0b90b' },
  CAT: { label: 'INDUSTRY', color: '#ff7b00' }, BA: { label: 'INDUSTRY', color: '#ff7b00' },
  // Salud
  JNJ: { label: 'HEALTH', color: '#ff4d4d' }, PFE: { label: 'HEALTH', color: '#ff4d4d' },
  LLY: { label: 'HEALTH', color: '#ff4d4d' },
  // Índices y Crypto
  SPY: { label: 'INDEX', color: '#fffb00' }, QQQ: { label: 'INDEX', color: '#fffb00' },
  'BTC-USD': { label: 'CRYPTO', color: '#dedb31' },
};

function ReagraphDashboard({ rows }: ReagraphDashboardProps) {
  const graph = useMemo(() => {
    const rootId = 'market-root';
    const nodes: GraphNode[] = [
      { id: rootId, label: 'MARKET ENGINE', size: 35, fill: THEME.primary },
    ];
    const edges: GraphEdge[] = [];
    const createdSectors = new Set<string>();

    const closes = rows
      .map((row) => row.latestClose)
      .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));
    const maxClose = closes.length ? Math.max(...closes) : 1;

    rows.forEach((row) => {
      const sectorInfo = SECTOR_MAP[row.symbol] || { label: 'OTHER', color: '#4e6697' };
      const sectorNodeId = `sector-${sectorInfo.label}`;

      // 1. Crear nodo de Sector si no existe
      if (!createdSectors.has(sectorNodeId)) {
        nodes.push({
          id: sectorNodeId,
          label: sectorInfo.label,
          size: 25,
          fill: sectorInfo.color,
        });
        // Conectar el Sector al Corazón del Mercado
        edges.push({
          id: `root-${sectorNodeId}`,
          source: rootId,
          target: sectorNodeId,
        });
        createdSectors.add(sectorNodeId);
      }

      // 2. Crear nodo del Activo (Símbolo)
      const symbolNodeId = `symbol-${row.symbol}`;
      const price = row.latestClose ?? 0;
      // El tamaño depende del precio relativo
      const scaledSize = price > 0 ? 10 + (price / maxClose) * 25 : 10;

      nodes.push({
        id: symbolNodeId,
        label: row.symbol,
        size: Math.min(Math.max(scaledSize, 10), 40),
        fill: 'rgba(78, 102, 151, 0.7)',
      });

      // 3. Conectar el Activo a su Tópico/Sector
      edges.push({
        id: `edge-${row.symbol}`,
        source: sectorNodeId,
        target: symbolNodeId,
        label: `$${price.toFixed(0)}`,
      });
    });

    return { nodes, edges };
  }, [rows]);

  return (
    <div
      className="mt-3"
      style={{
        height: 550,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#0b1222',
        borderRadius: '12px',
        border: `1px solid ${THEME.border}`,
      }}
    >
      <GraphCanvas
        nodes={graph.nodes}
        edges={graph.edges}
        layoutType="forceDirected2d"
        labelType="all"
        theme={{
          ...darkTheme,
          canvas: { background: 'transparent' },
          node: {
            ...darkTheme.node,
            label: {
              ...darkTheme.node.label,
              color: THEME.text,
              ...({ fontSize: 10 } as any),
            },
          },
          edge: {
            ...darkTheme.edge,
            // Usamos 'fill' para el color de la línea
            fill: '#000000', 
            // Forzamos la opacidad al máximo para que sean bien visibles
            opacity: 1,
            activeFill: THEME.primary,
            label: {
              ...darkTheme.edge.label,
              color: 'rgba(255, 255, 255, 0.7)',
              ...({ fontSize: 8 } as any),
            },
          },
        }}
        animated
      />

      {/* Overlay de Red de Seguridad/Radar */}
      <div className="radar-grid"></div>

      <style>
        {`
          .radar-grid {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none;
            background-image: 
              radial-gradient(circle, rgba(240, 185, 11, 0.05) 1px, transparent 1px);
            background-size: 40px 40px;
            z-index: 1;
          }
          /* Efecto de pulso para el nodo central en la UI si fuera necesario */
        `}
      </style>
    </div>
  );
}

export default ReagraphDashboard;