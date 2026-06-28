import { useCallback, useRef, type RefObject } from 'react'
import { normalizeRotation, snapRotation } from '../lib/seating/layout'

function pointerAngleDeg(cx: number, cy: number, px: number, py: number): number {
  return (Math.atan2(px - cx, -(py - cy)) * 180) / Math.PI
}

function pivotCenter(pivot: HTMLElement): { cx: number; cy: number } {
  const rect = pivot.getBoundingClientRect()
  return { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 }
}

/**
 * Delta-based rotation drag — no jump on grab. Hold Shift to snap to 15°.
 */
export function useTableRotationDrag({
  pivotRef,
  rotation,
  onRotate,
  onActiveChange,
}: {
  pivotRef: RefObject<HTMLElement | null>
  rotation: number
  onRotate: (degrees: number) => void
  onActiveChange?: (active: boolean) => void
}) {
  const session = useRef<{ startAngle: number; startRotation: number } | null>(null)

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      e.preventDefault()

      const pivot = pivotRef.current
      if (!pivot) return

      const { cx, cy } = pivotCenter(pivot)
      session.current = {
        startAngle: pointerAngleDeg(cx, cy, e.clientX, e.clientY),
        startRotation: rotation,
      }
      onActiveChange?.(true)

      const target = e.currentTarget
      target.setPointerCapture(e.pointerId)

      const onMove = (ev: PointerEvent) => {
        if (!session.current) return
        const { cx: mx, cy: my } = pivotCenter(pivot)
        const currentAngle = pointerAngleDeg(mx, my, ev.clientX, ev.clientY)
        const delta = currentAngle - session.current.startAngle
        let next = normalizeRotation(session.current.startRotation + delta)
        if (ev.shiftKey) next = snapRotation(next, 15)
        onRotate(next)
      }

      const onEnd = (ev: PointerEvent) => {
        session.current = null
        onActiveChange?.(false)
        target.removeEventListener('pointermove', onMove)
        target.removeEventListener('pointerup', onEnd)
        target.removeEventListener('pointercancel', onEnd)
        if (target.hasPointerCapture(ev.pointerId)) {
          target.releasePointerCapture(ev.pointerId)
        }
      }

      target.addEventListener('pointermove', onMove)
      target.addEventListener('pointerup', onEnd)
      target.addEventListener('pointercancel', onEnd)
    },
    [onActiveChange, onRotate, pivotRef, rotation],
  )

  return { onPointerDown }
}
