'use client'
import { AnalysisReport as AnalysisReportType, Move } from '@/lib/game/types'
import { EvalGraph } from './EvalGraph'
import { WinProbGraph } from './WinProbGraph'
import { MoveList } from './MoveList'
import { LessonsPanel } from './LessonsPanel'
import { Badge } from '@/components/ui/Badge'

interface AnalysisReportProps {
  report: AnalysisReportType
  currentMove?: number
  onMoveClick?: (idx: number) => void
}

function AccuracyRing({ value, label }: { value: number; label: string }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const dash = (value / 100) * circ
  const color = value >= 80 ? '#00cc44' : value >= 60 ? '#ffcc00' : '#ff3333'

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={70} height={70}>
        <circle cx={35} cy={35} r={r} fill="none" stroke="#2a2a4a" strokeWidth={6} />
        <circle
          cx={35}
          cy={35}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform="rotate(-90 35 35)"
        />
        <text x={35} y={40} textAnchor="middle" fill={color} fontSize={14} fontWeight="bold">
          {value}%
        </text>
      </svg>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  )
}

export function AnalysisReportView({ report, currentMove, onMoveClick }: AnalysisReportProps) {
  const { analyzedMoves, blackAccuracy, whiteAccuracy, evalHistory, winProbHistory, turningPoints, lessons } = report

  const counts = {
    brilliant: 0, great: 0, best: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0
  }
  for (const m of analyzedMoves) counts[m.classification]++

  return (
    <div className="flex flex-col gap-6">
      {/* Accuracy */}
      <div
        className="rounded-xl p-4"
        style={{ background: '#0f0f1a', border: '1px solid #2a2a4a' }}
      >
        <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#d4a843' }}>
          Accuracy
        </h3>
        <div className="flex justify-around">
          <AccuracyRing value={blackAccuracy} label="⚫ Black" />
          <AccuracyRing value={whiteAccuracy} label="⚪ White" />
        </div>
      </div>

      {/* Move summary */}
      <div
        className="rounded-xl p-4"
        style={{ background: '#0f0f1a', border: '1px solid #2a2a4a' }}
      >
        <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#d4a843' }}>
          Move Summary
        </h3>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(counts) as Array<keyof typeof counts>).map(cls =>
            counts[cls] > 0 ? (
              <div key={cls} className="flex items-center gap-1">
                <Badge classification={cls} small />
                <span className="text-gray-400 text-xs">×{counts[cls]}</span>
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* Eval graph */}
      <div
        className="rounded-xl p-4"
        style={{ background: '#0f0f1a', border: '1px solid #2a2a4a' }}
      >
        <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#d4a843' }}>
          Evaluation
        </h3>
        <EvalGraph evalHistory={evalHistory} currentMove={currentMove} onMoveClick={onMoveClick} />
        <div className="mt-2">
          <WinProbGraph winProbHistory={winProbHistory} currentMove={currentMove} onMoveClick={onMoveClick} />
        </div>
      </div>

      {/* Turning points */}
      {turningPoints.length > 0 && (
        <div
          className="rounded-xl p-4"
          style={{ background: '#0f0f1a', border: '1px solid #2a2a4a' }}
        >
          <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#d4a843' }}>
            Turning Points
          </h3>
          <div className="flex flex-col gap-2">
            {turningPoints.map((tp, i) => (
              <button
                key={i}
                onClick={() => onMoveClick?.(tp.moveNumber)}
                className="flex items-center gap-3 p-2 rounded text-left hover:opacity-80 transition-all"
                style={{ background: '#16213e' }}
              >
                <span className="text-gray-500 text-xs w-16 shrink-0">Move {tp.moveNumber}</span>
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: tp.move.color === 'black' ? '#111' : '#eee', border: '1px solid #666' }}
                />
                <span className="text-gray-300 text-xs">
                  {String.fromCharCode(65 + tp.move.position.col)}{15 - tp.move.position.row}
                </span>
                <span className="text-xs ml-auto" style={{ color: '#ff8800' }}>
                  Δ{Math.round(tp.evalShift / 100) * 100}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lessons */}
      <LessonsPanel lessons={lessons} />

      {/* Move list */}
      <div
        className="rounded-xl p-4"
        style={{ background: '#0f0f1a', border: '1px solid #2a2a4a' }}
      >
        <MoveList
          analyzedMoves={analyzedMoves}
          currentMove={currentMove}
          onMoveClick={onMoveClick}
        />
      </div>
    </div>
  )
}
