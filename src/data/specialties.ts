import type { Specialty } from '@/types'

/**
 * Áreas del ENURM. El peso es una aproximación para repartir el tiempo del plan de estudio;
 * cuando se cargue el banco real, el plan usa la distribución real de preguntas.
 */
export const SPECIALTIES: Specialty[] = [
  { id: 'medicina-interna', name: 'Medicina Interna', short: 'Interna', color: '#0ea5e9', icon: 'stethoscope', weight: 10, aliases: ['interna', 'medicina interna', 'mi', 'clinica medica'] },
  { id: 'cardiologia', name: 'Cardiología', short: 'Cardio', color: '#ef4444', icon: 'heart-pulse', weight: 8, aliases: ['cardio', 'cardiologia', 'cardiovascular'] },
  { id: 'neumologia', name: 'Neumología', short: 'Neumo', color: '#06b6d4', icon: 'wind', weight: 5, aliases: ['neumo', 'neumologia', 'respiratorio', 'pulmonar'] },
  { id: 'gastroenterologia', name: 'Gastroenterología', short: 'Gastro', color: '#f59e0b', icon: 'activity', weight: 5, aliases: ['gastro', 'gastroenterologia', 'digestivo', 'hepatologia'] },
  { id: 'nefrologia', name: 'Nefrología', short: 'Nefro', color: '#8b5cf6', icon: 'droplets', weight: 4, aliases: ['nefro', 'nefrologia', 'renal'] },
  { id: 'endocrinologia', name: 'Endocrinología', short: 'Endo', color: '#ec4899', icon: 'flask-conical', weight: 5, aliases: ['endo', 'endocrinologia', 'endocrino', 'diabetes'] },
  { id: 'infectologia', name: 'Infectología', short: 'Infecto', color: '#84cc16', icon: 'bug', weight: 6, aliases: ['infecto', 'infectologia', 'infecciosas', 'enfermedades infecciosas'] },
  { id: 'hematologia', name: 'Hematología', short: 'Hemato', color: '#dc2626', icon: 'droplet', weight: 3, aliases: ['hemato', 'hematologia', 'oncologia', 'hemato-oncologia'] },
  { id: 'neurologia', name: 'Neurología', short: 'Neuro', color: '#6366f1', icon: 'brain', weight: 4, aliases: ['neuro', 'neurologia'] },
  { id: 'reumatologia', name: 'Reumatología', short: 'Reuma', color: '#a855f7', icon: 'hand', weight: 2, aliases: ['reuma', 'reumatologia', 'inmunologia'] },
  { id: 'pediatria', name: 'Pediatría', short: 'Pedia', color: '#22c55e', icon: 'baby', weight: 12, aliases: ['pedia', 'pediatria', 'neonatologia', 'neonatal'] },
  { id: 'ginecologia-obstetricia', name: 'Ginecología y Obstetricia', short: 'GinObs', color: '#f43f5e', icon: 'venus', weight: 12, aliases: ['gineco', 'ginecologia', 'obstetricia', 'ginecologia y obstetricia', 'gineco-obstetricia', 'go'] },
  { id: 'cirugia', name: 'Cirugía General', short: 'Cirugía', color: '#14b8a6', icon: 'scissors', weight: 10, aliases: ['cirugia', 'cirugia general', 'trauma', 'quirurgica'] },
  { id: 'ortopedia', name: 'Ortopedia y Traumatología', short: 'Orto', color: '#78716c', icon: 'bone', weight: 2, aliases: ['ortopedia', 'traumatologia', 'ortopedia y traumatologia'] },
  { id: 'urologia', name: 'Urología', short: 'Uro', color: '#0891b2', icon: 'droplets', weight: 1, aliases: ['urologia', 'uro'] },
  { id: 'salud-publica', name: 'Salud Pública y Epidemiología', short: 'S. Pública', color: '#0d9488', icon: 'users', weight: 7, aliases: ['salud publica', 'epidemiologia', 'medicina preventiva', 'bioestadistica', 'estadistica', 'medicina social'] },
  { id: 'psiquiatria', name: 'Psiquiatría', short: 'Psiq', color: '#7c3aed', icon: 'brain-circuit', weight: 2, aliases: ['psiquiatria', 'psiq', 'salud mental'] },
  { id: 'dermatologia', name: 'Dermatología', short: 'Derma', color: '#d97706', icon: 'sparkles', weight: 1, aliases: ['dermatologia', 'derma', 'dermato'] },
  { id: 'farmacologia', name: 'Farmacología', short: 'Farma', color: '#2563eb', icon: 'pill', weight: 2, aliases: ['farmacologia', 'farmaco', 'farma'] },
  { id: 'emergencias', name: 'Emergencias', short: 'Emerg.', color: '#ea580c', icon: 'siren', weight: 3, aliases: ['emergencia', 'emergencias', 'urgencias', 'medicina de emergencia', 'toxicologia'] },
  { id: 'ciencias-basicas', name: 'Ciencias Básicas', short: 'Básicas', color: '#64748b', icon: 'microscope', weight: 2, aliases: ['ciencias basicas', 'anatomia', 'fisiologia', 'bioquimica', 'microbiologia', 'patologia', 'histologia', 'embriologia', 'genetica'] },
  { id: 'oftalmologia-orl', name: 'Oftalmología y ORL', short: 'Oftal/ORL', color: '#0284c7', icon: 'eye', weight: 1, aliases: ['oftalmologia', 'otorrinolaringologia', 'orl', 'otorrino'] },
  { id: 'etica', name: 'Ética y Legislación', short: 'Ética', color: '#475569', icon: 'scale', weight: 1, aliases: ['etica', 'bioetica', 'legislacion', 'medicina legal', 'deontologia'] },
]

const byId = new Map(SPECIALTIES.map((s) => [s.id, s]))

export function normalizeText(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export function slugify(s: string): string {
  return normalizeText(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const aliasIndex = new Map<string, string>()
for (const s of SPECIALTIES) {
  aliasIndex.set(s.id, s.id)
  aliasIndex.set(normalizeText(s.name), s.id)
  for (const a of s.aliases) aliasIndex.set(normalizeText(a), s.id)
}

/** Convierte un nombre libre ("Gineco-Obstetricia", "PEDIATRÍA") al id interno. */
export function resolveSpecialtyId(raw: string | undefined | null): string {
  if (!raw) return 'medicina-interna'
  const n = normalizeText(String(raw))
  return aliasIndex.get(n) ?? aliasIndex.get(slugify(n)) ?? slugify(n) ?? 'medicina-interna'
}

/** Devuelve la especialidad; si no existe en el catálogo genera una con color neutro. */
export function getSpecialty(id: string): Specialty {
  const s = byId.get(id)
  if (s) return s
  const name = id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return { id, name, short: name.slice(0, 10), color: '#64748b', icon: 'book-open', weight: 1, aliases: [] }
}
