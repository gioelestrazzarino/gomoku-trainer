import { Board, Color, Position } from '../game/types'
import { BOARD_SIZE } from '../game/board'
import { DIRECTIONS } from './evaluate'

export type ThreatType = 'five' | 'open_four' | 'closed_four' | 'open_three' | 'closed_three'

export type Threat = {
  type: ThreatType
  positions: Position[]
  color: Color
}

function getLine(
  board: Board,
  row: number,
  col: number,
  dr: number,
  dc: number,
  length: number
): (Color | null)[] {
  const line: (Color | null)[] = []
  for (let i = 0; i < length; i++) {
    const r = row + dr * i
    const c = col + dc * i
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
      line.push('black') // treat out-of-bounds as blocked
    } else {
      line.push(board[r][c])
    }
  }
  return line
}

export function findThreats(board: Board, color: Color): Threat[] {
  const threats: Threat[] = []
  const opponent: Color = color === 'black' ? 'white' : 'black'

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      for (const [dr, dc] of DIRECTIONS) {
        // Check patterns starting at (r,c) in direction (dr,dc)
        const line = getLine(board, r, c, dr, dc, 6)

        // Five in a row
        if (line.slice(0, 5).every(x => x === color)) {
          threats.push({
            type: 'five',
            positions: Array.from({ length: 5 }, (_, i) => ({
              row: r + dr * i,
              col: c + dc * i,
            })),
            color,
          })
          continue
        }

        // Open four: _XXXX_
        if (
          line[0] === null &&
          line[1] === color && line[2] === color && line[3] === color && line[4] === color &&
          line[5] === null
        ) {
          threats.push({
            type: 'open_four',
            positions: [1, 2, 3, 4].map(i => ({ row: r + dr * i, col: c + dc * i })),
            color,
          })
        }

        // Closed four: XXXOX or OXXXX (blocked one end, open other)
        // Pattern: XXXX_ where first cell is blocked by board edge or opponent
        if (
          line[0] === color && line[1] === color && line[2] === color && line[3] === color &&
          line[4] === null
        ) {
          threats.push({
            type: 'closed_four',
            positions: [0, 1, 2, 3].map(i => ({ row: r + dr * i, col: c + dc * i })),
            color,
          })
        }

        // Open three: _XXX_
        if (
          line[0] === null &&
          line[1] === color && line[2] === color && line[3] === color &&
          line[4] === null
        ) {
          threats.push({
            type: 'open_three',
            positions: [1, 2, 3].map(i => ({ row: r + dr * i, col: c + dc * i })),
            color,
          })
        }
      }
    }
  }

  return threats
}

// Get candidate threat moves (positions that create or block threats)
export function getThreatMoves(board: Board, color: Color): Position[] {
  const opponent: Color = color === 'black' ? 'white' : 'black'
  const moves = new Set<string>()
  const positions: Position[] = []

  function addMove(pos: Position) {
    const key = `${pos.row},${pos.col}`
    if (!moves.has(key) && board[pos.row][pos.col] === null) {
      moves.add(key)
      positions.push(pos)
    }
  }

  // Find threatening moves for both colors
  for (const col2 of [color, opponent]) {
    const threats = findThreats(board, col2)
    for (const threat of threats) {
      // Add adjacent empty positions to the threat
      for (const pos of threat.positions) {
        for (const [dr, dc] of DIRECTIONS) {
          for (const d of [-1, 1]) {
            const nr = pos.row + dr * d
            const nc = pos.col + dc * d
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
              addMove({ row: nr, col: nc })
            }
          }
        }
        addMove(pos)
      }
    }
  }

  return positions
}
