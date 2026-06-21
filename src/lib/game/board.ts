import { Board, Color, Position } from './types'

export const BOARD_SIZE = 15

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null))
}

export function cloneBoard(board: Board): Board {
  return board.map(row => [...row])
}

export function placeStone(board: Board, pos: Position, color: Color): Board {
  const newBoard = cloneBoard(board)
  newBoard[pos.row][pos.col] = color
  return newBoard
}

export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < BOARD_SIZE && pos.col >= 0 && pos.col < BOARD_SIZE
}

export function isEmpty(board: Board, pos: Position): boolean {
  return board[pos.row][pos.col] === null
}

const DIRECTIONS: [number, number][] = [
  [0, 1],   // horizontal
  [1, 0],   // vertical
  [1, 1],   // diagonal down-right
  [1, -1],  // diagonal down-left
]

export function checkWin(board: Board, pos: Position, color: Color): boolean {
  for (const [dr, dc] of DIRECTIONS) {
    let count = 1
    // Forward
    for (let i = 1; i < 5; i++) {
      const r = pos.row + dr * i
      const c = pos.col + dc * i
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break
      if (board[r][c] !== color) break
      count++
    }
    // Backward
    for (let i = 1; i < 5; i++) {
      const r = pos.row - dr * i
      const c = pos.col - dc * i
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break
      if (board[r][c] !== color) break
      count++
    }
    if (count >= 5) return true
  }
  return false
}

export function isBoardFull(board: Board): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === null) return false
    }
  }
  return true
}

export function getWinningLine(board: Board, pos: Position, color: Color): Position[] | null {
  for (const [dr, dc] of DIRECTIONS) {
    const line: Position[] = [pos]
    for (let i = 1; i < BOARD_SIZE; i++) {
      const r = pos.row + dr * i
      const c = pos.col + dc * i
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break
      if (board[r][c] !== color) break
      line.push({ row: r, col: c })
    }
    for (let i = 1; i < BOARD_SIZE; i++) {
      const r = pos.row - dr * i
      const c = pos.col - dc * i
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break
      if (board[r][c] !== color) break
      line.unshift({ row: r, col: c })
    }
    if (line.length >= 5) return line
  }
  return null
}

// Star point positions (hoshi) - 0-indexed
export const STAR_POINTS: Position[] = [
  { row: 3, col: 3 },
  { row: 3, col: 11 },
  { row: 7, col: 7 },
  { row: 11, col: 3 },
  { row: 11, col: 11 },
]
