import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  Ban,
  Circle,
  Heart,
  LayoutGrid,
  Minus,
  UserPlus,
  UserX,
  Wand2,
} from 'lucide-react'
import { useSeatingStore } from '../../store/useSeatingStore'
import { RULE_META, useUiStore, type RuleType } from '../../store/useUiStore'
import type { TableShape } from '../../types'
import { tableTemplateDragId } from '../../lib/dnd/types'
import { cn } from '../../lib/utils'
import { useGuestConflictIds } from '../../hooks/useConflicts'
import { GuestChip } from '../GuestChip'
import { GuestPoolDropZone } from './TablesCanvas'
import { GuestSeatMenu } from './GuestSeatMenu'

const TABLE_TEMPLATES: { shape: TableShape; label: string; capacity: number; icon: typeof Circle }[] = [
  { shape: 'round', label: 'Round', capacity: 8, icon: Circle },
  { shape: 'rectangular', label: 'Rect', capacity: 10, icon: LayoutGrid },
  { shape: 'head', label: 'Head', capacity: 6, icon: Minus },
]

const RULE_OPTIONS: { type: RuleType; icon: typeof Ban }[] = [
  { type: 'sameTableBlacklist', icon: UserX },
  { type: 'adjacencyBlacklist', icon: Ban },
  { type: 'mustSitTogether', icon: Heart },
]

export function CanvasToolbar() {
  const addGuest = useSeatingStore((s) => s.addGuest)
  const guests = useSeatingStore((s) => s.guests)
  const linkType = useUiStore((s) => s.linkType)
  const startLink = useUiStore((s) => s.startLink)
  const showToast = useUiStore((s) => s.showToast)
  const [guestName, setGuestName] = useState('')

  const handleAddGuest = () => {
    if (!guestName.trim()) return
    addGuest(guestName.trim())
    setGuestName('')
    showToast(`Added ${guestName.trim()} — drag them onto a seat`)
  }

  const beginRuleFromToolbar = (type: RuleType) => {
    showToast(`Click a guest on the map, then click who they ${RULE_META[type].verb}.`)
    startLink('__toolbar__', type)
  }

  return (
    <div className="pointer-events-auto absolute left-3 top-3 z-20 flex max-w-[min(24rem,calc(100%-1.5rem))] flex-col gap-2">
      <div className="rounded-xl border border-border/80 bg-white/95 p-2 shadow-md backdrop-blur-md">
        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted">
          Quick add
        </p>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddGuest()}
            placeholder="Guest name..."
            className="min-w-0 flex-1 rounded-lg border border-border bg-cream/40 px-2.5 py-1.5 text-xs outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
          />
          <button
            type="button"
            onClick={handleAddGuest}
            className="flex shrink-0 items-center gap-1 rounded-lg bg-gradient-to-r from-rose to-rose-dark px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:shadow-md"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
        {guests.length > 0 && (
          <p className="mt-1.5 text-[10px] text-muted">
            {guests.filter((g) => !g.seat).length} waiting · drag guests from the dock below
          </p>
        )}
      </div>

      <div className="rounded-xl border border-border/80 bg-white/95 p-2 shadow-md backdrop-blur-md">
        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted">
          Drag tables onto floor
        </p>
        <div className="flex flex-wrap gap-1.5">
          {TABLE_TEMPLATES.map(({ shape, label, capacity, icon: Icon }) => (
            <TableTemplateChip key={shape} shape={shape} label={label} capacity={capacity} icon={Icon} />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border/80 bg-white/95 p-2 shadow-md backdrop-blur-md">
        <div className="mb-1.5 flex items-center gap-1">
          <Wand2 className="h-3 w-3 text-rose-dark" />
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted">
            Seating rules
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {RULE_OPTIONS.map(({ type, icon: Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => beginRuleFromToolbar(type)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[11px] transition',
                linkType === type
                  ? 'bg-rose/15 text-rose-dark ring-1 ring-rose/40'
                  : 'text-ink hover:bg-cream',
              )}
            >
              <Icon className="h-3 w-3 shrink-0 text-muted" />
              {RULE_META[type].label}
            </button>
          ))}
        </div>
        {linkType && (
          <p className="mt-1.5 rounded-lg bg-cream/80 px-2 py-1 text-[10px] text-muted">
            Click two guests on the map to create this rule
          </p>
        )}
      </div>
    </div>
  )
}

function TableTemplateChip({
  shape,
  label,
  capacity,
  icon: Icon,
}: {
  shape: TableShape
  label: string
  capacity: number
  icon: typeof Circle
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: tableTemplateDragId(shape, capacity),
    data: { type: 'table-template', shape, capacity },
  })

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'flex cursor-grab items-center gap-1 rounded-lg border border-border bg-cream/50 px-2 py-1.5 text-[11px] font-medium text-ink shadow-sm transition hover:border-rose/50 hover:bg-white active:cursor-grabbing',
        isDragging && 'z-50 opacity-60 shadow-lg',
      )}
    >
      <Icon className="h-3 w-3 text-rose-dark" />
      {label}
      <span className="text-muted">({capacity})</span>
    </div>
  )
}

