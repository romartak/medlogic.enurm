import { Lightbulb, TriangleAlert } from 'lucide-react'
import type { GuideSection } from '@/types'
import { cn } from '@/lib/utils'

/** Contenido de una sección de estudio (guías, ATLS, semiología…): texto, viñetas, tabla, perla y advertencia. */
export function SectionBody({ sec, color }: { sec: GuideSection; color: string }) {
  return (
    <div className="prose-guide mt-4 space-y-4 text-[15px]">
      {sec.body && <p>{sec.body}</p>}
      {sec.bullets && (
        <ul className="space-y-2">
          {sec.bullets.map((b, j) => (
            <li key={j} className="flex gap-3">
              <span className="mt-2 size-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              <span className="leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      )}
      {sec.table && (
        <ul className="space-y-2 sm:hidden">
          {sec.table.rows.map((r, j) => (
            <li key={j} className="rounded-xl border border-soft p-3.5">
              <div className="font-semibold">{r[0]}</div>
              <dl className="mt-2 space-y-1.5 text-sm">
                {r.slice(1).map((c, k) => (
                  <div key={k}>
                    <dt className="text-xs font-semibold tracking-wide text-muted uppercase">{sec.table!.head[k + 1]}</dt>
                    <dd className="leading-relaxed">{c}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      )}
      {sec.table && (
        <div className="-mx-1 overflow-x-auto rounded-xl border border-soft max-sm:hidden">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="surface-2">
                {sec.table.head.map((h, j) => (
                  <th key={j} className="px-4 py-2.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sec.table.rows.map((r, j) => (
                <tr key={j} className="border-t border-soft">
                  {r.map((c, k) => (
                    <td key={k} className={cn('px-4 py-2.5 align-top', k === 0 && 'font-medium')}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {sec.pearl && (
        <div className="flex gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] p-4">
          <Lightbulb className="size-5 shrink-0 text-amber-500" />
          <div>
            <div className="text-xs font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">Perla ENURM</div>
            <p className="mt-1 text-sm">{sec.pearl}</p>
          </div>
        </div>
      )}
      {sec.warning && (
        <div className="flex gap-3 rounded-xl border border-rose-500/25 bg-rose-500/[0.07] p-4">
          <TriangleAlert className="size-5 shrink-0 text-rose-500" />
          <div>
            <div className="text-xs font-bold tracking-wider text-rose-600 uppercase dark:text-rose-400">Atención</div>
            <p className="mt-1 text-sm">{sec.warning}</p>
          </div>
        </div>
      )}
    </div>
  )
}
