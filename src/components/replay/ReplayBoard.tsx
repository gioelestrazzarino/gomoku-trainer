'use client'
import { useMemo } from 'react'
import { Move, AnalyzedMove, Position } from '@/lib/game/types'
import { createEmptyBoard, placeStone } from '@/lib/game/board'
import { Board } from '@/components/board/Board'

interface ReplayBoardProps {
  moves: Move[]
  currentMove: number
  analyzedMoves?: AnalyzedMove[]
  showBestMove?: boolean
}

export function ReplayBoard({ moves, currentMove, analyzedMoves, showBestMove }: ReplayBoardProps) {
  const board = useMemo(() => {
    let b = createEmptyBoard()
    for (let i = 0; i < currentMove; i++) {
      b = placeStone(b, moves[i].position, moves[i].color)
    }
    return b
  }, [moves, currentMove])

  const lastMove = currentMove > 0 ? moves[currentMove - 1].position : null
  const currentColor = currentMove < moves.length ? moves[currentMove].color : 'black'

  const bestMoveHighlight = useMemo((): Position | null => {
    if (!showBestMove || !analyzedMoves || currentMove === 0) return null
    const am = analyzedMoves[currentMove - 1]
    if (!am) return null
    if (['inaccuracy', 'mistake', 'blunder'].includes(am.classification)) {
      return am.bestMove
    }
    return null
  }, [showBestMove, analyzedMoves, currentMove])

  return (
    <Board
      board={board}
      moves={moves.slice(0, currentMove)}
      currentColor={currentColor}
      disabled
      lastMove={lastMove}
      bestMoveHighlight={bestMoveHighlight}
    />
  )
}
