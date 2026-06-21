'use client'

export function ProgressBar({ percent, label }: { percent: number; label?: string }) {
  return (
    <div className="w-full">
      {label && <p className="text-sm text-gray-400 mb-1">{label}</p>}
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 rounded-full transition-all duration-300"
          style={{
            width: `${Math.min(100, Math.max(0, percent))}%`,
            background: 'linear-gradient(90deg, #d4a843, #f0c060)',
          }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1 text-right">{Math.round(percent)}%</p>
    </div>
  )
}
