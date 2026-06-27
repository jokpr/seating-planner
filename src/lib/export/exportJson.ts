import type { SeatingPlanState } from '../../types'
import { downloadBlob } from '../utils'
import { parsePlan, serializePlan } from './pngMetadata'

export function exportJson(state: SeatingPlanState) {
  const json = serializePlan(state)
  const blob = new Blob([json], { type: 'application/json' })
  const filename = `${sanitizeFilename(state.projectName)}-seating.json`
  downloadBlob(blob, filename)
}

export async function importJsonFile(file: File): Promise<SeatingPlanState> {
  const text = await file.text()
  return parsePlan(text)
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'seating-plan'
}
