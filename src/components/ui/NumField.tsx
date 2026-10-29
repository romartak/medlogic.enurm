/** Campo numérico con etiqueta y unidad (calculadoras, espirometría…). */
export function NumField({ label, value, onChange, unit, step = 'any' }: { label: string; value: string; onChange: (v: string) => void; unit?: string; step?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <span className="mt-1.5 flex items-center rounded-xl border border-soft surface-2 focus-within:border-brand-500">
        <input type="number" inputMode="decimal" step={step} value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-full bg-transparent px-3 text-sm outline-none" />
        {unit && <span className="pr-3 text-xs whitespace-nowrap text-muted">{unit}</span>}
      </span>
    </label>
  )
}
