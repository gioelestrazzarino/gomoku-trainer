'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { loadGame } from '@/lib/storage/db'
import { GameRecord } from '@/lib/game/types'
import { AnalysisReportView } from '@/components/analysis/AnalysisReport'
import { ReplayBoard } from '@/components/replay/ReplayBoard'
import { ReplayControls } from '@/components/replay/ReplayControls'

export default function AnalysisPage() {
  const params = useParams()
  const gameId = params.id as string

  const [game, setGame] = useState<GameRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentMove, setCurrentMove] = useState(0)
  const [showBestMove, setShowBestMove] = useState(true)

  useEffect(() => {
    loadGame(gameId).then(g => {
      setGame(g || null)
      setLoading(false)
      if (g) setCurrentMove(g.moves.length) // Start at final position
    })
  }, [gameId])

  const onMoveClick = useCallback((idx: number) => {
    setCurrentMove(idx)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f1a' }}>
        <div className="text-gray-400">Loading analysis...</div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#0f0f1a' }}>
        <div className="text-gray-400">Game not found</div>
        <Link href="/" style={{ color: '#d4a843' }}>← Home</Link>
      </div>
    )
  }

  if (!game.analysis) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#0f0f1a' }}>
        <div className="text-gray-400">No analysis available for this game.</div>
        <Link href={`/game/${gameId}`} style={{ color: '#d4a843' }}>← Back to Game</Link>
      </div>
    )
  }

  const totalMoves = game.moves.length

  return (
    <div className="min-h-screen flex" style={{ background: '#0f0f1a' }}>
      {/* Board area */}
      <div className="flex-1 flex flex-col items-center justify-start p-4 gap-4 overflow-x-auto">
        <div className="flex items-center gap-4 w-full max-w-xl">
          <Link href={`/game/${gameId}`} className="text-xs hover:opacity-70 transition-all" style={{ color: '#d4a843' }}>
            ← Game
          </Link>
          <h1 className="text-lg font-black" style={{ color: '#d4a843' }}>Analysis</h1>
          <div className="ml-auto flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showBestMove}
                onChange={e => setShowBestMove(e.target.checked)}
                className="accent-yellow-500"
              />
              Show best move
            </label>
          </div>
        </div>

        <ReplayBoard
          moves={game.moves}
          currentMove={currentMove}
          analyzedMoves={game.analysis.analyzedMoves}
          showBestMove={showBestMove}
        />

        <div className="w-full max-w-xl">
          <ReplayControls
            currentMove={currentMove}
            totalMoves={totalMoves}
            onFirst={() => setCurrentMove(0)}
            onPrev={() => setCurrentMove(m => Math.max(0, m - 1))}
            onNext={() => setCurrentMove(m => Math.min(totalMoves, m + 1))}
            onLast={() => setCurrentMove(totalMoves)}
            onJumpTo={onMoveClick}
            analyzedMoves={game.analysis.analyzedMoves}
          />
        </div>

        {/* Current move info */}
        {currentMove > 0 && game.analysis.analyzedMoves[currentMove - 1] && (
          <div
            className="w-full max-w-xl rounded-lg p-3 text-sm"
            style={{ background: '#16213e', border: '1px solid #2a2a4a' }}
          >
            {(() => {
              const am = game.analysis.analyzedMoves[currentMove - 1]
              return (
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">Move {am.moveNumber}:</span>
                  <div className="w-3 h-3 rounded-full" style={{ background: am.color === 'black' ? '#111' : '#eee', border: '1px solid #666' }} />
                  <span className="text-gray-200">{String.fromCharCode(65 + am.position.col)}{15 - am.position.row}</span>
                  <span className="ml-auto text-xs" style={{ color: '#d4a843' }}>
                    Eval: {am.evalAfter > 0 ? '+' : ''}{Math.round(am.evalAfter / 100) / 10}k
                  </span>
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* Analysis sidebar */}
      <div className="overflow-y-auto p-4" style={{ width: 380, background: '#16213e', borderLeft: '1px solid #2a2a4a' }}>
        <AnalysisReportView
          report={game.analysis}
          currentMove={currentMove}
          onMoveClick={onMoveClick}
        />
      </div>
    </div>
  )
}
