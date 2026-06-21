'use client'
import { MoveClassification } from '@/lib/game/types'

const BADGE_STYLES: Record<MoveClassification, { bg: string; text: string; label: string }> = {
  brilliant: { bg: 'bg-purple-600', text: 'text-white', label: '!! Brilliant' },
  great: { bg: 'bg-teal-500', text: 'text-white', label: '! Great' },
  best: { bg: 'bg-green-600', text: 'text-white', label: 'Best' },
  good: { bg: 'bg-lime-500', text: 'text-white', label: 'Good' },
  inaccuracy: { bg: 'bg-yellow-500', text: 'text-black', label: '?! Inaccuracy' },
  mistake: { bg: 'bg-orange-500', text: 'text-white', label: '? Mistake' },
  blunder: { bg: 'bg-red-600', text: 'text-white', label: '?? Blunder' },
}

export function Badge({ classification, small }: { classification: MoveClassification; small?: boolean }) {
  const style = BADGE_STYLES[classification]
  return (
    <span
      className={`inline-block rounded font-bold ${style.bg} ${style.text} ${
        small ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'
      }`}
    >
      {style.label}
    </span>
  )
}

export function classificationColor(c: MoveClassification): string {
  const map: Record<MoveClassification, string> = {
    brilliant: '#b040ff',
    great: '#00c8c8',
    best: '#00cc44',
    good: '#88dd00',
    inaccuracy: '#ffcc00',
    mistake: '#ff8800',
    blunder: '#ff3333',
  }
  return map[c]
}
