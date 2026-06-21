import { Board, Color } from '../game/types'
import { BOARD_SIZE } from '../game/board'

// Pattern scores
const SCORES = {
  FIVE: 10000000,
  OPEN_FOUR: 100000,
  CLOSED_FOUR: 10000,
  OPEN_THREE: 5000,
  CLOSED_THREE: 500,
  OPEN_TWO: 100,
  CLOSED_TWO: 10,
}

const DIRECTIONS: [number, number][] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
]

function countInDirection(
  board: Board,
  row: number,
  col: number,
  dr: number,
  dc: number,
  color: Color
): { count: number; openEnds: number } {
  let count = 1
  let openEnds = 0

  // Forward
  let r = row + dr
  let c = col + dc
  while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === color) {
    count++
    r += dr
    c += dc
  }
  if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === null) {
    openEnds++
  }

  // Backward
  r = row - dr
  c = col - dc
  while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === color) {
    count++
    r -= dr
    c -= dc
  }
  if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === null) {
    openEnds++
  }

  return { count, openEnds }
}

function scorePattern(count: number, openEnds: number): number {
  if (count >= 5) return SCORES.FIVE
  if (count === 4) {
    return openEnds >= 1 ? SCORES.OPEN_FOUR : SCORES.CLOSED_FOUR
  }
  if (count === 3) {
    return openEnds === 2 ? SCORES.OPEN_THREE : SCORES.CLOSED_THREE
  }
  if (count === 2) {
    return openEnds === 2 ? SCORES.OPEN_TWO : SCORES.CLOSED_TWO
  }
  return 0
}

// Evaluate the board from the perspective of 'color'
// Returns positive for good position for 'color', negative for bad
export function evaluateBoard(board: Board, color: Color): number {
  const opponent: Color = color === 'black' ? 'white' : 'black'

  // Use a visited set to avoid double-counting
  const visited = new Set<string>()

  let score = 0

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = board[r][c]
      if (cell === null) continue

      for (const [dr, dc] of DIRECTIONS) {
        // Normalize direction to avoid double-counting
        const key = `${r},${c},${dr},${dc}`
        if (visited.has(key)) continue

        // Mark all cells in this line as visited for this direction
        const lineColor = cell
        let nr = r
        let nc = c
        while (
          nr >= 0 && nr < BOARD_SIZE &&
          nc >= 0 && nc < BOARD_SIZE &&
          board[nr][nc] === lineColor
        ) {
          visited.add(`${nr},${nc},${dr},${dc}`)
          nr += dr
          nc += dc
        }

        const { count, openEnds } = countInDirection(board, r, c, dr, dc, lineColor)
        const patternScore = scorePattern(count, openEnds)

        if (lineColor === color) {
          score += patternScore
        } else {
          score -= patternScore * 1.1 // Slightly prefer defense
        }
      }
    }
  }

  // Add positional bonus (center is better)
  const center = Math.floor(BOARD_SIZE / 2)
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = board[r][c]
      if (cell === null) continue
      const dist = Math.max(Math.abs(r - center), Math.abs(c - center))
      const posBonus = Math.max(0, 5 - dist) * 2
      if (cell === color) {
        score += posBonus
      } else {
        score -= posBonus
      }
    }
  }

  return score
}

export function hasWinningPattern(board: Board, color: Color): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== color) continue
      for (const [dr, dc] of DIRECTIONS) {
        const { count } = countInDirection(board, r, c, dr, dc, color)
        if (count >= 5) return true
      }
    }
  }
  return false
}

export { SCORES, DIRECTIONS }
