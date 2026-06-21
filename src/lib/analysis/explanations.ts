import { AnalyzedMove } from '../game/types'

function toCoord(row: number, col: number): string {
  return `${String.fromCharCode(65 + col)}${15 - row}`
}

export function generateExplanation(move: AnalyzedMove): string {
  const { classification, color, evalBefore, evalAfter, bestEval } = move
  const opponent = color === 'black' ? 'White' : 'Black'
  const diff = Math.abs(evalAfter - bestEval)
  const best = toCoord(move.bestMove.row, move.bestMove.col)
  const played = toCoord(move.position.row, move.position.col)

  if (classification === 'blunder') {
    if (evalBefore > 50000 && evalAfter < evalBefore / 2) {
      return `Playing ${played} threw away a winning advantage. ${best} maintained the forcing sequence. Missing forced wins is the most common cause of lost games — look for double threats and open fours first.`
    }
    if (Math.abs(evalAfter) > 50000 && evalAfter < 0) {
      return `${played} allowed ${opponent} to establish a decisive threat. Blocking at ${best} was the correct defensive move. Always scan for your opponent's four-in-a-row threats before playing.`
    }
    return `${played} loses significant ground. The engine strongly prefers ${best} here. Before each move, check for forced sequences and unblocked threats on both sides.`
  }

  if (classification === 'mistake') {
    if (diff > 200) {
      return `${played} misses an important opportunity. The move at ${best} would have created a more dangerous threat while staying solid. Prioritize moves that attack and defend simultaneously.`
    }
    return `${played} is off the optimal path. The engine prefers ${best}, which builds a stronger multi-directional structure. Consider how each move creates simultaneous threats.`
  }

  if (classification === 'inaccuracy') {
    return `${played} is a minor inaccuracy. ${best} was slightly stronger, creating better connectivity and threat potential. Small improvements like this add up over the course of a game.`
  }

  return `${played} could be slightly improved. Consider ${best} as an alternative.`
}
