import { toPng } from 'html-to-image'
import type { SeatingPlanState } from '../../types'
import { downloadBlob } from '../utils'
import { embedDataInPng, serializePlan } from './pngMetadata'

export async function exportPlanAsPng(
  element: HTMLElement,
  state: SeatingPlanState,
): Promise<void> {
  const dataUrl = await toPng(element, {
    quality: 1,
    pixelRatio: 2,
    backgroundColor: '#faf8f5',
  })

  const response = await fetch(dataUrl)
  const pngBuffer = await response.arrayBuffer()
  const json = serializePlan(state)
  const embedded = embedDataInPng(pngBuffer, json)
  const blob = new Blob([embedded], { type: 'image/png' })
  const filename = `${sanitizeFilename(state.projectName)}-seating.png`
  downloadBlob(blob, filename)
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'seating-plan'
}
