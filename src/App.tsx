import { createElement, lazy, Suspense, useCallback, useEffect, useState, type ComponentType } from 'react'
import { HashRouter, Outlet, Route, Routes } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Toaster } from '@/components/ui/Toaster'
import { useBank } from '@/store/bank'
import { useAnki } from '@/store/anki'
import { seedSpecialtiesSeen, useProgress } from '@/store/progress'
import { useThemeSync } from '@/hooks/useTheme'
import { useStudyTimer } from '@/hooks/useStudyTimer'
import { useAuth } from '@/store/auth'
import { startSync } from '@/lib/sync'
import { SyncConflict } from '@/components/SyncConflict'
import { PlanReveal } from '@/components/PlanReveal'
import { VercelInsights } from '@/components/VercelInsights'
import { motionAllowed } from '@/lib/fx'

/**
 * Varias páginas de un mismo módulo diferido. Con un `lazy` por página, la segunda volvía a pasar por
 * Suspense aunque el módulo ya estuviera cargado, y React dejaba el esqueleto ~0,4 s (al entregar un
 * simulacro, por ejemplo). Ahora, si el módulo ya llegó, la página se pinta directo.
 */
function lazyModule<M>(load: () => Promise<M>) {
  let mod: M | undefined
  const ready = () => load().then((m) => (mod = m))
  return <P extends object>(pick: (m: M) => ComponentType<P>) => {
    const Deferred = lazy(() => ready().then((m) => ({ default: pick(m) })))
    return function Page(props: P) {
      // Se elige una vez por montaje: cambiar de componente a mitad de camino reiniciaría la página.
      const [C] = useState<ComponentType<P>>(() => (mod ? pick(mod) : Deferred))
      return createElement(C, props)
    }
  }
}
const examPages = lazyModule(() => import('@/pages/Exam'))
const guidePages = lazyModule(() => import('@/pages/Guides'))

