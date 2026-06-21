'use client'
import { STAR_POINTS } from '@/lib/game/board'

export function StarPoints({ cellSize }: { cellSize: number }) {
  return (
    <>
      {STAR_POINTS.map((pos) => (
        <circle
          key={`${pos.row}-${pos.col}`}
          cx={pos.col * cellSize + cellSize}
          cy={pos.row * cellSize + cellSize}
          r={cellSize * 0.12}
          fill="#5C3D11"
        />
      ))}
    </>
  )
}
