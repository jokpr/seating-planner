import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Lock } from 'lucide-react'
import type { Guest, Group } from '../types'
import { cn } from '../lib/utils'
import { guestDragId, type DragItem } from '../lib/dnd/types'

interface GuestChipProps {
  guest: Guest
  group?: Group
  hasConflict?: boolean
  compact?: boolean
  onToggleLock?: () => void
}

export function GuestChip({
  guest,
  group,
  hasConflict = false,
  compact = false,
  onToggleLock,
}: GuestChipProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: guestDragId(guest.id),
    data: { type: 'guest', guestId: guest.id } satisfies DragItem,
    disabled: guest.locked,
  })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'group relative flex items-center gap-1.5 rounded-full border bg-white shadow-sm transition-all',
        compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
        guest.locked ? 'cursor-default opacity-90' : 'cursor-grab active:cursor-grabbing',
        hasConflict ? 'border-red-400 ring-2 ring-red-200' : 'border-border hover:shadow-md',
        isDragging && 'z-50 opacity-50 shadow-lg',
      )}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: group?.color ?? '#d1d5db' }}
      />
      <span className="max-w-[100px] truncate font-medium text-ink">{guest.name}</span>
      {guest.locked && <Lock className="h-3 w-3 shrink-0 text-gold" />}
      {onToggleLock && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleLock()
          }}
          className={cn(
            'ml-0.5 rounded p-0.5 opacity-0 transition-opacity hover:bg-cream group-hover:opacity-100',
            guest.locked && 'opacity-100',
          )}
          title={guest.locked ? 'Unlock seat' : 'Lock seat'}
        >
          <Lock className={cn('h-3 w-3', guest.locked ? 'text-gold' : 'text-muted')} />
        </button>
      )}
    </div>
  )
}
