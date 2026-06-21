import { Suspense } from 'react'
import GamePage from './GamePage'

export function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GamePage />
    </Suspense>
  )
}
