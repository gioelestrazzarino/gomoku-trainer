import { AnalyzedMove, MoveClassification } from '../game/types'

export function generateLessons(moves: AnalyzedMove[]): string[] {
  const lessons: string[] = []

  const blunders = moves.filter(m => m.classification === 'blunder')
  const mistakes = moves.filter(m => m.classification === 'mistake')
  const inaccuracies = moves.filter(m => m.classification === 'inaccuracy')
  const brilliant = moves.filter(m => m.classification === 'brilliant')
  const best = moves.filter(m => m.classification === 'best')

  // Check for missed winning moves (blunders when ahead)
  const missedWins = blunders.filter(m => m.evalBefore > 50000)
  if (missedWins.length > 0) {
    lessons.push(
      `You missed ${missedWins.length} winning continuation${missedWins.length > 1 ? 's' : ''}. Practice identifying forced win sequences — look for positions where you can create two simultaneous threats (double four or open four + open three).`
    )
  }

  // Defense awareness
  const defenseFailures = blunders.filter(m => m.evalAfter < -50000 && m.evalBefore > -50000)
  if (defenseFailures.length > 0) {
    lessons.push(
      `Defensive awareness needs work. You missed critical blocking moves ${defenseFailures.length} time${defenseFailures.length > 1 ? 's' : ''}. Always check if your opponent has an open four or double three threats before playing your own move.`
    )
  }

  // Pattern recognition
  if (mistakes.length + blunders.length > moves.length * 0.3) {
    lessons.push(
      `Focus on pattern recognition. More than 30% of your moves were mistakes or blunders. Study the "open three" and "open four" patterns — recognizing these threats automatically is the foundation of strong Gomoku play.`
    )
  } else if (inaccuracies.length > moves.length * 0.4) {
    lessons.push(
      `Your play is solid but can be refined. Many of your moves were inaccuracies — small positional errors that accumulate over the game. Focus on maximizing each move's utility by building threats while staying connected.`
    )
  }

  // Positive feedback
  if (brilliant.length > 0) {
    lessons.push(
      `Excellent! You found ${brilliant.length} brilliant move${brilliant.length > 1 ? 's' : ''} — non-obvious winning plays. This shows strong tactical vision. Continue to look for fork attacks and multi-threat combinations.`
    )
  }

  // Opening advice
  const openingMoves = moves.filter(m => m.moveNumber <= 6)
  const openingErrors = openingMoves.filter(
    m => m.classification === 'mistake' || m.classification === 'blunder'
  )
  if (openingErrors.length > 0) {
    lessons.push(
      `Opening improvement needed. In Gomoku, the first few moves establish your formation. Aim for center-oriented play and avoid isolated stones. Build formations that can grow in multiple directions.`
    )
  }

  // Generic lessons if we don't have enough
  if (lessons.length < 3) {
    if (!lessons.some(l => l.includes('threat'))) {
      lessons.push(
        `Always count threats before each move. Ask: "Does my opponent have an open four? A double three? A closed four?" Answering these questions takes seconds but prevents most blunders.`
      )
    }
    if (lessons.length < 3) {
      lessons.push(
        `Study double-threat positions. The strongest Gomoku moves create two threats simultaneously, forcing the opponent to respond to one while you complete the other. Look for fork patterns in your games.`
      )
    }
    if (lessons.length < 3) {
      lessons.push(
        `Good game! Keep practicing against stronger AI settings to continue improving. Reviewing your mistakes through analysis is the fastest path to mastery.`
      )
    }
  }

  return lessons.slice(0, 3)
}
