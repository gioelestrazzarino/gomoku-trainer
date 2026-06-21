'use client'
import { AnalyzedMove } from '@/lib/game/types'

interface ReplayControlsProps {
  currentMove: number
  totalMoves: number
  onFirst: () => void
  onPrev: () => void
  onNext: () => void
  onLast: () => void
  onJumpTo?: (idx: number) => void
  analyzedMoves?: AnalyzedMove[]
}

const SUBOPTIMAL = new Set(['inaccuracy', 'mistake', 'blunder'])

export function ReplayControls({
  currentMove,
  totalMoves,
  onFirst,
  onPrev,
  onNext,
  onLast,
  onJumpTo,
  analyzedMoves,
}: ReplayControlsProps) {
  const mistakeMoveNumbers = analyzedMoves
    ? analyzedMoves.filter(m => SUBOPTIMAL.has(m.classification)).map(m => m.moveNumber)
    : []

  function jumpPrevMistake() {
    if (!onJumpTo) return
    const prev = [...mistakeMoveNumbers].reverse().find(n => n < currentMove)
    if (prev !== undefined) onJumpTo(prev)
  }

  function jumpNextMistake() {
    if (!onJumpTo) return
    const next = mistakeMoveNumbers.find(n => n > currentMove)
    if (next !== undefined) onJumpTo(next)
  }

  const hasPrevMistake = mistakeMoveNumbers.some(n => n < currentMove)
  const hasNextMistake = mistakeMoveNumbers.some(n => n > currentMove)

  return (
    <div className="flex flex-col gap-2">
      {/* Main nav row */}
      <div
        className="flex items-center gap-2 p-2 rounded-lg"
        style={{ background: '#0f0f1a', border: '1px solid #2a2a4a' }}
      >
        <button onClick={onFirst} disabled={currentMove === 0}
          className="px-3 py-1.5 rounded text-sm font-bold disabled:opacity-30 hover:opacity-70 transition-all"
          style={{ background: '#16213e', color: '#d4a843' }} title="First move">⏮</button>
        <button onClick={onPrev} disabled={currentMove === 0}
          className="px-3 py-1.5 rounded text-sm font-bold disabled:opacity-30 hover:opacity-70 transition-all"
          style={{ background: '#16213e', color: '#d4a843' }} title="Previous move">◀</button>
        <div className="flex-1 text-center text-gray-400 text-sm">{currentMove} / {totalMoves}</div>
        <button onClick={onNext} disabled={currentMove === totalMoves}
          className="px-3 py-1.5 rounded text-sm font-bold disabled:opacity-30 hover:opacity-70 transition-all"
          style={{ background: '#16213e', color: '#d4a843' }} title="Next move">▶</button>
        <button onClick={onLast} disabled={currentMove === totalMoves}
          className="px-3 py-1.5 rounded text-sm font-bold disabled:opacity-30 hover:opacity-70 transition-all"
          style={{ background: '#16213e', color: '#d4a843' }} title="Last move">⏭</button>
      </div>

      {/* Jump to mistake row — only shown when analysis available */}
      {mistakeMoveNumbers.length > 0 && (
        <div className="flex gap-2">
          <button onClick={jumpPrevMistake} disabled={!hasPrevMistake}
            className="flex-1 py-1.5 rounded text-xs font-semibold disabled:opacity-30 hover:opacity-80 transition-all"
            style={{ background: '#2a1a0a', color: '#ff8800', border: '1px solid #4a2a0a' }}
            title="Previous mistake">
            ← Prev Mistake
          </button>
          <button onClick={jumpNextMistake} disabled={!hasNextMistake}
            className="flex-1 py-1.5 rounded text-xs font-semibold disabled:opacity-30 hover:opacity-80 transition-all"
            style={{ background: '#2a1a0a', color: '#ff8800', border: '1px solid #4a2a0a' }}
            title="Next mistake">
            Next Mistake →
          </button>
        </div>
      )}
    </div>
  )
}
