import type { SeatPosition, Table, TableShape } from '../../types'

const CANVAS_SIZE = 200

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

function getRoundSeats(capacity: number): SeatPosition[] {
  const radius = CANVAS_SIZE / 2 - 20
  const center = CANVAS_SIZE / 2
  return Array.from({ length: capacity }, (_, i) => {
    const angle = (2 * Math.PI * i) / capacity - Math.PI / 2
    return {
      seatIndex: i,
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    }
  })
}

function getRectangularSeats(capacity: number): SeatPosition[] {
  const topCount = Math.ceil(capacity / 2)
  const bottomCount = capacity - topCount
  const padding = 24
  const width = CANVAS_SIZE - padding * 2
  const positions: SeatPosition[] = []

  for (let i = 0; i < topCount; i++) {
    const x =
      topCount === 1
        ? CANVAS_SIZE / 2
        : padding + (width * i) / Math.max(topCount - 1, 1)
    positions.push({ seatIndex: i, x, y: 18 })
  }

  for (let i = 0; i < bottomCount; i++) {
    const x =
      bottomCount === 1
        ? CANVAS_SIZE / 2
        : padding + (width * i) / Math.max(bottomCount - 1, 1)
    positions.push({ seatIndex: topCount + i, x, y: CANVAS_SIZE - 18 })
  }

  return positions
}

function getHeadSeats(capacity: number): SeatPosition[] {
  const padding = 24
  const width = CANVAS_SIZE - padding * 2
  return Array.from({ length: capacity }, (_, i) => ({
    seatIndex: i,
    x: padding + (width * i) / Math.max(capacity - 1, 1),
    y: CANVAS_SIZE / 2,
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

export function getTableDimensions(shape: TableShape): { width: number; height: number } {
  if (shape === 'head') {
    return { width: CANVAS_SIZE, height: 80 }
  }
  return { width: CANVAS_SIZE, height: CANVAS_SIZE }
}

export { CANVAS_SIZE }
