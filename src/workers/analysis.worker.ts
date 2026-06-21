import { analyzeGame } from '../lib/analysis/analyzer'
import { Move, Board } from '../lib/game/types'
import { Position } from '../lib/game/types'

type AnalysisMsg = {
  type: 'ANALYZE'
  moves: Array<{ position: Position; color: 'black' | 'white'; moveNumber: number }>
  finalBoard: Board
}

self.onmessage = async (event: MessageEvent<AnalysisMsg>) => {
  const msg = event.data
  if (msg.type !== 'ANALYZE') return

  try {
    const moves: Move[] = msg.moves.map(m => ({
      position: m.position,
      color: m.color,
      moveNumber: m.moveNumber,
    }))

    const report = await analyzeGame(moves, (percent) => {
      self.postMessage({ type: 'PROGRESS', percent })
    })

    self.postMessage({ type: 'ANALYSIS_COMPLETE', report })
  } catch (e) {
    self.postMessage({ type: 'ERROR', message: String(e) })
  }
}
