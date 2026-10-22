import { lazy } from 'react'
import { Navigate, useParams } from 'react-router-dom'

const COMPONENTS = {
  contrarreloj: lazy(() => import('./TimeAttack')),
  supervivencia: lazy(() => import('./Survival')),
  'verdadero-falso': lazy(() => import('./TrueFalse')),
  parejas: lazy(() => import('./Memory')),
  pistas: lazy(() => import('./Clues')),
}

export default function GamePage() {
  const { gameId } = useParams()
  const C = COMPONENTS[gameId as keyof typeof COMPONENTS]
  if (!C) return <Navigate to="/juegos" replace />
  return <C />
}
