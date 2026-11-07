import { useEffect, useState } from 'react'
import { fetchInReview } from '@/lib/feedback'

/** true si esta pregunta tiene 3 o más reportes pendientes de personas distintas. */
export function useInReview(questionId: string): boolean {
  const [flagged, setFlagged] = useState(false)
  useEffect(() => {
    let alive = true
    void fetchInReview().then((ids) => alive && setFlagged(ids.has(questionId)))
    return () => {
      alive = false
    }
  }, [questionId])
  return flagged
}
