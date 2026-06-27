import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Lock, Unlock } from 'lucide-react'
import type { Guest, Group } from '../types'
import { cn } from '../lib/utils'
import { guestDragId, type DragItem } from '../lib/dnd/types'

interface GuestChipProps {
  guest: Guest
  group?: Group
  hasConflict?: boolean
  compact?: boolean
  onToggleLock?: () => void
  onClick?: () => void
  /** Highlight as the source guest while creating a rule */
  selected?: boolean
  /** Pulse as a valid pick target while creating a rule */
  pickable?: boolean
  /** Always show lock button (mobile) */
  touchFriendly?: boolean
}

export function GuestChip({
  guest,
  group,
  hasConflict = false,
  compact = false,
  onToggleLock,
  onClick,
  selected = false,
  pickable = false,
  touchFriendly = false,
}: GuestChipProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: guestDragId(guest.id),
    data: { type: 'guest', guestId: guest.id } satisfies DragItem,
    disabled: guest.locked,
  })

  const groupShadow =
    group?.color && !hasConflict && !selected && !pickable
      ? { boxShadow: `0 1px 3px ${group.color}22, 0 1px 2px rgba(0,0,0,0.04)` }
      : undefined

  const style = {
    ...groupShadow,
    ...(transform ? { transform: CSS.Translate.toString(transform) } : {}),
  }

  return (
    <div
      ref={setNodeRef}
      style={Object.keys(style).length > 0 ? style : undefined}
      data-no-pan
      {...listeners}
      {...attributes}
      onClick={
        onClick
          ? (e) => {
              e.stopPropagation()
              onClick()
            }
          : undefined
      }
      className={cn(
        'group relative flex items-center gap-1.5 rounded-full border bg-gradient-to-br from-white/80 via-white/70 to-cream/40 shadow-sm backdrop-blur-sm transition-all',
        compact ? 'px-2 py-1 text-[11px] min-h-[30px]' : 'px-3 py-1.5 text-sm min-h-[36px]',
        guest.locked
          ? 'cursor-pointer opacity-95'
          : onClick
            ? 'cursor-pointer'
            : 'cursor-grab active:cursor-grabbing',
        hasConflict
          ? 'border-red-400 ring-2 ring-red-200'
          : selected
            ? 'border-rose ring-2 ring-rose/40 shadow-md shadow-rose/10'
            : pickable
              ? 'border-sage ring-2 ring-sage/40 animate-pulse'
              : 'border-border/70 hover:border-rose/50 hover:shadow-md hover:shadow-rose/5',
        isDragging && 'z-50 opacity-50 shadow-lg',
      )}
    >
      <span
        className={cn(
          'shrink-0 rounded-full ring-2 ring-white shadow-sm',
          compact ? 'h-3 w-3' : 'h-4 w-4',
        )}
        style={{ backgroundColor: group?.color ?? '#d1d5db' }}
      />
      <span className={cn('truncate font-medium tracking-tight text-ink', compact ? 'max-w-[64px]' : 'max-w-[100px]')}>
        {guest.name}
      </span>
      {onToggleLock ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleLock()
          }}
          className={cn(
            'ml-0.5 shrink-0 rounded p-0.5 transition-all hover:bg-cream',
            guest.locked
              ? 'text-gold opacity-100'
              : touchFriendly
                ? 'text-muted opacity-70'
                : 'text-muted opacity-0 group-hover:opacity-100',
          )}
          title={guest.locked ? 'Unlock seat' : 'Lock seat'}
        >
          {guest.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
        </button>
      ) : (
        guest.locked && <Lock className="h-3 w-3 shrink-0 text-gold" />
      )}
    </div>
  )
}
