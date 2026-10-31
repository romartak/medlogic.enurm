import { Composition, Folder, Still } from 'remotion'
import { PostCuentaAtras, PostEtiqueta, PostGratis, PostMito, PostPerla, PostPregunta, PostResidencia } from './posts/Posts'
import { ReelApp, ReelPlan, ReelQuiz } from './reels/Reels'
import { StoryCuentaAtras, StoryEncuesta, StoryPreguntas, StoryQuiz, StoryReto, StoryRespuesta, StorySlider } from './stories/Stories'
import { SIZE } from './theme'

const FPS = 30

export const POSTS = [
  ['post-1-pregunta', PostPregunta],
  ['post-2-mito', PostMito],
  ['post-3-cuenta-atras', PostCuentaAtras],
  ['post-4-etiqueta', PostEtiqueta],
  ['post-5-perla-glasgow', PostPerla],
  ['post-6-residencia', PostResidencia],
  ['post-7-gratis', PostGratis],
] as const

export const STORIES = [
  ['story-1-respuesta', StoryRespuesta, 8],
  ['story-2-encuesta', StoryEncuesta, 6],
  ['story-3-quiz', StoryQuiz, 6],
  ['story-4-slider', StorySlider, 6],
  ['story-5-cuenta-atras', StoryCuentaAtras, 7],
  ['story-6-preguntas', StoryPreguntas, 6],
  ['story-7-reto', StoryReto, 7],
] as const

export const REELS = [
  ['reel-1-quiz-5-segundos', ReelQuiz, 70 + 3 * 195 + 100],
  ['reel-2-recorrido-app', ReelApp, 75 + 4 * 150 + 100],
  ['reel-3-plan-cuenta-atras', ReelPlan, 120 + 90 + 210 + 100],
] as const

export function RemotionRoot() {
  return (
    <>
      <Folder name="Posts">
        {POSTS.map(([id, C]) => (
          <Still key={id} id={id} component={C} {...SIZE.post} />
        ))}
      </Folder>
      <Folder name="Historias">
        {STORIES.map(([id, C, secs]) => (
          <Composition key={id} id={id} component={C} durationInFrames={secs * FPS} fps={FPS} {...SIZE.story} />
        ))}
      </Folder>
      <Folder name="Reels">
        {REELS.map(([id, C, frames]) => (
          <Composition key={id} id={id} component={C} durationInFrames={frames} fps={FPS} {...SIZE.story} />
        ))}
      </Folder>
    </>
  )
}
