import { describe, expect, it } from 'vitest'
import { isChunkLoadError } from './ErrorBoundary'

describe('isChunkLoadError', () => {
  it('reconoce los fallos de descarga por una versión nueva', () => {
    expect(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: https://x/assets/Exam-1.js'))).toBe(true)
    expect(isChunkLoadError(new TypeError('error loading dynamically imported module'))).toBe(true)
    expect(isChunkLoadError(new TypeError('Importing a module script failed.'))).toBe(true)
  })
  it('no confunde otros errores', () => {
    expect(isChunkLoadError(new Error('Cannot read properties of undefined'))).toBe(false)
    expect(isChunkLoadError(null)).toBe(false)
  })
})
