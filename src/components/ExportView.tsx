import { forwardRef } from 'react'
import { useSeatingStore } from '../store/useSeatingStore'
import { computeCanvasBounds } from '../lib/seating/layout'
import { TableViewStatic } from './Canvas/TableView'

export const ExportView = forwardRef<HTMLDivElement>(function ExportView(_, ref) {
  const projectName = useSeatingStore((s) => s.projectName)
  const tables = useSeatingStore((s) => s.tables)
  const guests = useSeatingStore((s) => s.guests)
  const groups = useSeatingStore((s) => s.groups)

  const bounds = computeCanvasBounds(tables)
  const exportPad = 80

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: bounds.width + exportPad,
        height: bounds.height + 160,
        zIndex: -1,
        pointerEvents: 'none',
        opacity: 0,
      }}
    >
      <div
        className="export-root"
        style={{
          width: bounds.width + exportPad,
          minHeight: bounds.height + 160,
          backgroundColor: '#faf8f5',
          padding: 40,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p
            style={{
              fontSize: 12,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#6b7280',
              margin: 0,
            }}
          >
            Seating Plan
          </p>
          <h1
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: 36,
              fontWeight: 700,
              color: '#1a1a2e',
              margin: '8px 0 0',
            }}
          >
            {projectName}
          </h1>
          <div
            style={{
              width: 96,
              height: 1,
              backgroundColor: '#c9a962',
              margin: '16px auto 0',
            }}
          />
        </div>

        <div
          className="export-floor"
          style={{
            position: 'relative',
            width: bounds.width,
            height: bounds.height,
            margin: '0 auto',
            backgroundColor: '#faf8f5',
            backgroundImage: `
              linear-gradient(to right, rgba(232, 228, 223, 0.5) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(232, 228, 223, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            borderRadius: 16,
            border: '1px solid #e8e4df',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: bounds.offsetX,
              top: bounds.offsetY,
            }}
          >
            {tables.map((table) => (
              <TableViewStatic key={table.id} table={table} guests={guests} groups={groups} />
            ))}
          </div>
        </div>

        <p
          style={{
            textAlign: 'center',
            fontSize: 10,
            color: '#6b7280',
            marginTop: 32,
          }}
        >
          Created with SeatFinder · Import this PNG to restore your plan
        </p>
      </div>
    </div>
  )
})
