import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DropAnimation,
} from '@dnd-kit/core'
import { Circle, LayoutGrid, Minus } from 'lucide-react'
import { Sidebar } from './components/Sidebar/Sidebar'
import { TopBar } from './components/TopBar'
import { TablesCanvas } from './components/Canvas/TablesCanvas'
import { ExportView } from './components/ExportView'
import { GuestChip } from './components/GuestChip'
import { GuideModal } from './components/GuideModal'
import { Toast } from './components/Toast'
import { MobileBottomBar } from './components/MobileBottomBar'
import { useSeatingStore } from './store/useSeatingStore'
import { useUiStore } from './store/useUiStore'
import {
  CANVAS_DROP_ID,
  parseGuestDragId,
  parseSeatDropId,
  parseTableDragId,
  parseTableTemplateDragId,
} from './lib/dnd/types'
import { seatingCollisionDetection } from './lib/dnd/collision'
import type { TableShape } from './types'

const GUIDE_SEEN_KEY = 'seatfinder-guide-seen'

const guestDropAnimation: DropAnimation = {
  duration: 220,
  easing: 'cubic-bezier(0.18, 0.67, 0.35, 1.1)',
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: { opacity: '0.5' },
    },
  }),
}

function getDropCoordsOnCanvas(event: DragEndEvent): { x: number; y: number } {
  const world = document.querySelector('[data-canvas-world]') as HTMLElement | null
  const rect = event.active.rect.current.translated
  if (!world || !rect) return { x: 120, y: 120 }
  const worldRect = world.getBoundingClientRect()
  const offsetX = Number(world.dataset.offsetX ?? 0)
  const offsetY = Number(world.dataset.offsetY ?? 0)
  const x = rect.left + rect.width / 2 - worldRect.left - offsetX - 60
  const y = rect.top + rect.height / 2 - worldRect.top - offsetY - 40
  return { x, y }
}

function App() {
  const guests = useSeatingStore((s) => s.guests)
  const groups = useSeatingStore((s) => s.groups)
  const tables = useSeatingStore((s) => s.tables)
  const assignGuestToSeat = useSeatingStore((s) => s.assignGuestToSeat)
  const unassignGuest = useSeatingStore((s) => s.unassignGuest)
  const moveTable = useSeatingStore((s) => s.moveTable)
  const addTableAt = useSeatingStore((s) => s.addTableAt)
  const setGuideOpen = useUiStore((s) => s.setGuideOpen)
  const cancelLink = useUiStore((s) => s.cancelLink)
  const linkType = useUiStore((s) => s.linkType)
  const setSidebarCollapsed = useUiStore((s) => s.setSidebarCollapsed)
  const setMobileSheet = useUiStore((s) => s.setMobileSheet)
  const exportViewRef = useRef<HTMLDivElement>(null)

  const [activeGuestId, setActiveGuestId] = useState<string | null>(null)
  const [activeTemplate, setActiveTemplate] = useState<{
    shape: TableShape
    capacity: number
  } | null>(null)

  useEffect(() => {
    if (!localStorage.getItem(GUIDE_SEEN_KEY)) {
      setGuideOpen(true)
      localStorage.setItem(GUIDE_SEEN_KEY, '1')
    }
  }, [setGuideOpen])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  )

  const groupMap = new Map(groups.map((g) => [g.id, g]))

  const handleDragStart = (event: DragStartEvent) => {
    setSidebarCollapsed(true)
    setMobileSheet(null)
    if (linkType) cancelLink()
    const guestId = parseGuestDragId(String(event.active.id))
    if (guestId) {
      setActiveGuestId(guestId)
      return
    }
    const template = parseTableTemplateDragId(String(event.active.id))
    if (template) setActiveTemplate(template)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveGuestId(null)
    setActiveTemplate(null)

    const activeId = String(event.active.id)
    const guestId = parseGuestDragId(activeId)
    const tableId = parseTableDragId(activeId)
    const template = parseTableTemplateDragId(activeId)

    if (guestId && event.over) {
      const target = parseSeatDropId(String(event.over.id))
      if (!target) return
      const guest = guests.find((g) => g.id === guestId)
      if (!guest || guest.locked) return
      if (target.type === 'pool') {
        unassignGuest(guestId)
      } else if (target.type === 'seat') {
        assignGuestToSeat(guestId, target.tableId, target.seatIndex)
      }
      return
    }

    if (tableId) {
      const table = tables.find((t) => t.id === tableId)
      if (table) {
        moveTable(tableId, table.x + event.delta.x, table.y + event.delta.y)
      }
      return
    }

    if (template && event.over?.id === CANVAS_DROP_ID) {
      const { x, y } = getDropCoordsOnCanvas(event)
      const tableCount = useSeatingStore.getState().tables.length
      addTableAt(
        `Table ${tableCount + 1}`,
        template.shape,
        template.capacity,
        x,
        y,
      )
    }
  }

  const activeGuest = activeGuestId ? guests.find((g) => g.id === activeGuestId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={seatingCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full flex-col">
        <TopBar exportViewRef={exportViewRef} />
        <div className="flex flex-1 overflow-hidden pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
          <Sidebar />
          <main
            className="flex flex-1 flex-col overflow-hidden p-1 md:p-1.5"
            aria-label="Seating chart floor plan"
          >
            <TablesCanvas />
          </main>
        </div>
      </div>

      <MobileBottomBar exportViewRef={exportViewRef} />

      <ExportView ref={exportViewRef} />
      <GuideModal />
      <Toast />

      <DragOverlay dropAnimation={activeGuest ? guestDropAnimation : null}>
        {activeGuest ? (
          <GuestChip
            guest={activeGuest}
            group={activeGuest.groupId ? groupMap.get(activeGuest.groupId) : undefined}
            compact={!!activeGuest.seat}
          />
        ) : activeTemplate ? (
          <div className="flex items-center gap-2 rounded-xl border border-rose/30 bg-surface/35 px-3 py-1.5 text-sm font-medium shadow-md backdrop-blur-md">
            <TemplateIcon shape={activeTemplate.shape} />
            New {activeTemplate.shape} table ({activeTemplate.capacity})
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

function TemplateIcon({ shape }: { shape: TableShape }) {
  if (shape === 'round') return <Circle className="h-4 w-4 text-rose-dark" />
  if (shape === 'rectangular') return <LayoutGrid className="h-4 w-4 text-rose-dark" />
  return <Minus className="h-4 w-4 text-rose-dark" />
}

export default App
