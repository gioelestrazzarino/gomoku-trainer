import { Board, Color, Position } from './types'
import { isValidPosition, isEmpty } from './board'

export function isLegalMove(board: Board, pos: Position): boolean {
  if (!isValidPosition(pos)) return false
  if (!isEmpty(board, pos)) return false
  return true
}

export function getOpponent(color: Color): Color {
  return color === 'black' ? 'white' : 'black'
}
