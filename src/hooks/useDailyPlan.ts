import { useEffect, useMemo, useRef } from 'react'
import { useProgress } from '@/store/progress'
import { useBank } from '@/store/bank'
import { buildDailyPlan, specialtyPriorities, taskProgress, type PlanInput } from '@/lib/plan'
import { specialtyStats } from '@/lib/stats'
import { BUILTIN_CARDS } from '@/data/flashcards'
import { isDue } from '@/lib/srs'
import { addDays, dayKey } from '@/lib/utils'
import { celebrate, playSound } from '@/lib/fx'
import { toast } from '@/store/toasts'
import type { DailyPlan, PlanTask } from '@/types'

/** Entradas comunes del plan (prioridades, tarjetas y errores pendientes). */
export function usePlanInputs(): Omit<PlanInput, 'date'> {
  const { profile, attempts, srs, customCards, guidesRead, settings } = useProgress()
  const questions = useBank((s) => s.questions)
  const byId = useBank((s) => s.byId)
  const counts = useBank((s) => s.specialtyCounts)

  return useMemo(() => {
    const stats = specialtyStats(attempts, questions)
    const cards = [...BUILTIN_CARDS, ...customCards]
    return {
      profile,
      examDate: settings.examDate,
      priorities: specialtyPriorities(profile, stats, counts),
      dueCards: cards.filter((c) => srs[c.id] && isDue(srs[c.id])).length,
      newCards: cards.filter((c) => !srs[c.id]).length,
      failedCount: Object.entries(attempts).filter(([id, a]) => !a.lastCorrect && byId.has(id)).length,
      guidesRead,
    }
  }, [profile, attempts, srs, customCards, guidesRead, settings.examDate, questions, byId, counts])
}

export interface TaskWithProgress extends PlanTask {
  done: number
  complete: boolean
}

/**
 * Plan del día. Se genera una vez por día (o al cambiar el perfil) y se congela,
 * para que las tareas no cambien mientras el estudiante avanza.
 */
export function useDailyPlan() {
  const inputs = usePlanInputs()
  const snapshot = useProgress((s) => s.planSnapshot)
  const setSnapshot = useProgress((s) => s.setPlanSnapshot)
  const activity = useProgress((s) => s.activity)
  const guidesRead = useProgress((s) => s.guidesRead)
  const exams = useProgress((s) => s.exams)
  const planChecks = useProgress((s) => s.planChecks)
  const toggleCheck = useProgress((s) => s.togglePlanCheck)
  const markPlanDone = useProgress((s) => s.markPlanDone)
  const today = dayKey()
  const checks = planChecks[today] ?? []

  const fresh = !snapshot || snapshot.plan.date !== today || snapshot.profileAt !== inputs.profile.updatedAt
  const plan: DailyPlan = useMemo(() => (fresh ? buildDailyPlan({ ...inputs, date: new Date() }) : snapshot!.plan), [fresh, inputs, snapshot])

  useEffect(() => {
    if (fresh) setSnapshot({ plan, profileAt: inputs.profile.updatedAt })
  }, [fresh, plan, inputs.profile.updatedAt, setSnapshot])

  const examsToday = exams.filter((e) => dayKey(e.date) === today).length
  const tasks: TaskWithProgress[] = plan.tasks.map((t) => ({ ...t, ...taskProgress(t, { today: activity[today], guidesRead, examsToday, checks }) }))
  const required = tasks.filter((t) => !t.optional)
  const completed = required.filter((t) => t.complete).length
  const ratio = required.length ? completed / required.length : 0
  const allDone = required.length > 0 && completed === required.length

  const celebrated = useRef(false)
  useEffect(() => {
    if (allDone && !celebrated.current) {
      celebrated.current = true
      if (markPlanDone()) {
        celebrate('big')
        playSound('win')
        toast({ kind: 'success', title: '¡Plan de hoy completado!', body: '+50 XP. Mañana te espera un plan nuevo.' })
      }
    }
  }, [allDone, markPlanDone])

  const regenerate = () => setSnapshot({ plan: buildDailyPlan({ ...inputs, date: new Date() }), profileAt: inputs.profile.updatedAt })

  return { plan, tasks, completed, total: required.length, ratio, allDone, toggleCheck, regenerate }
}

/** Vista previa de los próximos días (no se congela). */
export function useWeekPreview(days = 7) {
  const inputs = usePlanInputs()
  return useMemo(() => Array.from({ length: days }, (_, i) => buildDailyPlan({ ...inputs, date: addDays(new Date(), i) })), [inputs, days])
}
