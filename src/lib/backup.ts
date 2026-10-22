import { useProgress } from '@/store/progress'
import { useAnki } from '@/store/anki'
import { useLingo } from '@/store/lingo'

/** Copia completa del progreso del estudiante (mismo formato para el archivo de respaldo y la nube). */
export interface Snapshot {
  app: 'medlogic-enurm'
  version: 3
  data: Record<string, unknown>
  anki: Record<string, unknown>
  lingo: Record<string, unknown>
}

const plain = (o: object) => Object.fromEntries(Object.entries(o).filter(([, v]) => typeof v !== 'function'))

export function takeSnapshot(): Snapshot {
  return { app: 'medlogic-enurm', version: 3, data: plain(useProgress.getState()), anki: plain(useAnki.getState()), lingo: plain(useLingo.getState()) }
}

/** Restaura una copia (acepta también los respaldos v2, sin terminología). */
export function restoreSnapshot(json: unknown): void {
  const s = json as Partial<Snapshot> & { app?: string }
  if (!s || s.app !== 'medlogic-enurm' || !s.data) throw new Error('Respaldo no válido')
  useProgress.getState().importBackup(s.data)
  if (s.anki) useAnki.getState().importBackup(s.anki)
  if (s.lingo) useLingo.getState().importBackup(s.lingo)
}

/** ¿Hay progreso real guardado en este dispositivo? */
export function hasLocalProgress(): boolean {
  const p = useProgress.getState()
  const l = useLingo.getState()
  return Object.keys(p.attempts).length > 0 || p.exams.length > 0 || p.guidesRead.length > 0 || p.xp > 0 || p.profile.completed || Object.keys(l.lessons).length > 0
}

/** Avisa cada vez que cambia cualquier parte del progreso. */
export function onProgressChange(cb: () => void): () => void {
  const subs = [useProgress.subscribe(cb), useAnki.subscribe(cb), useLingo.subscribe(cb)]
  return () => subs.forEach((u) => u())
}
