import type { SeatingPlanState, Table } from '../../types'

const KEYWORD = 'seatfinder'
const KEYWORD_BYTES = new TextEncoder().encode(KEYWORD)

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function writeUint32BE(value: number): Uint8Array {
  const buf = new Uint8Array(4)
  buf[0] = (value >>> 24) & 0xff
  buf[1] = (value >>> 16) & 0xff
  buf[2] = (value >>> 8) & 0xff
  buf[3] = value & 0xff
  return buf
}

function readUint32BE(data: Uint8Array, offset: number): number {
  return (
    ((data[offset] << 24) |
      (data[offset + 1] << 16) |
      (data[offset + 2] << 8) |
      data[offset + 3]) >>>
    0
  )
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((sum, a) => sum + a.length, 0)
  const result = new Uint8Array(total)
  let offset = 0
  for (const arr of arrays) {
    result.set(arr, offset)
    offset += arr.length
  }
  return result
}

function createTextChunk(text: string): Uint8Array {
  const textBytes = new TextEncoder().encode(text)
  const chunkData = concat(KEYWORD_BYTES, new Uint8Array([0]), textBytes)
  const length = writeUint32BE(chunkData.length)
  const type = new TextEncoder().encode('tEXt')
  const crcInput = concat(type, chunkData)
  const crc = writeUint32BE(crc32(crcInput))
  return concat(length, type, chunkData, crc)
}

/** Insert a tEXt chunk before IEND in a PNG buffer */
export function embedDataInPng(pngBuffer: ArrayBuffer, jsonData: string): ArrayBuffer {
  const data = new Uint8Array(pngBuffer)

  // Find IEND chunk
  let iendOffset = -1
  let offset = 8 // skip PNG signature
  while (offset < data.length) {
    const length = readUint32BE(data, offset)
    const type = String.fromCharCode(...data.slice(offset + 4, offset + 8))
    if (type === 'IEND') {
      iendOffset = offset
      break
    }
    offset += 12 + length
  }

  if (iendOffset === -1) throw new Error('Invalid PNG: IEND not found')

  const textChunk = createTextChunk(jsonData)
  const before = data.slice(0, iendOffset)
  const after = data.slice(iendOffset)
  const result = concat(before, textChunk, after)
  return result.buffer as ArrayBuffer
}

/** Extract embedded JSON from PNG tEXt chunk with keyword 'seatfinder' */
export function extractDataFromPng(pngBuffer: ArrayBuffer): string | null {
  const data = new Uint8Array(pngBuffer)
  let offset = 8

  while (offset + 8 <= data.length) {
    const length = readUint32BE(data, offset)
    const typeBytes = data.slice(offset + 4, offset + 8)
    const type = String.fromCharCode(...typeBytes)

    if (type === 'tEXt' && length > 0) {
      const chunkStart = offset + 8
      const chunkData = data.slice(chunkStart, chunkStart + length)

      // Check keyword
      let nullIdx = -1
      for (let i = 0; i < chunkData.length; i++) {
        if (chunkData[i] === 0) {
          nullIdx = i
          break
        }
      }

      if (nullIdx > 0) {
        const keyword = new TextDecoder().decode(chunkData.slice(0, nullIdx))
        if (keyword === KEYWORD) {
          return new TextDecoder().decode(chunkData.slice(nullIdx + 1))
        }
      }
    }

    if (type === 'IEND') break
    offset += 12 + length
  }

  return null
}

export function serializePlan(state: SeatingPlanState): string {
  return JSON.stringify({ version: 1, ...state })
}

export function parsePlan(json: string): SeatingPlanState {
  const parsed = JSON.parse(json)
  if (!parsed.guests || !parsed.tables) {
    throw new Error('Invalid seating plan file')
  }
  return {
    projectName: parsed.projectName ?? 'Untitled',
    guests: parsed.guests,
    groups: parsed.groups ?? [],
    tables: (parsed.tables as Table[]).map((t) => ({ ...t, rotation: t.rotation ?? 0 })),
    constraints: parsed.constraints ?? {
      sameTableBlacklist: [],
      adjacencyBlacklist: [],
      mustSitTogether: [],
    },
    weights: parsed.weights ?? {
      groupTogether: 50,
      tableBalance: 10,
      mustSitTogether: 80,
      emptySeat: 5,
    },
  }
}
