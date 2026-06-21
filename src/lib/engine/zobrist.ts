import { BOARD_SIZE } from '../game/board'

// Precomputed Zobrist hash table
// zobristTable[row][col][colorIndex] where colorIndex: 0=black, 1=white
const zobristTable: number[][][] = []

// Use a seeded pseudo-random to get consistent values
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rng = mulberry32(0xDEADBEEF)

function randomInt32(): number {
  return (rng() * 0x100000000) | 0
}

for (let r = 0; r < BOARD_SIZE; r++) {
  zobristTable[r] = []
  for (let c = 0; c < BOARD_SIZE; c++) {
    zobristTable[r][c] = [randomInt32(), randomInt32()]
  }
}

export function getZobristHash(board: (string | null)[][]): number {
  let hash = 0
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = board[r][c]
      if (cell !== null) {
        const idx = cell === 'black' ? 0 : 1
        hash ^= zobristTable[r][c][idx]
      }
    }
  }
  return hash
}

export function updateHash(hash: number, row: number, col: number, color: string): number {
  const idx = color === 'black' ? 0 : 1
  return hash ^ zobristTable[row][col][idx]
}
