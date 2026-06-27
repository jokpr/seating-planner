import { useCallback, useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Sparkles, Wand2, X, Move } from 'lucide-react'
import { useSeatingStore } from '../../store/useSeatingStore'
import { useUiStore, RULE_META } from '../../store/useUiStore'
import { useGuestConflictIds, useTableConflictIds } from '../../hooks/useConflicts'
import { useIsMobile } from '../../hooks/useMediaQuery'
import { getTableDimensions } from '../../lib/seating/layout'
import { CANVAS_DROP_ID } from '../../lib/dnd/types'
import { cn } from '../../lib/utils'
import { CanvasToolbar, CanvasGuestDock } from './CanvasToolbar'
import { TableView } from './TableView'

export function TablesCanvas() {
  const tables = useSeatingStore((s) => s.tables)
  const guests = useSeatingStore((s) => s.guests)
  const groups = useSeatingStore((s) => s.groups)
  const loadDemo = useSeatingStore((s) => s.loadDemo)
  const toggleGuestLock = useSeatingStore((s) => s.toggleGuestLock)
  const conflictGuestIds = useGuestConflictIds()
  const conflictTableIds = useTableConflictIds()

  const linkType = useUiStore((s) => s.linkType)
  const linkSourceId = useUiStore((s) => s.linkSourceId)
  const cancelLink = useUiStore((s) => s.cancelLink)
  const setGuideOpen = useUiStore((s) => s.setGuideOpen)
  const canvasPan = useUiStore((s) => s.canvasPan)
  const setSelectedTableId = useUiStore((s) => s.setSelectedTableId)
  const setSidebarCollapsed = useUiStore((s) => s.setSidebarCollapsed)
  const setMobileSheet = useUiStore((s) => s.setMobileSheet)
  const isMobile = useIsMobile()

  const viewportRef = useRef<HTMLDivElement>(null)
  const suppressBackgroundClick = useRef(false)
  const panState = useRef<{
    active: boolean
    moved: boolean
    startX: number
    startY: number
    panX: number
    panY: number
  } | null>(null)

  const linkSourceName =
    linkSourceId && linkSourceId !== '__toolbar__'
      ? guests.find((g) => g.id === linkSourceId)?.name
      : null

  const bounds = tables.reduce(
    (acc, t) => {
      const d = getTableDimensions(t)
      return {
        w: Math.max(acc.w, t.x + d.width + 120),
        h: Math.max(acc.h, t.y + d.height + 200),
      }
    },
    { w: 1200, h: 800 },
  )

  const showOnboarding = guests.length === 0

  const handlePanPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0 && e.button !== 1) return
      const target = e.target as HTMLElement
      if (target.closest('[data-no-pan]')) return
      if (target.closest('button, input, select, textarea, [role="button"]')) return

      setSidebarCollapsed(true)
      if (isMobile) setMobileSheet(null)
      e.currentTarget.setPointerCapture(e.pointerId)
      panState.current = {
        active: true,
        moved: false,
        startX: e.clientX,
        startY: e.clientY,
        panX: canvasPan.x,
        panY: canvasPan.y,
      }
    },
    [canvasPan.x, canvasPan.y, setSidebarCollapsed, isMobile, setMobileSheet],
  )

  const handlePanPointerMove = useCallback((e: React.PointerEvent) => {
    if (!panState.current?.active) return
    const dx = e.clientX - panState.current.startX
    const dy = e.clientY - panState.current.startY
    if (Math.abs(dx) + Math.abs(dy) > 3) panState.current.moved = true
    useUiStore.getState().setCanvasPan({
      x: panState.current.panX + dx,
      y: panState.current.panY + dy,
    })
  }, [])

  const handlePanPointerUp = useCallback((e: React.PointerEvent) => {
    if (panState.current?.active) {
      suppressBackgroundClick.current = panState.current.moved
      window.setTimeout(() => {
        suppressBackgroundClick.current = false
      }, 0)
      panState.current = null
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
    }
  }, [])

  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-no-pan]')) return
    if (suppressBackgroundClick.current) {
      suppressBackgroundClick.current = false
      return
    }
    setSelectedTableId(null)
  }, [setSelectedTableId])

  return (
    <div className="canvas-floor relative h-full min-h-[280px] flex-1 overflow-hidden rounded-xl border border-border shadow-inner md:min-h-[560px] md:rounded-2xl">
      <div
        ref={viewportRef}
        className="canvas-viewport h-full w-full overflow-hidden"
        onPointerDown={handlePanPointerDown}
        onPointerMove={handlePanPointerMove}
        onPointerUp={handlePanPointerUp}
        onPointerCancel={handlePanPointerUp}
      >
        <CanvasWorld bounds={bounds} pan={canvasPan} onBackgroundClick={handleBackgroundClick}>
          {showOnboarding ? (
            <div className="flex h-full min-h-[280px] items-center justify-center px-4 md:min-h-[560px]">
              <div
                className="max-w-md rounded-2xl border border-border bg-white/90 p-5 text-center shadow-lg backdrop-blur-sm md:p-8"
                data-no-pan
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose to-rose-dark text-white">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="font-serif text-xl font-semibold text-ink md:text-2xl">
                  Plan your wedding seating chart
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Free drag-and-drop seating planner for weddings, receptions, and events. Drag
                  tables onto the floor, add guests, set seating rules, then auto-arrange the rest.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={loadDemo}
                    className="rounded-lg bg-gradient-to-r from-rose to-rose-dark px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md"
                  >
                    Load example wedding
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuideOpen(true)}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-cream"
                  >
                    How it works
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {tables.map((table) => (
                <TableView
                  key={table.id}
                  table={table}
                  guests={guests}
                  groups={groups}
                  conflictGuestIds={conflictGuestIds}
                  conflictTableIds={conflictTableIds}
                  onToggleLock={toggleGuestLock}
                />
              ))}
            </>
          )}
        </CanvasWorld>
      </div>

      {!showOnboarding && (
        <>
          <CanvasToolbar />
          <CanvasGuestDock />
        </>
      )}

      {linkType && (
        <div
          className="pointer-events-auto absolute left-2 right-2 top-2 z-30 flex items-center gap-2 rounded-lg border border-rose/30 bg-white/35 px-2.5 py-1.5 shadow-md backdrop-blur-md md:left-1/2 md:right-auto md:top-2 md:max-w-lg md:-translate-x-1/2 md:gap-2 md:px-3"
          data-no-pan
        >
          <Wand2 className="h-4 w-4 shrink-0 text-rose-dark" />
          <span className="min-w-0 flex-1 text-xs text-ink md:text-sm">
            {linkSourceName ? (
              <>
                Creating rule — <strong>{linkSourceName}</strong> {RULE_META[linkType].verb}…{' '}
                <span className="text-muted">tap another guest</span>
              </>
            ) : (
              <>
                Creating rule — <span className="text-muted">tap two guests on the map</span>
              </>
            )}
          </span>
          <button
            type="button"
            onClick={cancelLink}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-muted hover:bg-cream"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
        </div>
      )}

      {!showOnboarding && guests.filter((g) => !g.seat).length === 0 && (
        <div className="pointer-events-none absolute bottom-[calc(4.125rem+env(safe-area-inset-bottom))] left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border/25 bg-white/30 px-2 py-0.5 text-[9px] text-muted shadow-sm backdrop-blur-md md:bottom-2">
          <Move className="h-3 w-3" />
          {isMobile ? 'Drag to pan' : 'Drag floor to pan'}
        </div>
      )}
    </div>
  )
}

