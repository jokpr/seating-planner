import { useUiStore } from '../store/useUiStore'
import { useIsMobile } from '../hooks/useMediaQuery'

export function Toast() {
  const toast = useUiStore((s) => s.toast)
  const isMobile = useIsMobile()
  if (!toast) return null

  return (
    <div
      className="pointer-events-none fixed left-1/2 z-[110] -translate-x-1/2 px-4"
      style={{
        bottom: isMobile
          ? 'calc(5.5rem + env(safe-area-inset-bottom))'
          : 'calc(1.5rem + env(safe-area-inset-bottom))',
      }}
    >
      <div className="pointer-events-auto max-w-[min(100vw-2rem,28rem)] rounded-full border border-border bg-ink px-4 py-2.5 text-center text-sm font-medium text-white shadow-lg">
        {toast}
      </div>
    </div>
  )
}
