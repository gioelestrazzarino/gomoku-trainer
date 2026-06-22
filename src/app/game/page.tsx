import { Suspense } from 'react'
import GamePage from './GamePage'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GamePage />
    </Suspense>
  )
}
