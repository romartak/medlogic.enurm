import { lazy, Suspense, useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Toaster } from '@/components/ui/Toaster'
import { LogoMark } from '@/components/ui/Logo'
import { useBank } from '@/store/bank'
import { seedSpecialtiesSeen, useProgress } from '@/store/progress'
import { useThemeSync } from '@/hooks/useTheme'
import { useStudyTimer } from '@/hooks/useStudyTimer'
const Dashboard = lazy(() => import('@/pages/Dashboard'))

const Landing = lazy(() => import('@/pages/Landing'))
const Practice = lazy(() => import('@/pages/Practice'))
const Exam = lazy(() => import('@/pages/Exam'))
const ExamResults = lazy(() => import('@/pages/Exam').then((m) => ({ default: m.ExamResults })))
const Review = lazy(() => import('@/pages/Review'))
const Flashcards = lazy(() => import('@/pages/Flashcards'))
const FlashcardStudy = lazy(() => import('@/pages/FlashcardStudy'))
const Guides = lazy(() => import('@/pages/Guides'))
const GuideDetail = lazy(() => import('@/pages/Guides').then((m) => ({ default: m.GuideDetail })))
const Updates = lazy(() => import('@/pages/Updates'))
const Games = lazy(() => import('@/pages/games/Games'))
const GamePage = lazy(() => import('@/pages/games/GamePage'))
const Stats = lazy(() => import('@/pages/Stats'))
const Planner = lazy(() => import('@/pages/Planner'))
const Achievements = lazy(() => import('@/pages/Achievements'))
const Bank = lazy(() => import('@/pages/Bank'))
const Import = lazy(() => import('@/pages/Import'))
const Settings = lazy(() => import('@/pages/Settings'))

function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <div className="flex flex-col items-center gap-4">
        <LogoMark className="size-14 animate-pulse-ring rounded-2xl" />
        <div className="h-1 w-32 overflow-hidden rounded-full surface-2">
          <div className="skeleton h-full w-full" />
        </div>
      </div>
    </div>
  )
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
  const status = useBank((s) => s.status)
  const load = useBank((s) => s.load)
  const reduceMotion = useProgress((s) => s.settings.reduceMotion)

  useEffect(() => {
    load().then(() => seedSpecialtiesSeen(useProgress.getState().attempts, useBank.getState().byId))
  }, [load])

  if (status === 'idle' || status === 'loading') return <Splash />

  return (
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'user'}>
      <HashRouter>
        <Suspense fallback={<Splash />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route element={<AppLayout />}>
              <Route path="/inicio" element={<Lazy><Dashboard /></Lazy>} />
              <Route path="/practica" element={<Lazy><Practice /></Lazy>} />
              <Route path="/simulacro" element={<Lazy><Exam /></Lazy>} />
              <Route path="/simulacro/:id" element={<Lazy><ExamResults /></Lazy>} />
              <Route path="/repaso" element={<Lazy><Review /></Lazy>} />
              <Route path="/flashcards" element={<Lazy><Flashcards /></Lazy>} />
              <Route path="/flashcards/:deckId" element={<Lazy><FlashcardStudy /></Lazy>} />
              <Route path="/guias" element={<Lazy><Guides /></Lazy>} />
              <Route path="/guias/:id" element={<Lazy><GuideDetail /></Lazy>} />
              <Route path="/actualizaciones" element={<Lazy><Updates /></Lazy>} />
              <Route path="/juegos" element={<Lazy><Games /></Lazy>} />
              <Route path="/juegos/:gameId" element={<Lazy><GamePage /></Lazy>} />
              <Route path="/estadisticas" element={<Lazy><Stats /></Lazy>} />
              <Route path="/plan" element={<Lazy><Planner /></Lazy>} />
              <Route path="/logros" element={<Lazy><Achievements /></Lazy>} />
              <Route path="/banco" element={<Lazy><Bank /></Lazy>} />
              <Route path="/importar" element={<Lazy><Import /></Lazy>} />
              <Route path="/ajustes" element={<Lazy><Settings /></Lazy>} />
              <Route path="*" element={<Navigate to="/inicio" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
      <Toaster />
    </MotionConfig>
  )
}

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>
}
