import { useState } from 'react'
import { Circle, LayoutGrid, Minus, Plus, Trash2 } from 'lucide-react'
import { useSeatingStore } from '../../store/useSeatingStore'
import type { TableShape } from '../../types'

const SHAPES: { value: TableShape; label: string; icon: typeof Circle }[] = [
  { value: 'round', label: 'Round', icon: Circle },
  { value: 'rectangular', label: 'Rectangular', icon: LayoutGrid },
  { value: 'head', label: 'Head table', icon: Minus },
]

export function TableManager() {
  const tables = useSeatingStore((s) => s.tables)
  const addTable = useSeatingStore((s) => s.addTable)
  const updateTable = useSeatingStore((s) => s.updateTable)
  const removeTable = useSeatingStore((s) => s.removeTable)

  const [name, setName] = useState('')
  const [shape, setShape] = useState<TableShape>('round')
  const [capacity, setCapacity] = useState(8)

  const handleAdd = () => {
    addTable(name.trim() || `Table ${tables.length + 1}`, shape, capacity)
    setName('')
  }

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <LayoutGrid className="h-4 w-4 text-rose-dark" />
        <h3 className="text-sm font-semibold text-ink">Tables</h3>
      </div>

      <div className="mb-3 space-y-2 rounded-lg border border-border bg-white p-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Table name..."
          className="w-full rounded-lg border border-border bg-cream/30 px-3 py-2 text-sm outline-none focus:border-rose"
        />
        <div className="flex gap-1">
          {SHAPES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setShape(value)}
              className={`flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-xs transition ${
                shape === value
                  ? 'border-rose bg-rose/10 text-rose-dark'
                  : 'border-border hover:border-rose/50'
              }`}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Seats:</span>
          <button
            type="button"
            onClick={() => setCapacity((c) => Math.max(2, c - 1))}
            className="rounded border border-border p-1 hover:bg-cream"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-6 text-center text-sm font-medium">{capacity}</span>
          <button
            type="button"
            onClick={() => setCapacity((c) => Math.min(20, c + 1))}
            className="rounded border border-border p-1 hover:bg-cream"
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="ml-auto rounded-lg bg-ink px-3 py-1.5 text-xs text-white hover:bg-ink/90"
          >
            Add table
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {tables.map((table) => (
          <div
            key={table.id}
            className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2"
          >
            <input
              type="text"
              value={table.name}
              onChange={(e) => updateTable(table.id, { name: e.target.value })}
              className="flex-1 bg-transparent text-sm font-medium outline-none"
            />
            <span className="text-xs capitalize text-muted">{table.shape}</span>
            <input
              type="number"
              min={2}
              max={20}
              value={table.capacity}
              onChange={(e) =>
                updateTable(table.id, { capacity: parseInt(e.target.value, 10) || 2 })
              }
              className="w-12 rounded border border-border px-1 py-0.5 text-center text-xs"
            />
            <button
              type="button"
              onClick={() => removeTable(table.id)}
              className="text-muted hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
