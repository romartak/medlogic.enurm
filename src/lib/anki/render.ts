import type { Card, Note } from './types'

const CLOZE_RE = /\{\{c(\d+)::([\s\S]*?)(?:::([\s\S]*?))?\}\}/g

/** Números de hueco presentes en un texto cloze ({{c1::…}}, {{c2::…}}). */
export function clozeNumbers(text: string): number[] {
  const set = new Set<number>()
  for (const m of text.matchAll(CLOZE_RE)) set.add(Number(m[1]))
  return [...set].sort((a, b) => a - b)
}

/** Ordinales de las tarjetas que genera una nota. */
export function cardOrds(note: Pick<Note, 'type' | 'front'>): number[] {
  if (note.type === 'reversed') return [0, 1]
  if (note.type === 'cloze') {
    const nums = clozeNumbers(note.front)
    return nums.length ? nums.map((n) => n - 1) : [0]
  }
  return [0]
}

/** Id estable de una tarjeta: la primera conserva el id de la nota (compatibilidad con repasos previos). */
export function cardId(noteId: string, ord: number): string {
  return ord === 0 ? noteId : `${noteId}::${ord}`
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const KNOWN_TAG = /<\/?(b|i|u|br|div|span|img|p|ul|ol|li|sup|sub|strong|em|hr|code|table|tr|td|th|mark|small)\b/i

/** Texto plano → HTML seguro; si ya es HTML se deja para sanitizar. */
function prepare(text: string): string {
  return KNOWN_TAG.test(text) ? text : escapeHtml(text).replace(/\n/g, '<br>')
}

const ALLOWED = new Set(['b', 'strong', 'i', 'em', 'u', 'br', 'sup', 'sub', 'ul', 'ol', 'li', 'p', 'div', 'span', 'hr', 'img', 'code', 'mark', 'small', 'table', 'tr', 'td', 'th', 'thead', 'tbody'])

/**
 * Limpia HTML de campos (las notas de Anki pueden traer formato): solo etiquetas seguras,
 * sin atributos salvo src de imágenes http(s)/data.
 */
export function sanitizeHtml(input: string): string {
  // Solo se interpreta como HTML si contiene etiquetas conocidas; si no, se escapa (p. ej. "CD4 < 200").
  return prepare(input)
    .replace(/<\s*(script|style|iframe|object|embed)[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(\/?)\s*([a-z0-9]+)([^>]*)>/gi, (_m, close: string, tag: string, attrs: string) => {
      const t = tag.toLowerCase()
      if (!ALLOWED.has(t)) return ''
      if (t === 'img' && !close) {
        const src = /src\s*=\s*["']([^"']+)["']/i.exec(attrs)?.[1] ?? ''
        return /^(https?:|data:image\/)/i.test(src) ? `<img src="${src.replace(/"/g, '')}" alt="">` : ''
      }
      if (t === 'span' && !close && /class\s*=\s*["']cloze/i.test(attrs)) return '<span class="cloze">'
      return `<${close}${t}>`
    })
}

/** HTML del frente y el reverso de una tarjeta. */
export function renderCard(card: Pick<Card, 'ord' | 'note'>): { front: string; back: string } {
  const n = card.note
  if (n.type === 'cloze') {
    const target = card.ord + 1
    const src = prepare(n.front)
    const front = src.replace(CLOZE_RE, (_m, num: string, text: string, hint?: string) =>
      Number(num) === target ? `<span class="cloze">[${hint ?? '…'}]</span>` : text,
    )
    const back = src.replace(CLOZE_RE, (_m, num: string, text: string) => (Number(num) === target ? `<span class="cloze">${text}</span>` : text))
    const extra = [n.back, n.extra].filter(Boolean).join('<br><br>')
    return { front: sanitizeHtml(front), back: sanitizeHtml(back) + (extra ? `<hr>${sanitizeHtml(extra)}` : '') }
  }
  const [q, a] = card.ord === 1 ? [n.back, n.front] : [n.front, n.back]
  return { front: sanitizeHtml(q), back: sanitizeHtml(a) + (n.extra ? `<hr>${sanitizeHtml(n.extra)}` : '') }
}

/** Texto plano (para listas y búsquedas). */
export function plainText(html: string): string {
  return html
    .replace(CLOZE_RE, '$2')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}
