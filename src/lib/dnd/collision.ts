import {
  closestCenter,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
} from '@dnd-kit/core'
import {
  CANVAS_DROP_ID,
  parseGuestDragId,
  parseTableTemplateDragId,
} from './types'

function isSeatOrPool(id: string): boolean {
  return id.startsWith('seat::') || id === 'guest-pool'
}

/** Prefer seat/pool targets over the full canvas when dragging guests. */
export const seatingCollisionDetection: CollisionDetection = (args) => {
  const activeId = String(args.active.id)

  if (parseGuestDragId(activeId)) {
    const pointerHits = pointerWithin(args).filter((c) => isSeatOrPool(String(c.id)))
    if (pointerHits.length) return pointerHits

    const centerHits = closestCenter(args).filter((c) => isSeatOrPool(String(c.id)))
    if (centerHits.length) return centerHits

    return []
  }

  if (parseTableTemplateDragId(activeId)) {
    const pointerHits = pointerWithin(args).filter((c) => c.id === CANVAS_DROP_ID)
    if (pointerHits.length) return pointerHits
    return closestCenter(args).filter((c) => c.id === CANVAS_DROP_ID)
  }

  return rectIntersection(args)
}
