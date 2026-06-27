import { toPng } from 'html-to-image'
import type { SeatingPlanState } from '../../types'
import { downloadBlob } from '../utils'
import { embedDataInPng, serializePlan } from './pngMetadata'

async function waitForFonts(): Promise<void> {
  try {
    await document.fonts.ready
  } catch {
    // ignore
  }
  await new Promise((resolve) => setTimeout(resolve, 100))
}

export async function exportPlanAsPng(
  element: HTMLElement,
  state: SeatingPlanState,
): Promise<void> {
  await waitForFonts()

  const exportRoot = element.querySelector('.export-root') as HTMLElement | null
  const target = exportRoot ?? element

  // Temporarily make visible for capture (still behind content via z-index)
  const prevOpacity = element.style.opacity
  const prevZIndex = element.style.zIndex
  element.style.opacity = '1'
  element.style.zIndex = '9999'

  try {
    const dataUrl = await toPng(target, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#faf8f5',
      cacheBust: true,
      skipFonts: false,
    })

    const response = await fetch(dataUrl)
    const pngBuffer = await response.arrayBuffer()
    const json = serializePlan(state)
    const embedded = embedDataInPng(pngBuffer, json)
    const blob = new Blob([embedded], { type: 'image/png' })
    const filename = `${sanitizeFilename(state.projectName)}-seating.png`
    downloadBlob(blob, filename)
  } finally {
    element.style.opacity = prevOpacity
    element.style.zIndex = prevZIndex
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'seating-plan'
}
