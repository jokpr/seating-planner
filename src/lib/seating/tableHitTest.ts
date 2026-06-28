import type { Table } from '../../types'
import {
  getTableLayoutBounds,
  getTableRotation,
  getUnrotatedTableDimensions,
} from './layout'

interface TableBodyMetrics {
  bodyDims: { width: number; height: number }
  bodyW: number
  bodyH: number
  pivotCx: number
  pivotCy: number
  rotation: number
}

function getTableBodyMetrics(table: Table): TableBodyMetrics {
  const layoutBounds = getTableLayoutBounds(table)
  const bodyDims = getUnrotatedTableDimensions(table)
  const rotation = getTableRotation(table)
  const roundSize = Math.min(bodyDims.width, bodyDims.height) * 0.52

  let bodyW: number
  let bodyH: number
  if (table.shape === 'round') {
    bodyW = roundSize
    bodyH = roundSize
  } else if (table.shape === 'rectangular') {
    bodyW = bodyDims.width - 120
    bodyH = bodyDims.height - 120
  } else {
    bodyW = bodyDims.width - 80
    bodyH = 48
  }

  return {
    bodyDims,
    bodyW,
    bodyH,
    pivotCx: table.x + layoutBounds.width / 2,
    pivotCy: table.y + layoutBounds.height / 2,
    rotation,
  }
}

function worldToBodyLocal(wx: number, wy: number, m: TableBodyMetrics) {
  const px = wx - m.pivotCx
  const py = wy - m.pivotCy
  const rad = (-m.rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const lx = px * cos - py * sin
  const ly = px * sin + py * cos
  return {
    bx: lx + m.bodyDims.width / 2,
    by: ly + m.bodyDims.height / 2,
  }
}

/** True when the point lies on the visible table surface (not the layout padding). */
export function isPointInTableBody(wx: number, wy: number, table: Table): boolean {
  const m = getTableBodyMetrics(table)
  const { bx, by } = worldToBodyLocal(wx, wy, m)
  const cx = m.bodyDims.width / 2
  const cy = m.bodyDims.height / 2

  if (table.shape === 'round') {
    return Math.hypot(bx - cx, by - cy) <= m.bodyW / 2
  }

  return Math.abs(bx - cx) <= m.bodyW / 2 && Math.abs(by - cy) <= m.bodyH / 2
}

function getCanvasContentOffset(canvasWorldEl: HTMLElement): { x: number; y: number } {
  return {
    x: Number(canvasWorldEl.dataset.offsetX ?? 0),
    y: Number(canvasWorldEl.dataset.offsetY ?? 0),
  }
}

export function clientToWorldPoint(
  clientX: number,
  clientY: number,
  canvasWorldEl: HTMLElement,
): { x: number; y: number } {
  const rect = canvasWorldEl.getBoundingClientRect()
  const offset = getCanvasContentOffset(canvasWorldEl)
  return {
    x: clientX - rect.left - offset.x,
    y: clientY - rect.top - offset.y,
  }
}

function findTableLabelFromDom(clientX: number, clientY: number): string | null {
  const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null
  const label = el?.closest('[data-table-label]') as HTMLElement | null
  return label?.dataset.tableId ?? null
}

/** Pick the table to select at a screen point. Body hits use closest center; labels use DOM. */
export function findTableToSelectAtClientPoint(
  clientX: number,
  clientY: number,
  tables: Table[],
): string | null {
  const world = document.querySelector('[data-canvas-world]') as HTMLElement | null
  if (!world) return null

  const { x, y } = clientToWorldPoint(clientX, clientY, world)

  const bodyHits = tables
    .filter((t) => isPointInTableBody(x, y, t))
    .map((t) => {
      const m = getTableBodyMetrics(t)
      return { id: t.id, dist: Math.hypot(x - m.pivotCx, y - m.pivotCy) }
    })
    .sort((a, b) => a.dist - b.dist)

  if (bodyHits.length > 0) return bodyHits[0].id

  return findTableLabelFromDom(clientX, clientY)
}

/** True when a pointer event should not clear the current table selection. */
export function isTableInteractionPoint(
  clientX: number,
  clientY: number,
  tables: Table[],
): boolean {
  const target = document.elementFromPoint(clientX, clientY) as HTMLElement | null
  if (target?.closest('[data-table-label], [data-table-controls], [data-seat-interactive]')) {
    return true
  }

  const world = document.querySelector('[data-canvas-world]') as HTMLElement | null
  if (!world) return false

  const { x, y } = clientToWorldPoint(clientX, clientY, world)
  return tables.some((t) => isPointInTableBody(x, y, t))
}