export function CanvasGuestDock() {
  const guests = useSeatingStore((s) => s.guests)
  const groups = useSeatingStore((s) => s.groups)
  const toggleGuestLock = useSeatingStore((s) => s.toggleGuestLock)
  const removeGuest = useSeatingStore((s) => s.removeGuest)
  const addConstraint = useSeatingStore((s) => s.addConstraint)
  const linkType = useUiStore((s) => s.linkType)
  const linkSourceId = useUiStore((s) => s.linkSourceId)
  const menuGuestId = useUiStore((s) => s.menuGuestId)
  const openMenu = useUiStore((s) => s.openMenu)
  const startLink = useUiStore((s) => s.startLink)
  const cancelLink = useUiStore((s) => s.cancelLink)
  const showToast = useUiStore((s) => s.showToast)
  const conflictIds = useGuestConflictIds()
  const unassigned = guests.filter((g) => !g.seat)
  const groupMap = new Map(groups.map((g) => [g.id, g]))

  const handleRuleGuestClick = (guest: (typeof guests)[0]) => {
    if (!linkType) return
    if (guest.id === linkSourceId) {
      cancelLink()
      return
    }
    if (linkSourceId === '__toolbar__') {
      startLink(guest.id, linkType)
      showToast(`Now click the guest who ${RULE_META[linkType].verb} ${guest.name}.`)
      return
    }
    if (linkSourceId) {
      addConstraint(linkType, { guestA: linkSourceId, guestB: guest.id })
      const sourceName = guests.find((g) => g.id === linkSourceId)?.name ?? 'Guest'
      showToast(`Rule added: ${sourceName} ${RULE_META[linkType].verb} ${guest.name}.`)
      cancelLink()
    }
  }

  if (guests.length === 0) return null

  return (
    <div className="pointer-events-auto absolute bottom-3 left-3 right-3 z-20 mx-auto max-w-2xl">
      <GuestPoolDropZone>
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[11px] font-semibold text-ink">Guest dock</p>
          <p className="text-[10px] text-muted">{unassigned.length} unassigned — drag onto seats</p>
        </div>
        {unassigned.length === 0 ? (
          <p className="py-1.5 text-center text-xs text-muted">
            Everyone is seated — drop a guest here to unassign
          </p>
        ) : (
          <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto pr-1 scrollbar-thin">
            {unassigned.map((guest) => (
              <div
                key={guest.id}
                className={`group relative ${menuGuestId === guest.id && !linkType ? 'z-50' : ''}`}
              >
                <GuestChip
                  guest={guest}
                  group={guest.groupId ? groupMap.get(guest.groupId) : undefined}
                  hasConflict={conflictIds.has(guest.id)}
                  onToggleLock={() => toggleGuestLock(guest.id)}
                  onClick={linkType ? () => handleRuleGuestClick(guest) : () => openMenu(guest.id)}
                  pickable={!!linkType && guest.id !== linkSourceId}
                  selected={guest.id === linkSourceId}
                />
                {menuGuestId === guest.id && !linkType && (
                  <GuestSeatMenu guest={guest} placement="top" />
                )}
                <button
                  type="button"
                  onClick={() => removeGuest(guest.id)}
                  className="absolute -right-1 -top-1 hidden rounded-full bg-red-500 p-0.5 text-white group-hover:block"
                  title="Remove guest"
                >
                  <Minus className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </GuestPoolDropZone>
    </div>
  )
}
