'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { generateGameId, loadAllGames } from '@/lib/storage/db'
import { GameRecord, AIStrength, Color } from '@/lib/game/types'

export default function Home() {
  const router = useRouter()
  const [color, setColor] = useState<Color>('black')
  const [strength, setStrength] = useState<AIStrength>(1)
  const [recentGames, setRecentGames] = useState<GameRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllGames().then(g => {
      setRecentGames(g.slice(0, 5))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  function startGame() {
    const id = generateGameId()
    const params = new URLSearchParams({ color, strength: String(strength) })
    router.push(`/game/${id}?${params}`)
  }

  const strengthInfo: Record<AIStrength, { label: string; desc: string; color: string }> = {
    1: { label: 'Training', desc: 'Makes occasional mistakes. Perfect for beginners.', color: '#00cc44' },
    2: { label: 'Expert', desc: 'Full strength search at depth 6. Challenging.', color: '#ffcc00' },
    3: { label: 'Perfect', desc: 'Maximum depth, near-perfect play. Brutal.', color: '#ff3333' },
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)' }}>
      <div className="text-center mb-8">
        <h1 className="text-5xl font-black mb-2" style={{ color: '#d4a843', textShadow: '0 0 40px rgba(212,168,67,0.3)' }}>
          碁 Gomoku Trainer
        </h1>
        <p className="text-gray-400 text-lg">Master the art of five in a row</p>
      </div>

      <div className="w-full max-w-md rounded-2xl p-6 mb-6" style={{ background: '#16213e', border: '1px solid #2a3a5a', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: '#d4a843' }}>New Game</h2>

        <div className="mb-5">
          <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">Play as</label>
          <div className="flex gap-3">
            {(['black', 'white'] as Color[]).map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all"
                style={{
                  background: color === c ? (c === 'black' ? '#111' : '#ddd') : '#0f0f1a',
                  border: `2px solid ${color === c ? '#d4a843' : '#2a2a4a'}`,
                  color: color === c ? (c === 'black' ? '#fff' : '#000') : '#666',
                }}
              >
                <span>{c === 'black' ? '●' : '○'}</span>
                <span className="capitalize">{c}</span>
                {c === 'black' && <span className="text-xs text-gray-500">(first)</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">AI Strength</label>
          <div className="flex flex-col gap-2">
            {([1, 2, 3] as AIStrength[]).map(s => {
              const info = strengthInfo[s]
              return (
                <button
                  key={s}
                  onClick={() => setStrength(s)}
                  className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                  style={{ background: strength === s ? '#0f1a2e' : '#0f0f1a', border: `2px solid ${strength === s ? info.color : '#2a2a4a'}` }}
                >
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: info.color }} />
                  <div>
                    <div className="font-semibold text-sm" style={{ color: strength === s ? info.color : '#888' }}>{info.label}</div>
                    <div className="text-xs text-gray-500">{info.desc}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={startGame}
          className="w-full py-4 rounded-xl font-black text-xl tracking-wide transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #d4a843 0%, #f0c060 100%)', color: '#0f0f1a', boxShadow: '0 4px 20px rgba(212,168,67,0.4)' }}
        >
          Play Gomoku
        </button>
      </div>

      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Recent Games</h2>
          <Link href="/history" className="text-xs hover:opacity-70 transition-all" style={{ color: '#d4a843' }}>View All →</Link>
        </div>
        {loading ? (
          <div className="text-gray-600 text-sm text-center py-4">Loading...</div>
        ) : recentGames.length === 0 ? (
          <div className="rounded-xl p-4 text-center text-gray-500 text-sm" style={{ background: '#16213e', border: '1px solid #2a2a4a' }}>
            No games yet. Play your first game!
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recentGames.map(game => (
              <Link key={game.id} href={`/game/${game.id}`} className="flex items-center gap-3 p-3 rounded-xl transition-all hover:opacity-80" style={{ background: '#16213e', border: '1px solid #2a2a4a' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: game.result === 'black' ? '#111' : game.result === 'white' ? '#eee' : '#444', color: game.result === 'black' ? '#fff' : game.result === 'white' ? '#000' : '#aaa', border: '2px solid #2a3a5a' }}>
                  {game.result === 'black' ? '●' : game.result === 'white' ? '○' : '='}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-200">
                    {game.status === 'playing' ? '▶ In Progress' : game.result === game.playerColor ? '🏆 Victory' : game.result === 'resigned' ? '🏳 Resigned' : game.result === 'draw' ? '🤝 Draw' : '❌ Defeat'}
                  </div>
                  <div className="text-xs text-gray-500">{game.moves.length} moves · AI {['', 'Training', 'Expert', 'Perfect'][game.aiStrength]}</div>
                </div>
                <div className="text-xs text-gray-600 shrink-0">{new Date(game.timestamp).toLocaleDateString()}</div>
                {game.analysis && <div className="text-xs shrink-0" style={{ color: '#00cc44' }}>✓</div>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
