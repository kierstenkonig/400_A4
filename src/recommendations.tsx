import { useLocation } from 'react-router-dom'

export default function Recommendations() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const query = params.get('query') || ''

  return (
    <div>
      <h1>Recommendations for "{query}"</h1>
    </div>
  )
}