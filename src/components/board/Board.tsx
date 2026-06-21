'use client'
import { useCallback, useMemo, useState } from 'react'
import { Board as BoardType, Color, Move, Position } from '@/lib/game/types'
import { BOARD_SIZE } from '@/lib/game/board'
import { StarPoints } from './StarPoints'
import { Stone } from './Stone'

const CELL_SIZE = 38
const PADDING = CELL_SIZE
const BOARD_PX = CELL_SIZE * (BOARD_SIZE - 1) + PADDING * 2

interface BoardProps {
  board: BoardType
  moves: Move[]
  currentColor: Color
  onMove?: (pos: Position) => void
  disabled?: boolean
  hintMove?: Position | null
  highlightPositions?: Position[]
  highlightColor?: string
  winningLine?: Position[]
  lastMove?: Position | null
  bestMoveHighlight?: Position | null
}

export function Board({
  board,
  moves,
  currentColor,
  onMove,
  disabled,
  hintMove,
  highlightPositions,
  highlightColor = '#d4a843',
  winningLine,
  lastMove,
  bestMoveHighlight,
}: BoardProps) {
  const [hover, setHover] = useState<Position | null>(null)

  const handleClick = useCallback(
    (row: number, col: number) => {
      if (disabled || !onMove) return
      if (board[row][col] !== null) return
      onMove({ row, col })
    },
    [disabled, onMove, board]
  )

  const winSet = useMemo(() => {
    if (!winningLine) return new Set<string>()
    return new Set(winningLine.map(p => `${p.row},${p.col}`))
  }, [winningLine])

  const stoneRadius = CELL_SIZE * 0.46

  return (
    <div className="relative select-none" style={{ width: '100%', maxWidth: BOARD_PX }}>
      <style>{`
        @keyframes stoneAppear {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <svg
        viewBox={`0 0 ${BOARD_PX} ${BOARD_PX}`}
        style={{
          width: '100%',
          maxWidth: BOARD_PX,
          height: 'auto',
          background: 'linear-gradient(135deg, #DCB167 0%, #C8A55B 50%, #B8934A 100%)',
          borderRadius: 8,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          cursor: disabled ? 'default' : 'crosshair',
          display: 'block',
        }}
        onMouseLeave={() => setHover(null)}
      >
        {/* Grid lines */}
        {Array.from({ length: BOARD_SIZE }, (_, i) => (
          <g key={i}>
            <line
              x1={PADDING}
              y1={i * CELL_SIZE + PADDING}
              x2={(BOARD_SIZE - 1) * CELL_SIZE + PADDING}
              y2={i * CELL_SIZE + PADDING}
              stroke="#5C3D11"
              strokeWidth={0.8}
            />
            <line
              x1={i * CELL_SIZE + PADDING}
              y1={PADDING}
              x2={i * CELL_SIZE + PADDING}
              y2={(BOARD_SIZE - 1) * CELL_SIZE + PADDING}
              stroke="#5C3D11"
              strokeWidth={0.8}
            />
          </g>
        ))}

        {/* Border lines (thicker) */}
        <rect
          x={PADDING}
          y={PADDING}
          width={(BOARD_SIZE - 1) * CELL_SIZE}
          height={(BOARD_SIZE - 1) * CELL_SIZE}
          fill="none"
          stroke="#5C3D11"
          strokeWidth={2}
        />

        {/* Star points */}
        <StarPoints cellSize={CELL_SIZE} />

        {/* Coordinate labels */}
        {Array.from({ length: BOARD_SIZE }, (_, i) => (
          <g key={i}>
            <text
              x={i * CELL_SIZE + PADDING}
              y={PADDING - 8}
              textAnchor="middle"
              fontSize={10}
              fill="#5C3D11"
              fontFamily="sans-serif"
            >
              {String.fromCharCode(65 + i)}
            </text>
            <text
              x={PADDING - 10}
              y={i * CELL_SIZE + PADDING + 4}
              textAnchor="middle"
              fontSize={10}
              fill="#5C3D11"
              fontFamily="sans-serif"
            >
              {BOARD_SIZE - i}
            </text>
          </g>
        ))}

        {/* Hover highlight areas - invisible clickable cells */}
        {Array.from({ length: BOARD_SIZE }, (_, r) =>
          Array.from({ length: BOARD_SIZE }, (_, c) => {
            const isEmpty = board[r][c] === null
            return (
              <rect
                key={`${r}-${c}`}
                x={c * CELL_SIZE + PADDING - CELL_SIZE / 2}
                y={r * CELL_SIZE + PADDING - CELL_SIZE / 2}
                width={CELL_SIZE}
                height={CELL_SIZE}
                fill="transparent"
                onMouseEnter={() => isEmpty && !disabled && setHover({ row: r, col: c })}
                onClick={() => handleClick(r, c)}
              />
            )
          })
        )}

        {/* Hover preview */}
        {hover && !disabled && board[hover.row][hover.col] === null && (
          <circle
            cx={hover.col * CELL_SIZE + PADDING}
            cy={hover.row * CELL_SIZE + PADDING}
            r={stoneRadius}
            fill={currentColor === 'black' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.5)'}
            stroke={currentColor === 'black' ? '#000' : '#999'}
            strokeWidth={1}
            pointerEvents="none"
          />
        )}

        {/* Best move hint */}
        {bestMoveHighlight && board[bestMoveHighlight.row][bestMoveHighlight.col] === null && (
          <circle
            cx={bestMoveHighlight.col * CELL_SIZE + PADDING}
            cy={bestMoveHighlight.row * CELL_SIZE + PADDING}
            r={stoneRadius * 0.7}
            fill="none"
            stroke="#d4a843"
            strokeWidth={3}
            strokeDasharray="4 2"
            pointerEvents="none"
          />
        )}

        {/* Hint move */}
        {hintMove && board[hintMove.row][hintMove.col] === null && (
          <g pointerEvents="none">
            <circle
              cx={hintMove.col * CELL_SIZE + PADDING}
              cy={hintMove.row * CELL_SIZE + PADDING}
              r={stoneRadius}
              fill={currentColor === 'black' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)'}
              stroke="#d4a843"
              strokeWidth={2.5}
            />
            <text
              x={hintMove.col * CELL_SIZE + PADDING}
              y={hintMove.row * CELL_SIZE + PADDING + 5}
              textAnchor="middle"
              fontSize={14}
              fill="#d4a843"
              fontWeight="bold"
            >
              ★
            </text>
          </g>
        )}

        {/* Stones */}
        {board.map((row, r) =>
          row.map((cell, c) => {
            if (!cell) return null
            const isLast = lastMove?.row === r && lastMove?.col === c
            const inWin = winSet.has(`${r},${c}`)
            const moveIdx = moves.findIndex(m => m.position.row === r && m.position.col === c)
            return (
              <Stone
                key={`${r}-${c}`}
                color={cell}
                cx={c * CELL_SIZE + PADDING}
                cy={r * CELL_SIZE + PADDING}
                r={stoneRadius}
                animate={isLast}
                highlight={inWin ? '#d4a843' : undefined}
                label={isLast ? String(moveIdx + 1) : undefined}
              />
            )
          })
        )}
      </svg>
    </div>
  )
}
