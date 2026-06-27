import { useRef, useState } from 'react'
import {
  Download,
  HelpCircle,
  Image,
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react'
import { useSeatingStore, getStoreSnapshot } from '../store/useSeatingStore'
import { useUiStore } from '../store/useUiStore'
import { useOptimizer } from '../hooks/useOptimizer'
import { useConflicts } from '../hooks/useConflicts'
import { exportJson } from '../lib/export/exportJson'
import { exportPlanAsPng } from '../lib/export/exportImage'
import { importPlanFile } from '../lib/export/importPlan'

interface TopBarProps {
  exportViewRef: React.RefObject<HTMLDivElement | null>
}

export function TopBar({ exportViewRef }: TopBarProps) {
  const projectName = useSeatingStore((s) => s.projectName)
  const setProjectName = useSeatingStore((s) => s.setProjectName)
  const importState = useSeatingStore((s) => s.importState)
  const clearAll = useSeatingStore((s) => s.clearAll)
  const guestCount = useSeatingStore((s) => s.guests.length)
  const setGuideOpen = useUiStore((s) => s.setGuideOpen)
  const { isRunning, autoArrange, reseatUnlocked } = useOptimizer()
  const { conflicts } = useConflicts()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const state = await importPlanFile(file)
      importState(state)
      setStatus('Plan imported successfully')
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Import failed')
    }
    e.target.value = ''
    setTimeout(() => setStatus(null), 4000)
  }

  const handleExportJson = () => {
    exportJson(getStoreSnapshot())
    setStatus('JSON exported')
    setTimeout(() => setStatus(null), 2000)
  }

  const handleExportPng = async () => {
    if (!exportViewRef.current) return
    try {
      await exportPlanAsPng(exportViewRef.current, getStoreSnapshot())
      setStatus('PNG exported with embedded plan data')
    } catch {
      setStatus('PNG export failed')
    }
    setTimeout(() => setStatus(null), 3000)
  }

  const handleAutoArrange = async () => {
    const result = await autoArrange()
    setStatus(
      result.conflicts.length > 0
        ? `Arranged with ${result.conflicts.length} remaining conflict(s)`
        : 'Perfect arrangement found!',
    )
    setTimeout(() => setStatus(null), 4000)
  }

  const handleReseatUnlocked = async () => {
    const result = await reseatUnlocked()
    setStatus(
      result.conflicts.length > 0
        ? `Reseated unlocked guests — ${result.conflicts.length} conflict(s) remain`
        : 'Unlocked guests reseated successfully',
    )
    setTimeout(() => setStatus(null), 4000)
  }

  return (
    <header className="flex items-center gap-4 border-b border-border bg-white px-6 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose to-rose-dark text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted">SeatFinder</p>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-transparent font-serif text-lg font-semibold text-ink outline-none"
            style={{ fontFamily: 'Playfair Display, serif' }}
          />
        </div>
      </div>

      <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
        {conflicts.length > 0 && (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
            {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''}
          </span>
        )}

        {status && (
          <span className="rounded-full bg-sage/20 px-3 py-1 text-xs text-sage">{status}</span>
        )}

        <button
          type="button"
          onClick={handleAutoArrange}
          disabled={isRunning}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-rose to-rose-dark px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
        >
          {isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Auto-arrange
        </button>

        <button
          type="button"
          onClick={handleReseatUnlocked}
          disabled={isRunning}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-ink transition hover:bg-cream disabled:opacity-60"
        >
          <RefreshCw className="h-4 w-4" />
          Reseat unlocked
        </button>

        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

        <button
          type="button"
          onClick={handleExportJson}
          className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm hover:bg-cream"
          title="Export JSON"
        >
          <Download className="h-4 w-4" />
          JSON
        </button>

        <button
          type="button"
          onClick={handleExportPng}
          className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm hover:bg-cream"
          title="Export PNG with embedded plan"
        >
          <Image className="h-4 w-4" />
          PNG
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm hover:bg-cream"
        >
          <Upload className="h-4 w-4" />
          Import
        </button>

        {guestCount > 0 && (
          <button
            type="button"
            onClick={() => {
              if (confirm('Clear everything and start a fresh plan?')) {
                clearAll()
                setStatus('Cleared — fresh start')
                setTimeout(() => setStatus(null), 2000)
              }
            }}
            className="hidden items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-muted hover:bg-cream lg:flex"
            title="Clear all and start fresh"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setGuideOpen(true)}
          className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm hover:bg-cream"
          title="How it works"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.png,application/json,image/png"
          className="hidden"
          onChange={handleImport}
        />
      </div>
    </header>
  )
}
