export type Color = 'black' | 'white'
export type Board = (Color | null)[][]
export type Position = { row: number; col: number }

export type Move = {
  position: Position
  color: Color
  moveNumber: number
  timestamp?: number
}

export type MoveClassification =
  | 'brilliant'
  | 'great'
  | 'best'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder'

export type AnalyzedMove = Move & {
  classification: MoveClassification
  evalBefore: number
  evalAfter: number
  bestMove: Position
  bestEval: number
  explanation?: string
}

export type TurningPoint = {
  moveNumber: number
  evalShift: number
  move: Move
}

export type AnalysisReport = {
  analyzedMoves: AnalyzedMove[]
  blackAccuracy: number
  whiteAccuracy: number
  evalHistory: number[]
  winProbHistory: number[]
  turningPoints: TurningPoint[]
  lessons: string[]
}

export type AIStrength = 1 | 2 | 3

export type GameStatus = 'playing' | 'black_wins' | 'white_wins' | 'draw' | 'resigned'

export type GameRecord = {
  id: string
  moves: Move[]
  result: 'black' | 'white' | 'draw' | 'resigned'
  playerColor: Color
  aiStrength: AIStrength
  timestamp: number
  analysis?: AnalysisReport
  status: GameStatus
}

export type GameState = {
  board: Board
  currentColor: Color
  moves: Move[]
  status: GameStatus
  winner?: Color
}
