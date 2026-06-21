import AnalysisPage from './AnalysisPage'

export function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

export default function Page() {
  return <AnalysisPage />
}
