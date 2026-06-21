'use client'

interface WinProbGraphProps {
  winProbHistory: number[]
  currentMove?: number
  onMoveClick?: (idx: number) => void
}

export function WinProbGraph({ winProbHistory, currentMove, onMoveClick }: WinProbGraphProps) {
  const W = 500
  const H = 80
  const PAD = 16

  if (winProbHistory.length < 2) return null

  const n = winProbHistory.length
  const toY = (v: number) => PAD + (H - PAD * 2) * (1 - v / 100)
  const toX = (i: number) => PAD + (i / (n - 1)) * (W - PAD * 2)

  const points = winProbHistory.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')

  const midY = toY(50)
  const blackFill = `M ${toX(0)},${midY} ` +
    winProbHistory.map((v, i) => `L ${toX(i)},${Math.min(midY, toY(v))}`).join(' ') +
    ` L ${toX(n - 1)},${midY} Z`
  const whiteFill = `M ${toX(0)},${midY} ` +
    winProbHistory.map((v, i) => `L ${toX(i)},${Math.max(midY, toY(v))}`).join(' ') +
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
      <rect x={0} y={0} width={W} height={H} fill="#0f0f1a" rx={4} />
      <path d={blackFill} fill="rgba(80,80,80,0.4)" />
      <path d={whiteFill} fill="rgba(220,220,220,0.15)" />
      <line x1={PAD} y1={midY} x2={W - PAD} y2={midY} stroke="#333" strokeWidth={1} strokeDasharray="3 2" />
      <polyline points={points} fill="none" stroke="#00cc44" strokeWidth={1.5} />
      {currentMove !== undefined && currentMove < n && (
        <line
          x1={toX(currentMove)}
          y1={PAD}
          x2={toX(currentMove)}
          y2={H - PAD}
          stroke="#00cc44"
          strokeWidth={1.5}
          opacity={0.8}
        />
      )}
      <text x={PAD} y={PAD - 2} fontSize={7} fill="#666">Black win %</text>
      <text x={PAD} y={H - 2} fontSize={7} fill="#666">White win %</text>
    </svg>
  )
}
