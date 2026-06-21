'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Board } from '@/components/board/Board'
import { GameHeader } from '@/components/game/GameHeader'
import { HintPanel } from '@/components/game/HintPanel'
import { GameControls } from '@/components/game/GameControls'
import { Sidebar, SidebarSection } from '@/components/ui/Sidebar'
import { createEmptyBoard, placeStone, checkWin, isBoardFull, getWinningLine } from '@/lib/game/board'
import { getZobristHash, updateHash } from '@/lib/engine/zobrist'
import { saveGame, loadGame } from '@/lib/storage/db'
import { AIStrength, Color, GameRecord, GameStatus, Move, Position } from '@/lib/game/types'

export default function GamePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const gameId = params.id as string

  // Game setup from URL params
  const playerColor = (searchParams.get('color') as Color) || 'black'
  const aiStrength = (Number(searchParams.get('strength')) as AIStrength) || 1

  // Game state
  const [board, setBoard] = useState(createEmptyBoard())
  const [moves, setMoves] = useState<Move[]>([])
  const [currentColor, setCurrentColor] = useState<Color>('black')
  const [status, setStatus] = useState<GameStatus>('playing')
  const [winningLine, setWinningLine] = useState<Position[]>([])
  const [isAIThinking, setIsAIThinking] = useState(false)

  // Hint state
  const [hintMove, setHintMove] = useState<Position | null>(null)
  const [hintExplanation, setHintExplanation] = useState('')
  const [isHintLoading, setIsHintLoading] = useState(false)

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [hasAnalysis, setHasAnalysis] = useState(false)

  // Refs for workers and hash
  const engineWorkerRef = useRef<Worker | null>(null)
  const analysisWorkerRef = useRef<Worker | null>(null)
  const hashRef = useRef(0)
  const moveCountRef = useRef(0)
  const boardRef = useRef(board)
  const movesRef = useRef<Move[]>([])
  const statusRef = useRef(status)
  const currentColorRef = useRef(currentColor)

  boardRef.current = board
  movesRef.current = moves
  statusRef.current = status
  currentColorRef.current = currentColor

  // Init engine worker
  useEffect(() => {
    const worker = new Worker(new URL('../../../workers/engine.worker.ts', import.meta.url))
    engineWorkerRef.current = worker

    worker.onmessage = (e) => {
      const msg = e.data
      if (msg.type === 'MOVE_RESULT') {
        handleAIMove(msg.move)
        setIsAIThinking(false)
      } else if (msg.type === 'HINT_RESULT') {
        setHintMove(msg.move)
        setHintExplanation(msg.explanation)
        setIsHintLoading(false)
      }
    }

    worker.onerror = (e) => {
      console.error('Engine worker error:', e)
      setIsAIThinking(false)
      setIsHintLoading(false)
    }

    // Load existing game if any
    loadGame(gameId).then(existing => {
      if (existing) {
        // Restore game state
        let b = createEmptyBoard()
        let h = getZobristHash(b)
        for (const move of existing.moves) {
          b = placeStone(b, move.position, move.color)
          h = updateHash(h, move.position.row, move.position.col, move.color)
        }
        hashRef.current = h
        moveCountRef.current = existing.moves.length
        setBoard(b)
        setMoves(existing.moves)
        setStatus(existing.status)
        if (existing.status !== 'playing') {
          setCurrentColor(existing.moves.length % 2 === 0 ? 'black' : 'white')
        } else {
          const lastColor = existing.moves.length > 0 ? existing.moves[existing.moves.length - 1].color : null
          setCurrentColor(lastColor === 'black' ? 'white' : 'black')
        }
        if (existing.analysis) setHasAnalysis(true)
      }
    })

    return () => worker.terminate()
  }, [gameId])

  function handleAIMove(pos: Position) {
    const b = boardRef.current
    const color = currentColorRef.current

    if (b[pos.row][pos.col] !== null) return
    if (statusRef.current !== 'playing') return

    const newBoard = placeStone(b, pos, color)
    const newHash = updateHash(hashRef.current, pos.row, pos.col, color)
    hashRef.current = newHash

    const move: Move = { position: pos, color, moveNumber: moveCountRef.current + 1, timestamp: Date.now() }
    moveCountRef.current++

    const newMoves = [...movesRef.current, move]
    setMoves(newMoves)
    setBoard(newBoard)

    const didWin = checkWin(newBoard, pos, color)
    if (didWin) {
      const line = getWinningLine(newBoard, pos, color)
      if (line) setWinningLine(line)
      const newStatus: GameStatus = color === 'black' ? 'black_wins' : 'white_wins'
      setStatus(newStatus)
      setCurrentColor(color === 'black' ? 'white' : 'black')
      persistGame(newMoves, newBoard, newStatus)
    } else if (isBoardFull(newBoard)) {
      setStatus('draw')
      setCurrentColor(color === 'black' ? 'white' : 'black')
      persistGame(newMoves, newBoard, 'draw')
    } else {
      const nextColor: Color = color === 'black' ? 'white' : 'black'
      setCurrentColor(nextColor)
      persistGame(newMoves, newBoard, 'playing')
    }
  }

  // When it's AI's turn, trigger the worker
  useEffect(() => {
    if (status !== 'playing') return
    if (currentColor === playerColor) return
    if (isAIThinking) return

    const timer = setTimeout(() => {
      setIsAIThinking(true)
      engineWorkerRef.current?.postMessage({
        type: 'GET_MOVE',
        board: boardRef.current,
        color: currentColor,
        strength: aiStrength,
        moveCount: moveCountRef.current,
        hash: hashRef.current,
      })
    }, 200) // Small delay for UX

    return () => clearTimeout(timer)
  }, [currentColor, status, playerColor, aiStrength, isAIThinking])

  function onPlayerMove(pos: Position) {
    if (status !== 'playing') return
    if (currentColor !== playerColor) return
    if (isAIThinking) return
    if (board[pos.row][pos.col] !== null) return

    const newBoard = placeStone(board, pos, playerColor)
    const newHash = updateHash(hashRef.current, pos.row, pos.col, playerColor)
    hashRef.current = newHash

    const move: Move = { position: pos, color: playerColor, moveNumber: moveCountRef.current + 1, timestamp: Date.now() }
    moveCountRef.current++

    setHintMove(null)
    setHintExplanation('')

    const newMoves = [...moves, move]
    setMoves(newMoves)
    setBoard(newBoard)

    const didWin = checkWin(newBoard, pos, playerColor)
    if (didWin) {
      const line = getWinningLine(newBoard, pos, playerColor)
      if (line) setWinningLine(line)
      const newStatus: GameStatus = playerColor === 'black' ? 'black_wins' : 'white_wins'
      setStatus(newStatus)
      setCurrentColor(playerColor === 'black' ? 'white' : 'black')
      persistGame(newMoves, newBoard, newStatus)
    } else if (isBoardFull(newBoard)) {
      setStatus('draw')
      setCurrentColor(playerColor === 'black' ? 'white' : 'black')
      persistGame(newMoves, newBoard, 'draw')
    } else {
      const nextColor: Color = playerColor === 'black' ? 'white' : 'black'
      setCurrentColor(nextColor)
      persistGame(newMoves, newBoard, 'playing')
    }
  }

  function persistGame(gameMoves: Move[], _board: typeof board, gameStatus: GameStatus) {
    const result =
      gameStatus === 'black_wins' ? 'black' :
      gameStatus === 'white_wins' ? 'white' :
      gameStatus === 'draw' ? 'draw' :
      gameStatus === 'resigned' ? 'resigned' :
      (gameMoves.length > 0 ? gameMoves[gameMoves.length - 1].color : 'black')

    const record: GameRecord = {
      id: gameId,
      moves: gameMoves,
      result: result as GameRecord['result'],
      playerColor,
      aiStrength,
      timestamp: Date.now(),
      status: gameStatus,
    }
    saveGame(record).catch(console.error)
  }

  function onResign() {
    if (status !== 'playing') return
    const newStatus: GameStatus = 'resigned'
    setStatus(newStatus)
    persistGame(moves, board, newStatus)
  }

  function onRequestHint() {
    if (status !== 'playing') return
    if (currentColor !== playerColor) return
    setIsHintLoading(true)
    engineWorkerRef.current?.postMessage({
      type: 'GET_HINT',
      board,
      color: playerColor,
      moveCount: moveCountRef.current,
      hash: hashRef.current,
    })
  }

  function onAnalyze() {
    if (moves.length === 0) return
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    const worker = new Worker(new URL('../../../workers/analysis.worker.ts', import.meta.url))
    analysisWorkerRef.current = worker

    worker.onmessage = (e) => {
      const msg = e.data
      if (msg.type === 'PROGRESS') {
        setAnalysisProgress(msg.percent)
      } else if (msg.type === 'ANALYSIS_COMPLETE') {
        setIsAnalyzing(false)
        setHasAnalysis(true)
        // Save analysis to DB
        loadGame(gameId).then(game => {
          if (game) {
            game.analysis = msg.report
            saveGame(game).catch(console.error)
          }
        })
        worker.terminate()
      } else if (msg.type === 'ERROR') {
        setIsAnalyzing(false)
        console.error('Analysis error:', msg.message)
        worker.terminate()
      }
    }

    worker.onerror = (e) => {
      console.error('Analysis worker error:', e)
      setIsAnalyzing(false)
    }

    worker.postMessage({
      type: 'ANALYZE',
      moves: moves.map(m => ({ position: m.position, color: m.color, moveNumber: m.moveNumber })),
      finalBoard: board,
    })
  }

  const gameOver = status !== 'playing'
  const isPlayerTurn = currentColor === playerColor && status === 'playing'

  return (
    <div className="min-h-screen flex" style={{ background: '#0f0f1a' }}>
      {/* Main board area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Board
          board={board}
          moves={moves}
          currentColor={currentColor}
          onMove={onPlayerMove}
          disabled={!isPlayerTurn || isAIThinking}
          hintMove={hintMove}
          winningLine={winningLine}
          lastMove={moves.length > 0 ? moves[moves.length - 1].position : null}
        />

        {gameOver && (
          <div
            className="mt-4 px-6 py-3 rounded-xl text-center font-bold text-xl"
            style={{
              background:
                (status === 'black_wins' && playerColor === 'black') ||
                (status === 'white_wins' && playerColor === 'white')
                  ? '#0f3a0f'
                  : status === 'draw'
                  ? '#1a1a3a'
                  : '#3a0f0f',
              border: `2px solid ${
                (status === 'black_wins' && playerColor === 'black') ||
                (status === 'white_wins' && playerColor === 'white')
                  ? '#00cc44'
                  : status === 'draw'
                  ? '#4444aa'
                  : '#cc0000'
              }`,
              color: '#fff',
            }}
          >
            {status === 'black_wins' && (playerColor === 'black' ? '🏆 You Win!' : 'AI Wins!')}
            {status === 'white_wins' && (playerColor === 'white' ? '🏆 You Win!' : 'AI Wins!')}
            {status === 'draw' && '🤝 Draw!'}
            {status === 'resigned' && '🏳 You Resigned'}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-4 p-4" style={{ width: 300, background: '#16213e', borderLeft: '1px solid #2a2a4a' }}>
        <h2 className="text-lg font-black" style={{ color: '#d4a843' }}>碁 Gomoku</h2>

        <GameHeader
          currentColor={currentColor}
          moveCount={moves.length}
          status={status}
          playerColor={playerColor}
          aiStrength={aiStrength}
          isAIThinking={isAIThinking}
        />

        {status === 'playing' && (
          <HintPanel
            hintMove={hintMove}
            hintExplanation={hintExplanation}
            isLoading={isHintLoading}
            onRequestHint={onRequestHint}
            onDismiss={() => { setHintMove(null); setHintExplanation('') }}
            disabled={!isPlayerTurn || isAIThinking}
          />
        )}

        <GameControls
          status={status}
          gameId={gameId}
          onResign={onResign}
          hasAnalysis={hasAnalysis}
          isAnalyzing={isAnalyzing}
          analysisProgress={analysisProgress}
          onAnalyze={onAnalyze}
        />

        {/* Move history */}
        <div className="flex flex-col gap-1 flex-1 overflow-hidden">
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#d4a843' }}>Moves</h3>
          <div className="flex-1 overflow-y-auto max-h-80">
            <div className="grid grid-cols-2 gap-1">
              {moves.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2 py-1 rounded text-xs"
                  style={{ background: '#0f0f1a' }}
                >
                  <span className="text-gray-600 w-5">{m.moveNumber}.</span>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.color === 'black' ? '#222' : '#ddd', border: m.color === 'black' ? '1px solid #888' : '1px solid #aaa' }} />
                  <span className="text-gray-300">{String.fromCharCode(65 + m.position.col)}{15 - m.position.row}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
