import { Board, Color, Position, AIStrength } from '../game/types'

export type EngineWorkerInMessage =
  | { type: 'GET_MOVE'; board: Board; color: Color; strength: AIStrength; moveCount: number; hash: number }
  | { type: 'GET_HINT'; board: Board; color: Color; moveCount: number; hash: number }

export type EngineWorkerOutMessage =
  | { type: 'MOVE_RESULT'; move: Position; evaluation: number; depth: number }
  | { type: 'HINT_RESULT'; move: Position; evaluation: number; explanation: string }
  | { type: 'ERROR'; message: string }

export type AnalysisWorkerInMessage =
  | { type: 'ANALYZE'; moves: Array<{ position: Position; color: Color; moveNumber: number }>; finalBoard: Board }

export type AnalysisWorkerOutMessage =
  | { type: 'PROGRESS'; percent: number }
  | { type: 'ANALYSIS_COMPLETE'; report: import('../game/types').AnalysisReport }
  | { type: 'ERROR'; message: string }
