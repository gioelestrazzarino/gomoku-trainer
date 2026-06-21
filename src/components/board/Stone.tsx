'use client'
import { Color } from '@/lib/game/types'

interface StoneProps {
  color: Color
  cx: number
  cy: number
  r: number
  animate?: boolean
  dim?: boolean
  highlight?: string
  label?: string
}

export function Stone({ color, cx, cy, r, animate, dim, highlight, label }: StoneProps) {
  const isBlack = color === 'black'
  const gradId = `stone-${isBlack ? 'b' : 'w'}-${Math.round(cx)}-${Math.round(cy)}`

  return (
    <g opacity={dim ? 0.4 : 1}>
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="65%">
          {isBlack ? (
            <>
              <stop offset="0%" stopColor="#555" />
              <stop offset="60%" stopColor="#111" />
              <stop offset="100%" stopColor="#000" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#fff" />
              <stop offset="60%" stopColor="#e8e8e8" />
              <stop offset="100%" stopColor="#ccc" />
            </>
          )}
        </radialGradient>
      </defs>

      {/* Shadow */}
      <circle
        cx={cx + r * 0.1}
        cy={cy + r * 0.15}
        r={r * 0.95}
        fill="rgba(0,0,0,0.35)"
        style={animate ? { animation: 'stoneAppear 0.15s ease-out' } : undefined}
      />

      {/* Stone */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={`url(#${gradId})`}
        stroke={isBlack ? '#000' : '#999'}
        strokeWidth={r * 0.06}
        style={animate ? { animation: 'stoneAppear 0.15s ease-out', transformOrigin: `${cx}px ${cy}px` } : undefined}
      />

      {/* Highlight ring */}
      {highlight && (
        <circle
          cx={cx}
          cy={cy}
          r={r * 0.85}
          fill="none"
          stroke={highlight}
          strokeWidth={r * 0.15}
          opacity={0.7}
        />
      )}

      {/* Label */}
      {label && (
        <text
          x={cx}
          y={cy + r * 0.35}
          textAnchor="middle"
          fontSize={r * 0.9}
          fill={isBlack ? '#fff' : '#333'}
          fontWeight="bold"
          fontFamily="monospace"
        >
          {label}
        </text>
      )}
    </g>
  )
}
