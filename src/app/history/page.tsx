'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadAllGames, deleteGame } from '@/lib/storage/db'
import { GameRecord } from '@/lib/game/types'

export default function HistoryPage() {
  const [games, setGames] = useState<GameRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllGames().then(g => {
      setGames(g)
      setLoading(false)
    })
  }, [])

  async function onDelete(id: string) {
    if (!confirm('Delete this game?')) return
    await deleteGame(id)
    setGames(g => g.filter(x => x.id !== id))
  }

  return (
    <div className="min-h-screen p-6" style={{ background: '#0f0f1a' }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="text-sm hover:opacity-70 transition-all" style={{ color: '#d4a843' }}>
            ← Home
          </Link>
          <h1 className="text-2xl font-black" style={{ color: '#d4a843' }}>Game History</h1>
        </div>

        {loading ? (
          <div className="text-gray-500 text-center py-12">Loading...</div>
        ) : games.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No games yet</div>
            <Link href="/" className="px-4 py-2 rounded-lg font-semibold" style={{ background: '#d4a843', color: '#0f0f1a' }}>
              Play Your First Game
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {games.map(game => {
              const inProgress = game.status === 'playing'
              const isWin = !inProgress && game.result === game.playerColor
              const isLoss = !inProgress && game.result !== game.playerColor && game.result !== 'draw' && game.result !== 'resigned'

              return (
                <div
                  key={game.id}
                  className="rounded-xl p-4 flex items-center gap-4"
                  style={{ background: '#16213e', border: '1px solid #2a2a4a' }}
                >
                  {/* Result icon */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                    style={{
                      background: inProgress ? '#0a1a2a' : isWin ? '#0f3a0f' : isLoss ? '#3a0f0f' : '#1a1a3a',
                      border: `2px solid ${inProgress ? '#2a5a8a' : isWin ? '#00cc44' : isLoss ? '#cc0000' : '#4444aa'}`,
                    }}
                  >
                    {inProgress ? '▶' : isWin ? '🏆' : isLoss ? '❌' : game.result === 'draw' ? '🤝' : '🏳'}
                  </div>

                  {/* Game info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-200">
                        {inProgress ? 'In Progress' : isWin ? 'Victory' : isLoss ? 'Defeat' : game.result === 'draw' ? 'Draw' : 'Resigned'}
                      </span>
                      <span className="text-xs text-gray-500">vs AI {['', 'Training', 'Expert', 'Perfect'][game.aiStrength]}</span>
                      <span className="text-xs text-gray-600">
                        Playing {game.playerColor === 'black' ? '⚫' : '⚪'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {game.moves.length} moves · {new Date(game.timestamp).toLocaleString()}
                    </div>
                    {game.analysis && (
                      <div className="text-xs mt-1" style={{ color: '#00cc44' }}>
                        ✓ Analyzed · B:{game.analysis.blackAccuracy}% W:{game.analysis.whiteAccuracy}%
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <Link
                      href={`/game?id=${game.id}`}
                      className="px-3 py-1.5 rounded text-xs font-semibold text-center hover:opacity-80 transition-all"
                      style={{ background: '#16213e', color: '#d4a843', border: '1px solid #d4a843' }}
                    >
                      View
                    </Link>
                    {game.analysis && (
                      <Link
                        href={`/analysis?id=${game.id}`}
                        className="px-3 py-1.5 rounded text-xs font-semibold text-center hover:opacity-80 transition-all"
                        style={{ background: '#1a3a1a', color: '#00cc44', border: '1px solid #00cc44' }}
                      >
                        Analysis
                      </Link>
                    )}
                    <button
                      onClick={() => onDelete(game.id)}
                      className="px-3 py-1.5 rounded text-xs font-semibold hover:opacity-80 transition-all"
                      style={{ background: '#3a1a1a', color: '#ff6666', border: '1px solid #5a2a2a' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
