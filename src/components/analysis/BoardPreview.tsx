'use client'
import { Board as BoardType, Position, Color } from '@/lib/game/types'
import { BOARD_SIZE, STAR_POINTS } from '@/lib/game/board'

interface BoardPreviewProps {
  board: BoardType
  highlightPos?: Position
  lastMove?: Position
  size?: number
}

export function BoardPreview({ board, highlightPos, lastMove, size = 120 }: BoardPreviewProps) {
  const cellSize = size / (BOARD_SIZE + 1)
  const pad = cellSize
  const total = size

  return (
    <svg width={total} height={total} style={{ background: '#C8A55B', borderRadius: 4, flexShrink: 0 }}>
      {Array.from({ length: BOARD_SIZE }, (_, i) => (
        <g key={i}>
          <line x1={pad} y1={i * cellSize + pad} x2={(BOARD_SIZE - 1) * cellSize + pad} y2={i * cellSize + pad} stroke="#5C3D11" strokeWidth={0.5} />
          <line x1={i * cellSize + pad} y1={pad} x2={i * cellSize + pad} y2={(BOARD_SIZE - 1) * cellSize + pad} stroke="#5C3D11" strokeWidth={0.5} />
        </g>
      ))}

      {board.map((row, r) =>
        row.map((cell, c) => {
          if (!cell) return null
          const cx = c * cellSize + pad
          const cy = r * cellSize + pad
          const rad = cellSize * 0.44
          return (
            <circle
              key={`${r}-${c}`}
              cx={cx}
              cy={cy}
              r={rad}
              fill={cell === 'black' ? '#111' : '#eee'}
              stroke={cell === 'black' ? '#000' : '#999'}
              strokeWidth={0.5}
            />
          )
        })
      )}

      {highlightPos && (
        <circle
          cx={highlightPos.col * cellSize + pad}
          cy={highlightPos.row * cellSize + pad}
          r={cellSize * 0.44}
          fill="none"
          stroke="#d4a843"
          strokeWidth={2}
        />
      )}
      {lastMove && (
        <circle
          cx={lastMove.col * cellSize + pad}
          cy={lastMove.row * cellSize + pad}
          r={cellSize * 0.2}
          fill="#d4a843"
        />
      )}
    </svg>
  )
}
