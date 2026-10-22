import { useBank } from '@/store/bank'
import { getSpecialty, SPECIALTIES } from '@/data/specialties'
import { Chip } from '@/components/ui/primitives'
import { Icon } from '@/components/ui/Icon'

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]
}

export function SpecialtyPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const counts = useBank((s) => s.specialtyCounts)
  // Primero las del catálogo en su orden, luego cualquier especialidad nueva del banco importado.
  const ids = [...SPECIALTIES.map((s) => s.id).filter((id) => counts[id]), ...Object.keys(counts).filter((id) => !SPECIALTIES.some((s) => s.id === id))]
  return (
    <div className="flex flex-wrap gap-2">
      <Chip active={value.length === 0} onClick={() => onChange([])}>
        Todas
      </Chip>
      {ids.map((id) => {
        const s = getSpecialty(id)
        return (
          <Chip key={id} active={value.includes(id)} onClick={() => onChange(toggle(value, id))} color={s.color}>
            <Icon name={s.icon} className="size-3.5" />
            {s.short}
            <span className="opacity-60">{counts[id]}</span>
          </Chip>
        )
      })}
    </div>
  )
}

export function YearPicker({ value, onChange }: { value: number[]; onChange: (v: number[]) => void }) {
  const years = useBank((s) => s.years)
  if (!years.length) return <p className="text-sm text-muted">El banco actual no tiene años asignados. Importa tu base de datos para filtrar por año.</p>
  return (
    <div className="flex flex-wrap gap-2">
      <Chip active={value.length === 0} onClick={() => onChange([])}>
        Todos
      </Chip>
      {years.map((y) => (
        <Chip key={y} active={value.includes(y)} onClick={() => onChange(toggle(value, y))}>
          {y}
        </Chip>
      ))}
    </div>
  )
}
