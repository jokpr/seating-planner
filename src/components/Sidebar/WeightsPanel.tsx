import { Sliders } from 'lucide-react'
import { useSeatingStore } from '../../store/useSeatingStore'

import type { Weights } from '../../types'

const WEIGHT_LABELS: { key: keyof Weights; label: string; hint: string }[] = [
  { key: 'groupTogether', label: 'Keep groups together', hint: 'Penalize splitting households across tables' },
  { key: 'mustSitTogether', label: 'Prefer-together pairs', hint: 'Honor soft "sit together" preferences' },
  { key: 'tableBalance', label: 'Balance table sizes', hint: 'Avoid one packed table and one empty' },
  { key: 'emptySeat', label: 'Minimize empty seats', hint: 'Prefer filling tables evenly' },
]

export function WeightsPanel() {
  const weights = useSeatingStore((s) => s.weights)
  const setWeights = useSeatingStore((s) => s.setWeights)

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Sliders className="h-4 w-4 text-rose-dark" />
        <h3 className="text-sm font-semibold text-ink">Optimizer Weights</h3>
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-white p-3">
        {WEIGHT_LABELS.map(({ key, label, hint }) => (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-medium">{label}</label>
              <span className="text-xs text-muted">{weights[key]}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={weights[key]}
              onChange={(e) => setWeights({ [key]: parseInt(e.target.value, 10) })}
              className="w-full accent-rose"
            />
            <p className="text-[10px] text-muted">{hint}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
