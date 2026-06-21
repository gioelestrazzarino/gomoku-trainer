'use client'
import { Position } from '@/lib/game/types'

interface HintPanelProps {
  hintMove: Position | null
  hintExplanation: string
  isLoading: boolean
  onRequestHint: () => void
  onDismiss: () => void
  disabled: boolean
}

export function HintPanel({ hintMove, hintExplanation, isLoading, onRequestHint, onDismiss, disabled }: HintPanelProps) {
  return (
    <div
      className="rounded-lg p-3"
      style={{ background: '#0f0f1a', border: '1px solid #2a2a4a' }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#d4a843' }}>
          Hint
        </h3>
        {hintMove && (
          <button
            onClick={onDismiss}
            className="text-gray-500 hover:text-gray-300 text-xs"
          >
            Dismiss
          </button>
        )}
      </div>

      {!hintMove && !isLoading && (
        <button
          onClick={onRequestHint}
          disabled={disabled}
          className="w-full py-2 rounded text-sm font-semibold transition-all"
          style={{
            background: disabled ? '#2a2a4a' : '#d4a843',
            color: disabled ? '#666' : '#0f0f1a',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          Show Best Move
        </button>
      )}

      {isLoading && (
        <div className="text-gray-400 text-sm text-center py-2">Calculating...</div>
      )}

      {hintMove && !isLoading && (
        <div>
          <p className="text-white text-sm font-semibold">
            Best: {String.fromCharCode(65 + hintMove.col)}{15 - hintMove.row}
          </p>
          <p className="text-gray-400 text-xs mt-1">{hintExplanation}</p>
        </div>
      )}
    </div>
  )
}