function CanvasWorld({
  bounds,
  pan,
  children,
  onBackgroundClick,
}: {
  bounds: { w: number; h: number }
  pan: { x: number; y: number }
  children: React.ReactNode
  onBackgroundClick: (e: React.MouseEvent) => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: CANVAS_DROP_ID,
    data: { type: 'canvas' },
  })

  return (
    <div
      ref={setNodeRef}
      data-canvas-world
      className={`canvas-world relative min-h-full ${isOver ? 'ring-2 ring-inset ring-rose/30' : ''}`}
      style={{
        minWidth: bounds.w,
        minHeight: bounds.h,
        transform: `translate(${pan.x}px, ${pan.y}px)`,
      }}
      onClick={onBackgroundClick}
    >
      {children}
    </div>
  )
}

export function GuestPoolDropZone({
  children,
  compact = false,
}: {
  children: React.ReactNode
  compact?: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'guest-pool',
    data: { type: 'pool' },
  })

  return (
    <div
      ref={setNodeRef}
      data-no-pan
      className={cn(
        'rounded-lg border border-dashed shadow-sm backdrop-blur-md transition-colors',
        compact ? 'min-h-[36px] p-1.5' : 'min-h-[48px] p-2',
        isOver ? 'border-rose bg-rose/10' : 'border-border/30 bg-white/35',
      )}
    >
      {children}
    </div>
  )
}
