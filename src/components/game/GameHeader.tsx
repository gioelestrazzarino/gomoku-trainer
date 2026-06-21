'use client'
import { Color, GameStatus } from '@/lib/game/types'

interface GameHeaderProps {
  currentColor: Color
  moveCount: number
  status: GameStatus
  playerColor: Color
  aiStrength: number
  isAIThinking: boolean
}

const strengthLabel = { 1: 'Training', 2: 'Expert', 3: 'Perfect' }

export function GameHeader({ currentColor, moveCount, status, playerColor, aiStrength, isAIThinking }: GameHeaderProps) {
  const statusText = () => {
    if (status === 'black_wins') return '⚫ Black wins!'
    if (status === 'white_wins') return '⚪ White wins!'
    if (status === 'draw') return 'Draw'
    if (status === 'resigned') return 'Resigned'
    if (isAIThinking) return '🤔 AI is thinking...'
    const isPlayerTurn = currentColor === playerColor
    return isPlayerTurn ? 'Your turn' : 'AI turn'
  }

  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg"
      style={{ background: '#0f0f1a', border: '1px solid #2a2a4a' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold"
          style={{
            background: currentColor === 'black' ? '#111' : '#eee',
            borderColor: '#d4a843',
            color: currentColor === 'black' ? '#fff' : '#000',
          }}
        >
          {currentColor === 'black' ? '●' : '○'}
        </div>
        <div>
          <div className="text-white font-semibold text-sm">{statusText()}</div>
          <div className="text-gray-400 text-xs">Move {moveCount}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs text-gray-400">AI: {strengthLabel[aiStrength as 1 | 2 | 3]}</div>
        <div className="text-xs text-gray-500">
          You: {playerColor === 'black' ? '⚫ Black' : '⚪ White'}
        </div>
      </div>
    </div>
  )
}
