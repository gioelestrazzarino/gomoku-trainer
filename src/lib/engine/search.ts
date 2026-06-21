import { Board, Color, Position } from '../game/types'
import { BOARD_SIZE, checkWin, cloneBoard } from '../game/board'
import { evaluateBoard, hasWinningPattern } from './evaluate'
import { updateHash } from './zobrist'
import { getThreatMoves } from './threats'

const WIN_SCORE = 10000000
const DRAW_SCORE = 0

type TTEntry = {
  depth: number
  score: number
  flag: 'exact' | 'lower' | 'upper'
  bestMove?: Position
}

const transpositionTable = new Map<number, TTEntry>()

// History heuristic table
const historyTable: number[][] = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0))

function clearHistory() {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      historyTable[r][c] = 0
    }
  }
}

function getCandidateMoves(board: Board, color: Color, moveCount: number): Position[] {
  const candidates: Position[] = []
  const visited = new Set<string>()

  // First look at threat moves
  const threatMoves = getThreatMoves(board, color)
  for (const pos of threatMoves) {
    const key = `${pos.row},${pos.col}`
    if (!visited.has(key)) {
      visited.add(key)
      candidates.push(pos)
    }
  }

  // Then add moves near existing stones
  const radius = moveCount < 5 ? 2 : 3
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === null) continue
      for (let dr = -radius; dr <= radius; dr++) {
        for (let dc = -radius; dc <= radius; dc++) {
          const nr = r + dr
          const nc = c + dc
          if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) continue
          if (board[nr][nc] !== null) continue
          const key = `${nr},${nc}`
          if (!visited.has(key)) {
            visited.add(key)
            candidates.push({ row: nr, col: nc })
          }
        }
      }
    }
  }

  // If no stones placed yet, use center
  if (candidates.length === 0) {
    const center = Math.floor(BOARD_SIZE / 2)
    candidates.push({ row: center, col: center })
  }

  // Sort by history heuristic
  candidates.sort((a, b) => historyTable[b.row][b.col] - historyTable[a.row][a.col])

  return candidates
}

function alphaBeta(
  board: Board,
  color: Color,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  hash: number,
  moveCount: number
): number {
  // Check transposition table
  const ttEntry = transpositionTable.get(hash)
  if (ttEntry && ttEntry.depth >= depth) {
    if (ttEntry.flag === 'exact') return ttEntry.score
    if (ttEntry.flag === 'lower') alpha = Math.max(alpha, ttEntry.score)
    if (ttEntry.flag === 'upper') beta = Math.min(beta, ttEntry.score)
    if (alpha >= beta) return ttEntry.score
  }

  const currentColor: Color = maximizing ? color : (color === 'black' ? 'white' : 'black')

  // Check for terminal state
  if (hasWinningPattern(board, color)) return WIN_SCORE + depth
  if (hasWinningPattern(board, color === 'black' ? 'white' : 'black')) return -(WIN_SCORE + depth)

  if (depth === 0) {
    return evaluateBoard(board, color)
  }

  const candidates = getCandidateMoves(board, currentColor, moveCount)

  if (candidates.length === 0) return DRAW_SCORE

  let bestScore = maximizing ? -Infinity : Infinity
  let bestMove: Position | undefined

  for (const pos of candidates) {
    board[pos.row][pos.col] = currentColor
    const newHash = updateHash(hash, pos.row, pos.col, currentColor)

    const score = alphaBeta(board, color, depth - 1, alpha, beta, !maximizing, newHash, moveCount + 1)

    board[pos.row][pos.col] = null

    if (maximizing) {
      if (score > bestScore) {
        bestScore = score
        bestMove = pos
      }
      alpha = Math.max(alpha, score)
    } else {
      if (score < bestScore) {
        bestScore = score
        bestMove = pos
      }
      beta = Math.min(beta, score)
    }

    if (alpha >= beta) {
      // Update history heuristic
      historyTable[pos.row][pos.col] += depth * depth
      break
    }
  }

  // Store in transposition table
  const flag: 'exact' | 'lower' | 'upper' =
    bestScore <= alpha ? 'upper' : bestScore >= beta ? 'lower' : 'exact'
  transpositionTable.set(hash, { depth, score: bestScore, flag, bestMove })

  return bestScore
}

export type SearchResult = {
  move: Position
  evaluation: number
  depth: number
}

export function findBestMove(
  board: Board,
  color: Color,
  maxDepth: number,
  hash: number,
  moveCount: number,
  timeLimit: number = 5000
): SearchResult {
  clearHistory()
  // Don't clear transposition table between searches (we want to reuse it)
  // But cap its size
  if (transpositionTable.size > 500000) {
    transpositionTable.clear()
  }

  const startTime = Date.now()
  let bestResult: SearchResult = {
    move: { row: 7, col: 7 },
    evaluation: 0,
    depth: 0,
  }

  // Special case: first move goes to center
  let hasStone = false
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== null) { hasStone = true; break }
    }
    if (hasStone) break
  }
  if (!hasStone) {
    return { move: { row: 7, col: 7 }, evaluation: 0, depth: 0 }
  }

  // Iterative deepening
  for (let depth = 1; depth <= maxDepth; depth++) {
    if (Date.now() - startTime > timeLimit) break

    const candidates = getCandidateMoves(board, color, moveCount)

    // Check immediate win
    for (const pos of candidates) {
      board[pos.row][pos.col] = color
      if (hasWinningPattern(board, color)) {
        board[pos.row][pos.col] = null
        return { move: pos, evaluation: WIN_SCORE, depth }
      }
      board[pos.row][pos.col] = null
    }

    // Check immediate loss (block opponent win)
    const opponent: Color = color === 'black' ? 'white' : 'black'
    for (const pos of candidates) {
      board[pos.row][pos.col] = opponent
      if (hasWinningPattern(board, opponent)) {
        board[pos.row][pos.col] = null
        // Must block here
        return { move: pos, evaluation: -WIN_SCORE / 2, depth }
      }
      board[pos.row][pos.col] = null
    }

    // Aspiration windows
    let alpha = -Infinity
    let beta = Infinity
    if (depth > 2 && bestResult.evaluation !== 0) {
      const window = 500
      alpha = bestResult.evaluation - window
      beta = bestResult.evaluation + window
    }

    let bestScore = -Infinity
    let bestMove = candidates[0]

    for (const pos of candidates) {
      if (Date.now() - startTime > timeLimit) break

      board[pos.row][pos.col] = color
      const newHash = updateHash(hash, pos.row, pos.col, color)

      let score = alphaBeta(board, color, depth - 1, alpha, beta, false, newHash, moveCount + 1)

      board[pos.row][pos.col] = null

      // Re-search if outside aspiration window
      if (score <= alpha || score >= beta) {
        board[pos.row][pos.col] = color
        score = alphaBeta(board, color, depth - 1, -Infinity, Infinity, false, newHash, moveCount + 1)
        board[pos.row][pos.col] = null
        alpha = -Infinity
        beta = Infinity
      }

      if (score > bestScore) {
        bestScore = score
        bestMove = pos
        alpha = Math.max(alpha, score)
      }
    }

    if (bestMove) {
      bestResult = { move: bestMove, evaluation: bestScore, depth }
    }

    if (Math.abs(bestScore) >= WIN_SCORE / 2) break
  }

  return bestResult
}

export function clearTranspositionTable() {
  transpositionTable.clear()
}
