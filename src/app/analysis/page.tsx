import { Suspense } from 'react'
import AnalysisPage from './AnalysisPage'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AnalysisPage />
    </Suspense>
  )
}
