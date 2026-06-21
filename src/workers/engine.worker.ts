import { findBestMove } from '../lib/engine/search'
import { getThreatMoves } from '../lib/engine/threats'
import { AIStrength, Board, Color } from '../lib/game/types'

const WIN_SCORE = 10000000

type EngineMsg =
  | { type: 'GET_MOVE'; board: Board; color: Color; strength: AIStrength; moveCount: number; hash: number }
  | { type: 'GET_HINT'; board: Board; color: Color; moveCount: number; hash: number }

function getDepthAndTime(strength: AIStrength): { maxDepth: number; timeLimit: number; randomRate: number } {
  switch (strength) {
    case 1: return { maxDepth: 4, timeLimit: 2000, randomRate: 0.20 }
    case 2: return { maxDepth: 6, timeLimit: 4000, randomRate: 0.00 }
    case 3: return { maxDepth: 8, timeLimit: 8000, randomRate: 0.00 }
    default: return { maxDepth: 6, timeLimit: 4000, randomRate: 0.00 }
  }
}

function getHintExplanation(evaluation: number, color: Color): string {
  const abs = Math.abs(evaluation)
  if (evaluation > WIN_SCORE / 2) return `This move wins the game! It creates an unstoppable threat for ${color}.`
  if (evaluation < -WIN_SCORE / 2) return `The position is already lost, but this move delays the defeat longest.`
  if (abs > 50000) return `Strong attacking move that creates multiple threats simultaneously.`
  if (abs > 10000) return `This move builds a strong threat that the opponent must respond to.`
  if (abs > 2000) return `Solid positional move that improves your structure.`
  return `Best move according to the engine's analysis.`
}

self.onmessage = (event: MessageEvent<EngineMsg>) => {
  const msg = event.data

  try {
    if (msg.type === 'GET_MOVE') {
      const { board, color, strength, moveCount, hash } = msg
      const { maxDepth, timeLimit, randomRate } = getDepthAndTime(strength)

      const result = findBestMove(board, color, maxDepth, hash, moveCount, timeLimit)

      // For training mode, occasionally pick a suboptimal move
      if (randomRate > 0 && Math.random() < randomRate) {
        const candidates = getThreatMoves(board, color)
        if (candidates.length > 1) {
          const idx = Math.floor(Math.random() * Math.min(3, candidates.length))
          const suboptimal = candidates[idx]
          if (suboptimal) {
            self.postMessage({ type: 'MOVE_RESULT', move: suboptimal, evaluation: result.evaluation * 0.8, depth: result.depth })
            return
          }
        }
      }

      self.postMessage({ type: 'MOVE_RESULT', move: result.move, evaluation: result.evaluation, depth: result.depth })
    } else if (msg.type === 'GET_HINT') {
      const { board, color, moveCount, hash } = msg
      const result = findBestMove(board, color, 6, hash, moveCount, 3000)
      const explanation = getHintExplanation(result.evaluation, color)
      self.postMessage({ type: 'HINT_RESULT', move: result.move, evaluation: result.evaluation, explanation })
    }
  } catch (e) {
    self.postMessage({ type: 'ERROR', message: String(e) })
  }
}
