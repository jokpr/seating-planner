import type { SeatPosition, Table, TableShape } from '../../types'

// A seated name chip is up to ~92px wide, so seats need >= ~100px of
// horizontal breathing room and a half-chip of padding at the edges.
// Guest chip (~30px) + seat number below, centered on the seat point.
const GUEST_LABEL_HALF_HEIGHT = 24
const LABEL_GAP_ABOVE_GUESTS = 12
const CHIP_HALF = 48

const H_SPACING = 104
const EDGE_PAD = 56

export interface TableDimensions {
  width: number
  height: number
}

export function normalizeRotation(degrees: number): number {
  return ((degrees % 360) + 360) % 360
}

export function getTableRotation(table: Table): number {
  return normalizeRotation(table.rotation ?? 0)
}

/** 0° = top, clockwise. Screen coordinates (y grows downward). */
export function angleFromCenterDeg(cx: number, cy: number, px: number, py: number): number {
  return normalizeRotation(pointerAngleDeg(cx, cy, px, py))
}

function pointerAngleDeg(cx: number, cy: number, px: number, py: number): number {
  return (Math.atan2(px - cx, -(py - cy)) * 180) / Math.PI
}

export function snapRotation(degrees: number, increment = 15): number {
  return normalizeRotation(Math.round(degrees / increment) * increment)
}

export function getUnrotatedTableDimensions(table: Table): TableDimensions {
  return dims(table.shape, table.capacity)
}

/**
 * Fixed layout box — size stays constant while rotating so the table never jumps.
 */
export function getTableLayoutBounds(table: Table): TableDimensions {
  const base = getUnrotatedTableDimensions(table)
  if (table.shape === 'round') return base
  const size = Math.ceil(Math.hypot(base.width, base.height))
  return { width: size, height: size }
}

/** @deprecated Use getTableLayoutBounds — kept for call-site clarity. */
export function getTableDimensions(table: Table): TableDimensions {
  return getTableLayoutBounds(table)
}

function dims(shape: TableShape, capacity: number): TableDimensions {
  switch (shape) {
    case 'round': {
      const radius = roundRadius(capacity)
      const size = Math.ceil(radius * 2 + CHIP_HALF * 2 + 16)
      return { width: size, height: size }
    }
    case 'rectangular': {
      const perRow = Math.ceil(capacity / 2)
      const width = Math.max(280, EDGE_PAD * 2 + Math.max(perRow - 1, 0) * H_SPACING)
      return { width, height: 236 }
    }
    case 'head':
    default: {
      const width = Math.max(240, EDGE_PAD * 2 + Math.max(capacity - 1, 0) * H_SPACING)
      return { width, height: 132 }
    }
  }
}

function roundRadius(capacity: number): number {
  // Keep arc distance between neighbours ~= H_SPACING.
  return Math.max(86, Math.round((capacity * H_SPACING) / (2 * Math.PI)))
}

export function getSeatPositions(table: Table): SeatPosition[] {
  switch (table.shape) {
    case 'round':
      return getRoundSeats(table.capacity)
    case 'rectangular':
      return getRectangularSeats(table.capacity)
    case 'head':
      return getHeadSeats(table.capacity)
    default:
      return getRoundSeats(table.capacity)
  }
}

/**
 * Y position (pivot coords) for the bottom edge of the table name / controls stack,
 * placed above the northernmost guest label even when the table is rotated.
 */
export function getTableLabelAnchorTop(
  table: Table,
  seats: SeatPosition[],
  layoutBounds: TableDimensions,
  bodyDims: TableDimensions,
): number {
  const pivotCy = layoutBounds.height / 2
  const bodyCx = bodyDims.width / 2
  const bodyCy = bodyDims.height / 2
  const rotationRad = (getTableRotation(table) * Math.PI) / 180
  const cos = Math.cos(rotationRad)
  const sin = Math.sin(rotationRad)

  let northernLabelTop = pivotCy

  for (const seat of seats) {
    const dx = seat.x - bodyCx
    const dy = seat.y - bodyCy
    const seatY = pivotCy + (-dx * sin + dy * cos)
    northernLabelTop = Math.min(northernLabelTop, seatY - GUEST_LABEL_HALF_HEIGHT)
  }

  return Math.max(4, northernLabelTop - LABEL_GAP_ABOVE_GUESTS)
}

function getRoundSeats(capacity: number): SeatPosition[] {
  const radius = roundRadius(capacity)
  const { width, height } = dims('round', capacity)
  const cx = width / 2
  const cy = height / 2
  return Array.from({ length: capacity }, (_, i) => {
    const angle = (2 * Math.PI * i) / capacity - Math.PI / 2
    return {
      seatIndex: i,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
  })
}

function getRectangularSeats(capacity: number): SeatPosition[] {
  const topCount = Math.ceil(capacity / 2)
  const bottomCount = capacity - topCount
  const { width, height } = dims('rectangular', capacity)
  const positions: SeatPosition[] = []

  const place = (count: number, startIndex: number, y: number) => {
    for (let i = 0; i < count; i++) {
      const x =
        count === 1
          ? width / 2
          : EDGE_PAD + ((width - EDGE_PAD * 2) * i) / Math.max(count - 1, 1)
      positions.push({ seatIndex: startIndex + i, x, y })
    }
  }

  place(topCount, 0, 40)
  place(bottomCount, topCount, height - 40)
  return positions
}

function getHeadSeats(capacity: number): SeatPosition[] {
  const { width, height } = dims('head', capacity)
  return Array.from({ length: capacity }, (_, i) => ({
    seatIndex: i,
    x:
      capacity === 1
        ? width / 2
        : EDGE_PAD + ((width - EDGE_PAD * 2) * i) / Math.max(capacity - 1, 1),
    y: height / 2,
  }))
}

export function getAdjacencyMap(shape: TableShape, capacity: number): Map<number, number[]> {
  switch (shape) {
    case 'round':
      return getRoundAdjacency(capacity)
    case 'rectangular':
      return getRectangularAdjacency(capacity)
    case 'head':
      return getHeadAdjacency(capacity)
    default:
      return getRoundAdjacency(capacity)
  }
}

function getRoundAdjacency(capacity: number): Map<number, number[]> {
  const map = new Map<number, number[]>()
  for (let i = 0; i < capacity; i++) {
    const prev = (i - 1 + capacity) % capacity
    const next = (i + 1) % capacity
    map.set(i, [prev, next])
  }
  return map
}

function getRectangularAdjacency(capacity: number): Map<number, number[]> {
  const topCount = Math.ceil(capacity / 2)
  const map = new Map<number, number[]>()

  for (let i = 0; i < topCount; i++) {
    const neighbors: number[] = []
    if (i > 0) neighbors.push(i - 1)
    if (i < topCount - 1) neighbors.push(i + 1)
    map.set(i, neighbors)
  }

  for (let i = 0; i < capacity - topCount; i++) {
    const idx = topCount + i
    const neighbors: number[] = []
    if (i > 0) neighbors.push(topCount + i - 1)
    if (i < capacity - topCount - 1) neighbors.push(topCount + i + 1)
    map.set(idx, neighbors)
  }

  return map
}

function getHeadAdjacency(capacity: number): Map<number, number[]> {
  const map = new Map<number, number[]>()
  for (let i = 0; i < capacity; i++) {
    const neighbors: number[] = []
    if (i > 0) neighbors.push(i - 1)
    if (i < capacity - 1) neighbors.push(i + 1)
    map.set(i, neighbors)
  }
  return map
}
