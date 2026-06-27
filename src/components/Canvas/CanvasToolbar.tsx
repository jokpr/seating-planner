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
import { useIsMobile } from '../../hooks/useMediaQuery'
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

function useQuickAdd() {
  const addGuest = useSeatingStore((s) => s.addGuest)
  const guests = useSeatingStore((s) => s.guests)
  const showToast = useUiStore((s) => s.showToast)
  const [guestName, setGuestName] = useState('')

  const handleAddGuest = () => {
    if (!guestName.trim()) return
    addGuest(guestName.trim())
    setGuestName('')
    showToast(`Added ${guestName.trim()} — drag them onto a seat`)
  }

  return { guestName, setGuestName, handleAddGuest, waitingCount: guests.filter((g) => !g.seat).length, hasGuests: guests.length > 0 }
}

function useRuleToolbar() {
  const linkType = useUiStore((s) => s.linkType)
  const startLink = useUiStore((s) => s.startLink)
  const showToast = useUiStore((s) => s.showToast)

  const beginRuleFromToolbar = (type: RuleType) => {
    showToast(`Click a guest on the map, then click who they ${RULE_META[type].verb}.`)
    startLink('__toolbar__', type)
  }

  return { linkType, beginRuleFromToolbar }
}

export function CanvasToolbarContent() {
  const { guestName, setGuestName, handleAddGuest, waitingCount, hasGuests } = useQuickAdd()
  const { linkType, beginRuleFromToolbar } = useRuleToolbar()
  const isMobile = useIsMobile()

  return (
    <div className="flex flex-col gap-4">
      <section>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
          Quick add guest
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddGuest()}
            placeholder="Guest name..."
            className="min-w-0 flex-1 rounded-lg border border-border bg-cream/40 px-3 py-2.5 text-sm outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
          />
          <button
            type="button"
            onClick={handleAddGuest}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-r from-rose to-rose-dark px-4 py-2.5 text-sm font-medium text-white shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            Add
          </button>
        </div>
        {hasGuests && (
          <p className="mt-2 text-xs text-muted">
            {waitingCount} waiting · drag from the dock below the map
          </p>
        )}
      </section>

      <section>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
          Drag tables onto floor
        </p>
        <div className="flex flex-wrap gap-2">
          {TABLE_TEMPLATES.map(({ shape, label, capacity, icon: Icon }) => (
            <TableTemplateChip key={shape} shape={shape} label={label} capacity={capacity} icon={Icon} large={isMobile} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center gap-1.5">
          <Wand2 className="h-3.5 w-3.5 text-rose-dark" />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Seating rules
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {RULE_OPTIONS.map(({ type, icon: Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => beginRuleFromToolbar(type)}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition',
                isMobile && 'min-h-[44px]',
                linkType === type
                  ? 'border-rose/40 bg-rose/15 text-rose-dark'
                  : 'border-border text-ink hover:bg-cream',
              )}
            >
              <Icon className="h-4 w-4 shrink-0 text-muted" />
              {RULE_META[type].label}
            </button>
          ))}
        </div>
        {linkType && (
          <p className="mt-2 rounded-lg bg-cream/80 px-3 py-2 text-xs text-muted">
            {isMobile ? 'Tap' : 'Click'} two guests on the map to create this rule
          </p>
        )}
      </section>
    </div>
  )
}

export function CanvasToolbar() {
  const isMobile = useIsMobile()
  const { guestName, setGuestName, handleAddGuest, waitingCount, hasGuests } = useQuickAdd()
  const { linkType, beginRuleFromToolbar } = useRuleToolbar()

  if (isMobile) return null

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
        {hasGuests && (
          <p className="mt-1.5 text-[10px] text-muted">
            {waitingCount} waiting · drag guests from the dock below
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
  large,
}: {
  shape: TableShape
  label: string
  capacity: number
  icon: typeof Circle
  large?: boolean
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
        'flex cursor-grab items-center gap-1 rounded-lg border border-border bg-cream/50 font-medium text-ink shadow-sm transition hover:border-rose/50 hover:bg-white active:cursor-grabbing',
        large ? 'min-h-[44px] px-3 py-2 text-sm' : 'px-2 py-1.5 text-[11px]',
        isDragging && 'z-50 opacity-60 shadow-lg',
      )}
    >
      <Icon className={cn('text-rose-dark', large ? 'h-4 w-4' : 'h-3 w-3')} />
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
  const isMobile = useIsMobile()
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
    <div
      className={cn(
        'pointer-events-auto absolute left-3 right-3 z-20 mx-auto max-w-2xl',
        isMobile ? 'bottom-[calc(4.5rem+env(safe-area-inset-bottom))]' : 'bottom-3',
      )}
    >
      <GuestPoolDropZone>
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold text-ink">Guest dock</p>
          <p className="truncate text-[10px] text-muted">
            {unassigned.length} unassigned — drag onto seats
          </p>
        </div>
        {unassigned.length === 0 ? (
          <p className="py-1.5 text-center text-xs text-muted">
            Everyone is seated — drop a guest here to unassign
          </p>
        ) : (
          <div className={cn(
            'flex flex-wrap gap-1.5 overflow-y-auto pr-1 scrollbar-thin',
            isMobile ? 'max-h-24' : 'max-h-28',
          )}>
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
                  touchFriendly={isMobile}
                />
                {menuGuestId === guest.id && !linkType && (
                  <GuestSeatMenu guest={guest} placement="top" />
                )}
                <button
                  type="button"
                  onClick={() => removeGuest(guest.id)}
                  className={cn(
                    'absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white',
                    isMobile ? 'flex' : 'hidden group-hover:flex',
                  )}
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
