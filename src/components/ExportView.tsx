import { forwardRef } from 'react'
import { useSeatingStore } from '../store/useSeatingStore'

export const ExportView = forwardRef<HTMLDivElement>(function ExportView(_, ref) {
  const projectName = useSeatingStore((s) => s.projectName)
  const tables = useSeatingStore((s) => s.tables)
  const guests = useSeatingStore((s) => s.guests)
  const groups = useSeatingStore((s) => s.groups)

  const groupMap = new Map(groups.map((g) => [g.id, g]))

  return (
    <div
      ref={ref}
      className="absolute left-[-9999px] top-0 w-[800px] bg-cream p-10"
      aria-hidden
    >
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-muted">Seating Plan</p>
        <h1
          className="mt-2 font-serif text-4xl font-bold text-ink"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          {projectName}
        </h1>
        <div className="mx-auto mt-4 h-px w-24 bg-gold" />
      </div>

      <div className="mt-10 space-y-8">
        {tables.map((table) => {
          const seated = guests
            .filter((g) => g.seat?.tableId === table.id)
            .sort((a, b) => (a.seat!.seatIndex > b.seat!.seatIndex ? 1 : -1))

          return (
            <div key={table.id} className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="font-serif text-xl font-semibold text-ink">{table.name}</h2>
              <p className="text-xs capitalize text-muted">
                {table.shape} · {seated.length}/{table.capacity} seated
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {seated.map((guest) => {
                  const group = guest.groupId ? groupMap.get(guest.groupId) : undefined
                  return (
                    <div
                      key={guest.id}
                      className="flex items-center gap-2 rounded-lg bg-cream/50 px-3 py-2"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: group?.color ?? '#d1d5db' }}
                      />
                      <span className="text-sm font-medium">{guest.name}</span>
                      {group && (
                        <span className="ml-auto text-[10px] text-muted">{group.name}</span>
                      )}
                      {guest.locked && (
                        <span className="text-[10px] text-gold">locked</span>
                      )}
                    </div>
                  )
                })}
              </div>
              {seated.length === 0 && (
                <p className="mt-2 text-sm italic text-muted">No guests assigned</p>
              )}
            </div>
          )
        })}
      </div>

      <p className="mt-10 text-center text-[10px] text-muted">
        Created with SeatFinder · Import this PNG to restore your plan
      </p>
    </div>
  )
})
