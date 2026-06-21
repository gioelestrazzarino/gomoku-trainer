'use client'

interface EvalGraphProps {
  evalHistory: number[]
  currentMove?: number
  onMoveClick?: (idx: number) => void
}

const MAX_DISPLAY = 50000

export function EvalGraph({ evalHistory, currentMove, onMoveClick }: EvalGraphProps) {
  const W = 500
  const H = 120
  const PAD = 20

  if (evalHistory.length < 2) {
    return <div className="text-gray-500 text-sm text-center py-4">Not enough moves for graph</div>
  }

  const n = evalHistory.length
  const clamp = (v: number) => Math.max(-MAX_DISPLAY, Math.min(MAX_DISPLAY, v))
  const toY = (v: number) => PAD + (H - PAD * 2) * (1 - (clamp(v) + MAX_DISPLAY) / (2 * MAX_DISPLAY))
  const toX = (i: number) => PAD + (i / (n - 1)) * (W - PAD * 2)

  const points = evalHistory.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')

  // Fill areas
  const midY = toY(0)
  const blackArea = `M ${toX(0)},${midY} ` +
    evalHistory.map((v, i) => `L ${toX(i)},${Math.min(midY, toY(v))}`).join(' ') +
    ` L ${toX(n - 1)},${midY} Z`
  const whiteArea = `M ${toX(0)},${midY} ` +
    evalHistory.map((v, i) => `L ${toX(i)},${Math.max(midY, toY(v))}`).join(' ') +
    ` L ${toX(n - 1)},${midY} Z`

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 'auto', cursor: 'pointer' }}
      onClick={(e) => {
        if (!onMoveClick) return
        const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * W
        const idx = Math.round(((x - PAD) / (W - PAD * 2)) * (n - 1))
        if (idx >= 0 && idx < n) onMoveClick(idx)
      }}
    >
      {/* Background */}
      <rect x={0} y={0} width={W} height={H} fill="#0f0f1a" rx={4} />

      {/* Black advantage fill */}
      <path d={blackArea} fill="rgba(50,50,50,0.5)" />
      {/* White advantage fill */}
      <path d={whiteArea} fill="rgba(200,200,200,0.15)" />

      {/* Zero line */}
      <line x1={PAD} y1={midY} x2={W - PAD} y2={midY} stroke="#333" strokeWidth={1} strokeDasharray="3 2" />

      {/* Eval line */}
      <polyline points={points} fill="none" stroke="#d4a843" strokeWidth={1.5} />

      {/* Current move indicator */}
      {currentMove !== undefined && currentMove < n && (
        <line
          x1={toX(currentMove)}
          y1={PAD}
          x2={toX(currentMove)}
          y2={H - PAD}
          stroke="#d4a843"
          strokeWidth={1.5}
          opacity={0.8}
        />
      )}

      {/* Labels */}
      <text x={PAD} y={PAD - 4} fontSize={8} fill="#666">Black ahead</text>
      <text x={PAD} y={H - 4} fontSize={8} fill="#666">White ahead</text>
    </svg>
  )
}