const Dashboard = lazy(() => import('@/pages/Dashboard'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const Landing = lazy(() => import('@/pages/Landing'))
const Practice = lazy(() => import('@/pages/Practice'))
const Exam = examPages((m) => m.default)
const ExamResults = examPages((m) => m.ExamResults)
const Review = lazy(() => import('@/pages/Review'))
const Decks = lazy(() => import('@/pages/flashcards/Decks'))
const DeckOverview = lazy(() => import('@/pages/flashcards/Overview'))
const Reviewer = lazy(() => import('@/pages/flashcards/Reviewer'))
const CardBrowser = lazy(() => import('@/pages/flashcards/Browser'))
const CardStats = lazy(() => import('@/pages/flashcards/CardStats'))
const NoteEditor = lazy(() => import('@/components/anki/NoteEditor').then((m) => ({ default: m.NoteEditor })))
const Guides = guidePages((m) => m.default)
const GuideDetail = guidePages((m) => m.GuideDetail)
const Updates = lazy(() => import('@/pages/Updates'))
const Games = lazy(() => import('@/pages/games/Games'))
const GamePage = lazy(() => import('@/pages/games/GamePage'))
const Stats = lazy(() => import('@/pages/Stats'))
const Planner = lazy(() => import('@/pages/Planner'))
const Achievements = lazy(() => import('@/pages/Achievements'))
const Bank = lazy(() => import('@/pages/Bank'))
const Onboarding = lazy(() => import('@/pages/Onboarding'))
const Specialties = lazy(() => import('@/pages/Specialties'))
const SpecialtyDetail = lazy(() => import('@/pages/SpecialtyDetail'))
const Tools = lazy(() => import('@/pages/Tools'))
const PrepGuide = lazy(() => import('@/pages/PrepGuide'))
const Roadmap = lazy(() => import('@/pages/Roadmap'))
const Prompts = lazy(() => import('@/pages/Prompts'))
const AiGuide = lazy(() => import('@/pages/AiGuide'))
const Settings = lazy(() => import('@/pages/Settings'))
const Ranking = lazy(() => import('@/pages/Ranking'))
const NationalExam = lazy(() => import('@/pages/NationalExam'))
const Duel = lazy(() => import('@/pages/Duel'))
const Cases = lazy(() => import('@/pages/Cases'))
const EcgGame = lazy(() => import('@/pages/EcgGame'))
const Account = lazy(() => import('@/pages/Account'))
const LingoPath = lazy(() => import('@/pages/lingo/Path'))
const LingoLesson = lazy(() => import('@/pages/lingo/Lesson'))
const LingoBlitz = lazy(() => import('@/pages/lingo/Blitz'))

/**
 * Tiempo mínimo de la pantalla de carga. Solo cubre el salto del HTML a React: la portada ya está
 * lista en unos 300 ms, así que no tiene sentido hacer esperar más a quien entra.
 */
const BOOT_MIN_MS = 250

/** Misma pantalla de carga que index.html (sus estilos viven allí), sin repetir la entrada y con el pulso en fase. */
function Splash({ onLeft }: { onLeft?: () => void }) {
  const [t0] = useState(() => performance.now())
  const phase = { animationDelay: `-${Math.round(t0 % 1800)}ms` }
  const ring = (offset: number) => ({ animationDelay: `-${Math.round((t0 + offset) % 2400)}ms` })
  useEffect(() => {
    if (!onLeft) return
    const t = setTimeout(onLeft, 700)
    return () => clearTimeout(t)
  }, [onLeft])
  return (
    <div
      className={onLeft ? 'boot boot-cont boot-leave' : 'boot boot-cont'}
      role="status"
      aria-label="Cargando MedLogic ENURM"
      aria-hidden={onLeft ? true : undefined}
    >
      <div className="boot-in">
        <div className="boot-mark">
          <span className="boot-ring" style={ring(0)} />
          <span className="boot-ring" style={ring(1600)} />
          <span className="boot-ring" style={ring(800)} />
          <svg viewBox="0 0 64 64" aria-hidden>
            <defs>
              <linearGradient id="boot-g2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#14bfac" />
                <stop offset="0.55" stopColor="#078377" />
                <stop offset="1" stopColor="#055b53" />
              </linearGradient>
              <radialGradient id="boot-h2" cx="0.28" cy="0.18" r="0.78">
                <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
                <stop offset="0.65" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="64" height="64" rx="18" fill="url(#boot-g2)" />
            <rect width="64" height="64" rx="18" fill="url(#boot-h2)" />
            <rect x="0.5" y="0.5" width="63" height="63" rx="17.5" fill="none" stroke="#fff" strokeOpacity="0.16" />
            <path d="M9 40H15L22 18 32 44 42 18 49 40H52" fill="none" stroke="#fff" strokeOpacity=".22" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
            <path className="boot-line" style={phase} pathLength={100} d="M9 40H15L22 18 32 44 42 18 49 40H52" fill="none" stroke="#fff" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="56" cy="40" r="3.2" fill="#a7f3d0" />
          </svg>
        </div>
        <div className="boot-name">MedLogic</div>
        <div className="boot-sub">ENURM</div>
        <div className="boot-bar">
          <i />
        </div>
      </div>
    </div>
  )
}

/**
 * El banco de preguntas pesa ~1,7 MB: se descarga al entrar a la plataforma, nunca en la portada.
 * Con `block` se espera a tenerlo (páginas que lo necesitan para calcular), sin `block` se muestra
 * la página enseguida y los conteos se actualizan solos cuando llegan.
 */
function BankGate({ block = true }: { block?: boolean }) {
  const status = useBank((s) => s.status)
  const load = useBank((s) => s.load)
  useEffect(() => {
    load().then(() => seedSpecialtiesSeen(useProgress.getState().attempts, useBank.getState().byId))
  }, [load])
  if (block && (status === 'idle' || status === 'loading')) return <Splash />
  return <Outlet />
}

function PageFallback() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-10 w-1/3 rounded-xl" />
      <div className="skeleton h-40 rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="skeleton h-28 rounded-2xl" />
        <div className="skeleton h-28 rounded-2xl" />
        <div className="skeleton h-28 rounded-2xl" />
      </div>
    </div>
  )
}

