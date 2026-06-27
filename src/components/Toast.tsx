import { useUiStore } from '../store/useUiStore'

export function Toast() {
  const toast = useUiStore((s) => s.toast)
  if (!toast) return null

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[110] -translate-x-1/2">
      <div className="pointer-events-auto rounded-full border border-border bg-ink px-4 py-2 text-sm font-medium text-white shadow-lg">
        {toast}
      </div>
    </div>
  )
}
