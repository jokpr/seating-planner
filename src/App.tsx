import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { Sidebar } from './components/Sidebar/Sidebar'
import { TopBar } from './components/TopBar'
import { TablesCanvas } from './components/Canvas/TablesCanvas'
import { ConflictPanel } from './components/ConflictPanel'
import { ExportView } from './components/ExportView'
import { GuestChip } from './components/GuestChip'
import { GuideModal } from './components/GuideModal'
import { Toast } from './components/Toast'
import { useSeatingStore } from './store/useSeatingStore'
import { useUiStore } from './store/useUiStore'
import { parseGuestDragId, parseSeatDropId } from './lib/dnd/types'

const GUIDE_SEEN_KEY = 'seatfinder-guide-seen'

function App() {
  const guests = useSeatingStore((s) => s.guests)
  const groups = useSeatingStore((s) => s.groups)
  const assignGuestToSeat = useSeatingStore((s) => s.assignGuestToSeat)
  const unassignGuest = useSeatingStore((s) => s.unassignGuest)
  const setGuideOpen = useUiStore((s) => s.setGuideOpen)
  const cancelLink = useUiStore((s) => s.cancelLink)
  const linkType = useUiStore((s) => s.linkType)
  const exportViewRef = useRef<HTMLDivElement>(null)

  const [activeGuestId, setActiveGuestId] = useState<string | null>(null)

  useEffect(() => {
    if (!localStorage.getItem(GUIDE_SEEN_KEY)) {
      setGuideOpen(true)
      localStorage.setItem(GUIDE_SEEN_KEY, '1')
    }
  }, [setGuideOpen])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  const groupMap = new Map(groups.map((g) => [g.id, g]))

  const handleDragStart = (event: DragStartEvent) => {
    if (linkType) cancelLink()
    const guestId = parseGuestDragId(String(event.active.id))
    if (guestId) setActiveGuestId(guestId)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveGuestId(null)
    const guestId = parseGuestDragId(String(event.active.id))
    if (!guestId || !event.over) return

    const target = parseSeatDropId(String(event.over.id))
    if (!target) return

    const guest = guests.find((g) => g.id === guestId)
    if (!guest || guest.locked) return

    if (target.type === 'pool') {
      unassignGuest(guestId)
    } else {
      assignGuestToSeat(guestId, target.tableId, target.seatIndex)
    }
  }

  const activeGuest = activeGuestId ? guests.find((g) => g.id === activeGuestId) : null

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full flex-col">
        <TopBar exportViewRef={exportViewRef} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex flex-1 flex-col gap-4 overflow-hidden p-4">
            <ConflictPanel />
            <TablesCanvas />
          </main>
        </div>
      </div>

      <ExportView ref={exportViewRef} />
      <GuideModal />
      <Toast />

      <DragOverlay dropAnimation={null}>
        {activeGuest ? (
          <GuestChip
            guest={activeGuest}
            group={activeGuest.groupId ? groupMap.get(activeGuest.groupId) : undefined}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default App
