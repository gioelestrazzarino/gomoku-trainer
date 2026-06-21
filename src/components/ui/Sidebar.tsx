'use client'
import { ReactNode } from 'react'

export function Sidebar({ children }: { children: ReactNode }) {
  return (
    <aside
      className="flex flex-col gap-4 p-4 rounded-xl overflow-y-auto"
      style={{ background: '#16213e', minWidth: 280, maxWidth: 340 }}
    >
      {children}
    </aside>
  )
}

export function SidebarSection({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      {title && (
        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#d4a843' }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}
