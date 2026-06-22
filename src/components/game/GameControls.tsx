'use client'
import Link from 'next/link'
import { GameStatus } from '@/lib/game/types'

interface GameControlsProps {
  status: GameStatus
  gameId: string
  onResign: () => void
  hasAnalysis: boolean
  isAnalyzing: boolean
  analysisProgress: number
  onAnalyze: () => void
}

export function GameControls({
  status,
  gameId,
  onResign,
  hasAnalysis,
  isAnalyzing,
  analysisProgress,
  onAnalyze,
}: GameControlsProps) {
  const gameOver = status !== 'playing'

  return (
    <div className="flex flex-col gap-2">
      {!gameOver && (
        <button
          onClick={onResign}
          className="w-full py-2 rounded text-sm font-semibold transition-all hover:opacity-80"
          style={{ background: '#3a1a1a', color: '#ff6666', border: '1px solid #5a2a2a' }}
        >
          Resign
        </button>
      )}

      {gameOver && !hasAnalysis && !isAnalyzing && (
        <button
          onClick={onAnalyze}
          className="w-full py-2 rounded text-sm font-semibold transition-all"
          style={{ background: '#d4a843', color: '#0f0f1a' }}
        >
          Analyze Game
        </button>
      )}

      {isAnalyzing && (
        <div>
          <div className="text-xs text-gray-400 mb-1">Analyzing... {analysisProgress}%</div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${analysisProgress}%`,
                background: 'linear-gradient(90deg, #d4a843, #f0c060)',
              }}
            />
          </div>
        </div>
      )}

      {gameOver && hasAnalysis && (
        <Link
          href={`/analysis?id=${gameId}`}
          className="w-full py-2 rounded text-sm font-semibold text-center block transition-all hover:opacity-80"
          style={{ background: '#1a3a1a', color: '#00cc44', border: '1px solid #2a5a2a' }}
        >
          View Analysis →
        </Link>
      )}

      <Link
        href="/"
        className="w-full py-2 rounded text-sm font-semibold text-center block transition-all hover:opacity-80"
        style={{ background: '#16213e', color: '#d4a843', border: '1px solid #2a3a5a' }}
      >
        New Game
      </Link>

      <Link
        href="/history"
        className="w-full py-2 rounded text-sm font-semibold text-center block transition-all hover:opacity-80"
        style={{ background: '#16213e', color: '#888', border: '1px solid #2a2a4a' }}
      >
        History
      </Link>
    </div>
  )
}
