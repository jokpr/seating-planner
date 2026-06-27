import type { SeatingPlanState } from '../../types'
import { extractDataFromPng, parsePlan } from './pngMetadata'
import { importJsonFile } from './exportJson'

export async function importPlanFile(file: File): Promise<SeatingPlanState> {
  if (file.name.endsWith('.json') || file.type === 'application/json') {
    return importJsonFile(file)
  }

  if (file.name.endsWith('.png') || file.type === 'image/png') {
    const buffer = await file.arrayBuffer()
    const json = extractDataFromPng(buffer)
    if (!json) {
      throw new Error(
        'This PNG does not contain embedded seating plan data. Import a JSON file or a PNG exported from SeatFinder.',
      )
    }
    return parsePlan(json)
  }

  throw new Error('Unsupported file type. Please use .json or .png')
}
