'use client'
import { AnalyzedMove } from '@/lib/game/types'
import { Badge, classificationColor } from '@/components/ui/Badge'
import { BoardPreview } from './BoardPreview'
import { createEmptyBoard, placeStone } from '@/lib/game/board'

interface MoveListProps {
  analyzedMoves: AnalyzedMove[]
  currentMove?: number
  onMoveClick?: (idx: number) => void
}

function buildBoardAt(moves: AnalyzedMove[], idx: number) {
  let board = createEmptyBoard()
  for (let i = 0; i <= idx; i++) {
    board = placeStone(board, moves[i].position, moves[i].color)
  }
  return board
}

export function MoveList({ analyzedMoves, currentMove, onMoveClick }: MoveListProps) {
  const suboptimal = analyzedMoves.filter(
    m => ['inaccuracy', 'mistake', 'blunder'].includes(m.classification)
  )

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#d4a843' }}>
        Move Analysis
      </h3>

      {/* Compact move grid */}
      <div className="grid grid-cols-2 gap-1">
        {analyzedMoves.map((move, idx) => {
          const isCurrent = currentMove === idx + 1
          return (
            <button
              key={idx}
              onClick={() => onMoveClick?.(idx + 1)}
              className="flex items-center gap-2 p-1.5 rounded text-left transition-all hover:opacity-80"
              style={{
                background: isCurrent ? '#1a3a5a' : '#0f0f1a',
                border: `1px solid ${isCurrent ? '#d4a843' : '#2a2a4a'}`,
              }}
            >
              <span className="text-gray-500 text-xs w-4 shrink-0">{move.moveNumber}</span>
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: move.color === 'black' ? '#111' : '#eee', border: '1px solid #666' }}
              />
              <span className="text-gray-300 text-xs">
                {String.fromCharCode(65 + move.position.col)}{15 - move.position.row}
              </span>
              <div
                className="w-2 h-2 rounded-full ml-auto shrink-0"
                style={{ background: classificationColor(move.classification) }}
              />
            </button>
          )
        })}
      </div>

      {/* Suboptimal moves with explanations */}
      {suboptimal.length > 0 && (
        <div className="flex flex-col gap-3 mt-2">
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">Key Moments</h4>
          {suboptimal.map((move, i) => {
            const moveIdx = analyzedMoves.indexOf(move)
            const board = buildBoardAt(analyzedMoves, moveIdx)
            return (
              <div
                key={i}
                className="rounded-lg p-3 cursor-pointer hover:opacity-90 transition-all"
                style={{ background: '#0f0f1a', border: '1px solid #2a2a4a' }}
                onClick={() => onMoveClick?.(move.moveNumber)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-400 text-xs">Move {move.moveNumber}</span>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: move.color === 'black' ? '#111' : '#eee', border: '1px solid #666' }}
                  />
                  <Badge classification={move.classification} small />
                </div>
                <div className="flex gap-3">
                  <BoardPreview
                    board={board}
                    lastMove={move.position}
                    highlightPos={move.bestMove}
                    size={100}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 leading-relaxed">{move.explanation}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Best: {String.fromCharCode(65 + move.bestMove.col)}{15 - move.bestMove.row}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
