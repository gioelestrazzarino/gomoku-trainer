import { Board, Color, Move, AnalyzedMove, MoveClassification, AnalysisReport, TurningPoint } from '../game/types'
import { createEmptyBoard, placeStone, checkWin } from '../game/board'
import { findBestMove } from '../engine/search'
import { getZobristHash } from '../engine/zobrist'
import { evaluateBoard } from '../engine/evaluate'
import { generateExplanation } from './explanations'
import { generateLessons } from './lessons'

const WIN_SCORE = 10000000
const ANALYSIS_DEPTH = 4

function classifyMove(
  playerEval: number,
  bestEval: number,
  _color: Color
): MoveClassification {
  // Both from perspective of the player who moved
  const diff = playerEval - bestEval // negative means player was worse than best

  if (diff >= 0) {
    if (bestEval > WIN_SCORE / 2) return 'brilliant'
    if (bestEval > 50000) return 'great'
    return 'best'
  }

  const absDiff = Math.abs(diff)
  if (absDiff < 50) return 'good'
  if (absDiff < 150) return 'inaccuracy'
  if (absDiff < 400) return 'mistake'
  return 'blunder'
}

function evalToProbability(eval_: number, color: Color): number {
  // Convert engine evaluation to win probability (0-100)
  const normalized = Math.max(-WIN_SCORE, Math.min(WIN_SCORE, eval_))
  // Use sigmoid-like mapping
  const x = normalized / 10000
  const prob = 1 / (1 + Math.exp(-x * 0.5))
  return Math.round(prob * 100)
}

export async function analyzeGame(
  moves: Move[],
  onProgress?: (percent: number) => void
): Promise<AnalysisReport> {
  const analyzedMoves: AnalyzedMove[] = []
  const evalHistory: number[] = []
  const winProbHistory: number[] = []

  let board = createEmptyBoard()
  let hash = getZobristHash(board)

  // Compute initial eval
  let currentEval = 0
  evalHistory.push(currentEval)
  winProbHistory.push(50)

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i]
    onProgress?.(Math.round((i / moves.length) * 80))

    const evalBefore = currentEval

    // Find best move at this position
    const bestResult = findBestMove(board, move.color, ANALYSIS_DEPTH, hash, i, 1500)
    const bestMove = bestResult.move
    const bestEval = bestResult.evaluation

    // Place the actual move
    board = placeStone(board, move.position, move.color)
    hash = getZobristHash(board)

    // Evaluate after the move
    const evalAfter = evaluateBoard(board, move.color)

    // Classify from the perspective of the moving player
    // evalAfter is from moving player's perspective
    // bestEval is what the best move would achieve
    const classification = classifyMove(evalAfter, bestEval, move.color)

    currentEval = evalAfter

    const analyzedMove: AnalyzedMove = {
      ...move,
      classification,
      evalBefore,
      evalAfter,
      bestMove,
      bestEval,
    }

    analyzedMoves.push(analyzedMove)
    // Normalize to black's perspective: positive = black winning
    const blackPovEval = move.color === 'black' ? evalAfter : -evalAfter
    evalHistory.push(blackPovEval)
    winProbHistory.push(evalToProbability(blackPovEval, 'black'))
  }

  onProgress?.(85)

  // Find turning points (moves with largest eval shift)
  const turningPoints: TurningPoint[] = []
  for (let i = 1; i < evalHistory.length; i++) {
    const shift = Math.abs(evalHistory[i] - evalHistory[i - 1])
    if (shift > 5000) {
      turningPoints.push({
        moveNumber: i,
        evalShift: shift,
        move: moves[i - 1],
      })
    }
  }
  turningPoints.sort((a, b) => b.evalShift - a.evalShift)
  const topTurningPoints = turningPoints.slice(0, 5)

  onProgress?.(90)

  // Generate explanations for suboptimal moves
  for (const am of analyzedMoves) {
    if (['inaccuracy', 'mistake', 'blunder'].includes(am.classification)) {
      am.explanation = generateExplanation(am)
    }
  }

  onProgress?.(95)

  // Calculate accuracy
  const blackMoves = analyzedMoves.filter(m => m.color === 'black')
  const whiteMoves = analyzedMoves.filter(m => m.color === 'white')

  function calcAccuracy(moves: AnalyzedMove[]): number {
    if (moves.length === 0) return 100
    const scores: Record<MoveClassification, number> = {
      brilliant: 100,
      great: 95,
      best: 100,
      good: 85,
      inaccuracy: 65,
      mistake: 40,
      blunder: 10,
    }
    const avg = moves.reduce((sum, m) => sum + scores[m.classification], 0) / moves.length
    return Math.round(avg)
  }

  const blackAccuracy = calcAccuracy(blackMoves)
  const whiteAccuracy = calcAccuracy(whiteMoves)

  // Generate lessons
  const lessons = generateLessons(analyzedMoves)

  onProgress?.(100)

  return {
    analyzedMoves,
    blackAccuracy,
    whiteAccuracy,
    evalHistory,
    winProbHistory,
    turningPoints: topTurningPoints,
    lessons,
  }
}
