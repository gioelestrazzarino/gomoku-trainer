'use client'

export function LessonsPanel({ lessons }: { lessons: string[] }) {
  const icons = ['💡', '📌', '🎯']

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: '#0f1a0f', border: '1px solid #1a3a1a' }}
    >
      <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#00cc44' }}>
        Top Lessons From This Game
      </h3>
      <div className="flex flex-col gap-3">
        {lessons.map((lesson, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-lg mt-0.5">{icons[i] || '•'}</span>
            <p className="text-gray-300 text-sm leading-relaxed">{lesson}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