export default function App() {
  useThemeSync()
  useStudyTimer()
  const reduceMotion = useProgress((s) => s.settings.reduceMotion)
  const [bootWait, setBootWait] = useState(motionAllowed)
  const [bootLeaving, setBootLeaving] = useState(false)

  useEffect(() => {
    if (!bootWait) return
    const t = setTimeout(() => {
      setBootWait(false)
      setBootLeaving(true)
    }, Math.max(0, BOOT_MIN_MS - performance.now()))
    return () => clearTimeout(t)
  }, [bootWait])

  useEffect(() => {
    const stopAuth = useAuth.getState().init()
    const stopSync = startSync()
    return () => {
      stopSync()
      stopAuth()
    }
  }, [])

  useEffect(() => {
    // Migra el progreso de flashcards anterior al sistema tipo Anki (una sola vez).
    const p = useProgress.getState()
    useAnki.getState().migrateLegacy(p.srs, p.customCards)
  }, [])

  const endBoot = useCallback(() => setBootLeaving(false), [])

  return (
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'user'}>
      <HashRouter>
        <Suspense fallback={<Splash />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route element={<BankGate block={false} />}>
              <Route path="/bienvenida" element={<Onboarding />} />
            </Route>
            <Route path="*" element={<NotFound />} />
            <Route path="/terminologia/leccion/:lessonId" element={<LingoLesson />} />
            <Route path="/terminologia/relampago" element={<LingoBlitz />} />
            <Route element={<BankGate />}>
            <Route element={<AppLayout />}>
              <Route path="/inicio" element={<Lazy><Dashboard /></Lazy>} />
              <Route path="/practica" element={<Lazy><Practice /></Lazy>} />
              <Route path="/simulacro" element={<Lazy><Exam /></Lazy>} />
              <Route path="/simulacro/:id" element={<Lazy><ExamResults /></Lazy>} />
              <Route path="/simulacro-nacional" element={<Lazy><NationalExam /></Lazy>} />
              <Route path="/duelo" element={<Lazy><Duel /></Lazy>} />
              <Route path="/duelo/:code" element={<Lazy><Duel /></Lazy>} />
              <Route path="/d/:code" element={<Lazy><Duel /></Lazy>} />
              <Route path="/casos" element={<Lazy><Cases /></Lazy>} />
              <Route path="/casos/:id" element={<Lazy><Cases /></Lazy>} />
              <Route path="/ecg" element={<Lazy><EcgGame /></Lazy>} />
              <Route path="/repaso" element={<Lazy><Review /></Lazy>} />
              <Route path="/flashcards" element={<Lazy><Decks /></Lazy>} />
              <Route path="/flashcards/navegador" element={<Lazy><CardBrowser /></Lazy>} />
              <Route path="/flashcards/estadisticas" element={<Lazy><CardStats /></Lazy>} />
              <Route path="/flashcards/:deckId" element={<Lazy><DeckOverview /></Lazy>} />
              <Route path="/flashcards/:deckId/estudiar" element={<Lazy><Reviewer /></Lazy>} />
              <Route path="/guias" element={<Lazy><Guides /></Lazy>} />
              <Route path="/guias/:id" element={<Lazy><GuideDetail /></Lazy>} />
              <Route path="/actualizaciones" element={<Lazy><Updates /></Lazy>} />
              <Route path="/juegos" element={<Lazy><Games /></Lazy>} />
              <Route path="/juegos/:gameId" element={<Lazy><GamePage /></Lazy>} />
              <Route path="/estadisticas" element={<Lazy><Stats /></Lazy>} />
              <Route path="/plan" element={<Lazy><Planner /></Lazy>} />
              <Route path="/logros" element={<Lazy><Achievements /></Lazy>} />
              <Route path="/ranking" element={<Lazy><Ranking /></Lazy>} />
              <Route path="/banco" element={<Lazy><Bank /></Lazy>} />
              <Route path="/especialidades" element={<Lazy><Specialties /></Lazy>} />
              <Route path="/especialidades/:id" element={<Lazy><SpecialtyDetail /></Lazy>} />
              <Route path="/herramientas" element={<Lazy><Tools /></Lazy>} />
              <Route path="/como-prepararte" element={<Lazy><PrepGuide /></Lazy>} />
              <Route path="/roadmap" element={<Lazy><Roadmap /></Lazy>} />
              <Route path="/prompts" element={<Lazy><Prompts /></Lazy>} />
              <Route path="/prompts/:id" element={<Lazy><Prompts /></Lazy>} />
              <Route path="/ia" element={<Lazy><AiGuide /></Lazy>} />
              <Route path="/ajustes" element={<Lazy><Settings /></Lazy>} />
              <Route path="/cuenta" element={<Lazy><Account /></Lazy>} />
              <Route path="/terminologia" element={<Lazy><LingoPath /></Lazy>} />
            </Route>
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
      <Suspense fallback={null}>
        <NoteEditor />
      </Suspense>
      <SyncConflict />
      <PlanReveal />
      <Toaster />
      <VercelInsights />
      {bootWait && <Splash />}
      {bootLeaving && <Splash onLeft={endBoot} />}
    </MotionConfig>
  )
}

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>
}
