/** Grandes áreas del examen: agrupan especialidades en el cuestionario, el plan y la página de especialidades. */
export interface Area {
  id: string
  name: string
  description: string
  color: string
  icon: string
  specialties: string[]
}

export const AREAS: Area[] = [
  {
    id: 'interna',
    name: 'Medicina Interna',
    description: 'Adultos: cardiología, neumología, gastro, nefro, endocrino, infectología y más.',
    color: '#0ea5e9',
    icon: 'stethoscope',
    specialties: ['medicina-interna', 'cardiologia', 'neumologia', 'gastroenterologia', 'nefrologia', 'endocrinologia', 'infectologia', 'hematologia', 'neurologia', 'reumatologia', 'dermatologia', 'psiquiatria'],
  },
  { id: 'pediatria', name: 'Pediatría', description: 'Neonatología, crecimiento, vacunas y patología infantil.', color: '#22c55e', icon: 'baby', specialties: ['pediatria'] },
  { id: 'ginobs', name: 'Ginecología y Obstetricia', description: 'Embarazo, parto, puerperio y ginecología.', color: '#f43f5e', icon: 'venus', specialties: ['ginecologia-obstetricia'] },
  { id: 'cirugia', name: 'Cirugía', description: 'Cirugía general, trauma, ortopedia, urología, oftalmología y ORL.', color: '#14b8a6', icon: 'scissors', specialties: ['cirugia', 'ortopedia', 'urologia', 'oftalmologia-orl'] },
  { id: 'salud-publica', name: 'Salud Pública', description: 'Epidemiología, bioestadística, prevención y ética.', color: '#0d9488', icon: 'users', specialties: ['salud-publica', 'etica'] },
  { id: 'basicas', name: 'Básicas y Emergencias', description: 'Ciencias básicas, farmacología y medicina de emergencias.', color: '#64748b', icon: 'microscope', specialties: ['ciencias-basicas', 'farmacologia', 'emergencias'] },
]

export function areaOf(specialty: string): Area | undefined {
  return AREAS.find((a) => a.specialties.includes(specialty))
}

/** Residencias a las que puede aspirar el estudiante y las especialidades que el plan refuerza para cada una. */
export const RESIDENCIES: { id: string; name: string; boost: string[] }[] = [
  { id: 'medicina-interna', name: 'Medicina Interna', boost: ['medicina-interna', 'cardiologia', 'neumologia', 'gastroenterologia', 'nefrologia', 'endocrinologia', 'infectologia'] },
  { id: 'pediatria', name: 'Pediatría', boost: ['pediatria'] },
  { id: 'ginecologia-obstetricia', name: 'Ginecología y Obstetricia', boost: ['ginecologia-obstetricia'] },
  { id: 'cirugia', name: 'Cirugía General', boost: ['cirugia', 'emergencias'] },
  { id: 'medicina-familiar', name: 'Medicina Familiar', boost: ['medicina-interna', 'pediatria', 'salud-publica'] },
  { id: 'emergenciologia', name: 'Emergenciología', boost: ['emergencias', 'cardiologia', 'farmacologia'] },
  { id: 'anestesiologia', name: 'Anestesiología', boost: ['farmacologia', 'ciencias-basicas', 'emergencias'] },
  { id: 'cardiologia', name: 'Cardiología', boost: ['cardiologia', 'medicina-interna'] },
  { id: 'ortopedia', name: 'Ortopedia y Traumatología', boost: ['ortopedia', 'cirugia'] },
  { id: 'imagenologia', name: 'Imagenología', boost: ['ciencias-basicas', 'cirugia'] },
  { id: 'psiquiatria', name: 'Psiquiatría', boost: ['psiquiatria', 'neurologia'] },
  { id: 'dermatologia', name: 'Dermatología', boost: ['dermatologia'] },
  { id: 'oftalmologia', name: 'Oftalmología', boost: ['oftalmologia-orl'] },
  { id: 'otorrinolaringologia', name: 'Otorrinolaringología', boost: ['oftalmologia-orl'] },
  { id: 'urologia', name: 'Urología', boost: ['urologia', 'nefrologia'] },
  { id: 'neurologia', name: 'Neurología', boost: ['neurologia'] },
  { id: 'otra', name: 'Otra / aún no lo sé', boost: [] },
]
