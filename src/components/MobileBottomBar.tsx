import {
  Download,
  HelpCircle,
  Image,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Upload,
  Wrench,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { useSeatingStore, getStoreSnapshot } from '../store/useSeatingStore'
import { useUiStore } from '../store/useUiStore'
import { useOptimizer } from '../hooks/useOptimizer'
import { useConflicts } from '../hooks/useConflicts'
import { useIsMobile } from '../hooks/useMediaQuery'
import { exportJson } from '../lib/export/exportJson'
import { exportPlanAsPng } from '../lib/export/exportImage'
import { importPlanFile } from '../lib/export/importPlan'
import { cn } from '../lib/utils'
import { MobileSheet } from './MobileSheet'
import { SidebarContent } from './Sidebar/Sidebar'
import { CanvasToolbarContent } from './Canvas/CanvasToolbar'

interface MobileBottomBarProps {
  exportViewRef: React.RefObject<HTMLDivElement | null>
}

export function MobileBottomBar({ exportViewRef }: MobileBottomBarProps) {
  const isMobile = useIsMobile()
  const mobileSheet = useUiStore((s) => s.mobileSheet)
  const setMobileSheet = useUiStore((s) => s.setMobileSheet)
  const toggleMobileSheet = useUiStore((s) => s.toggleMobileSheet)
  const setGuideOpen = useUiStore((s) => s.setGuideOpen)
  const { isRunning, autoArrange, reseatUnlocked } = useOptimizer()
  const { conflicts } = useConflicts()
  const guestCount = useSeatingStore((s) => s.guests.length)
  const clearAll = useSeatingStore((s) => s.clearAll)
  const importState = useSeatingStore((s) => s.importState)
  const showToast = useUiStore((s) => s.showToast)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)

  if (!isMobile) return null

  const handleAutoArrange = async () => {
    setMobileSheet(null)
    const result = await autoArrange()
    showToast(
      result.conflicts.length > 0
        ? `Arranged with ${result.conflicts.length} remaining conflict(s)`
        : 'Perfect arrangement found!',
    )
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const state = await importPlanFile(file)
      importState(state)
      setStatus('Plan imported')
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
      setStatus('PNG exported')
    } catch {
      setStatus('PNG export failed')
    }
    setTimeout(() => setStatus(null), 3000)
  }

  const handleReseatUnlocked = async () => {
    setMobileSheet(null)
    const result = await reseatUnlocked()
    showToast(
      result.conflicts.length > 0
        ? `Reseated — ${result.conflicts.length} conflict(s) remain`
        : 'Unlocked guests reseated',
    )
  }

  return (
    <>
      {status && (
        <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-1/2 z-[80] -translate-x-1/2 rounded-full bg-sage/20 px-3 py-1 text-xs text-sage">
          {status}
        </div>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-[70] border-t border-border bg-white/95 backdrop-blur-md md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-4 gap-1 px-2 py-1.5">
          <NavButton
            label="Plan"
            icon={SlidersHorizontal}
            active={mobileSheet === 'plan'}
            onClick={() => toggleMobileSheet('plan')}
          />
          <NavButton
            label="Tools"
            icon={Wrench}
            active={mobileSheet === 'tools'}
            onClick={() => toggleMobileSheet('tools')}
          />
          <NavButton
            label="Arrange"
            icon={isRunning ? Loader2 : Sparkles}
            primary
            spinning={isRunning}
            disabled={isRunning}
            badge={conflicts.length > 0 ? conflicts.length : undefined}
            onClick={handleAutoArrange}
          />
          <NavButton
            label="More"
            icon={MoreHorizontal}
            active={mobileSheet === 'more'}
            onClick={() => toggleMobileSheet('more')}
          />
        </div>
      </nav>

      <MobileSheet
        open={mobileSheet === 'plan'}
        onClose={() => setMobileSheet(null)}
        title="Plan"
      >
        <SidebarContent />
      </MobileSheet>

      <MobileSheet
        open={mobileSheet === 'tools'}
        onClose={() => setMobileSheet(null)}
        title="Quick tools"
      >
        <CanvasToolbarContent />
      </MobileSheet>

      <MobileSheet
        open={mobileSheet === 'more'}
        onClose={() => setMobileSheet(null)}
        title="More actions"
      >
        <div className="space-y-2">
          <ActionRow icon={RefreshCw} label="Reseat unlocked" disabled={isRunning} onClick={handleReseatUnlocked} />
          <ActionRow icon={Download} label="Export JSON" onClick={handleExportJson} />
          <ActionRow icon={Image} label="Export PNG" onClick={handleExportPng} />
          <ActionRow icon={Upload} label="Import plan" onClick={() => fileInputRef.current?.click()} />
          <ActionRow icon={HelpCircle} label="How it works" onClick={() => { setMobileSheet(null); setGuideOpen(true) }} />
          {guestCount > 0 && (
            <ActionRow
              icon={Trash2}
              label="Clear all & start fresh"
              destructive
              onClick={() => {
                if (confirm('Clear everything and start a fresh plan?')) {
                  clearAll()
                  setMobileSheet(null)
                  showToast('Cleared — fresh start')
                }
              }}
            />
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.png,application/json,image/png"
          className="hidden"
          onChange={handleImport}
        />
      </MobileSheet>
    </>
  )
}

function NavButton({
  label,
  icon: Icon,
  onClick,
  active,
  primary,
  disabled,
  badge,
  spinning,
}: {
  label: string
  icon: typeof Sparkles
  onClick: () => void
  active?: boolean
  primary?: boolean
  disabled?: boolean
  badge?: number
  spinning?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium transition',
        primary
          ? 'bg-gradient-to-r from-rose to-rose-dark text-white shadow-sm disabled:opacity-60'
          : active
            ? 'bg-rose/15 text-rose-dark'
            : 'text-muted hover:bg-cream hover:text-ink',
      )}
    >
      <Icon className={cn('h-5 w-5', spinning && 'animate-spin')} />
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  )
}

function ActionRow({
  icon: Icon,
  label,
  onClick,
  disabled,
  destructive,
}: {
  icon: typeof Download
  label: string
  onClick: () => void
  disabled?: boolean
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border border-border px-4 py-3 text-left text-sm font-medium transition hover:bg-cream disabled:opacity-50',
        destructive ? 'text-red-600' : 'text-ink',
      )}
    >
      <Icon className="h-4 w-4 shrink-0 text-muted" />
      {label}
    </button>
  )
}
