import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useUiStore } from '../store/useUiStore'
import type { ThemePreference } from '../lib/theme'

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export function ThemeSelector({ compact = false }: { compact?: boolean }) {
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null)

  const active = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[2]
  const ActiveIcon = active.icon

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) {
      setMenuPosition(null)
      return
    }

    const rect = buttonRef.current.getBoundingClientRect()
    const menuWidth = 120
    const menuHeight = 96
    const gap = 4
    const padding = 8

    let top = rect.bottom + gap
    if (top + menuHeight > window.innerHeight - padding) {
      top = rect.top - menuHeight - gap
    }

    const left = Math.max(
      padding,
      Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - padding),
    )

    setMenuPosition({ top, left })
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={
          compact
            ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted hover:bg-cream'
            : 'flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-cream'
        }
        title={`Theme: ${active.label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <ActiveIcon className={compact ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
        {!compact && <span className="hidden sm:inline">{active.label}</span>}
      </button>

      {open &&
        menuPosition &&
        createPortal(
          <ul
            ref={menuRef}
            role="listbox"
            aria-label="Theme"
            className="fixed z-[80] min-w-[7.5rem] overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-lg"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            {OPTIONS.map(({ value, label, icon: Icon }) => (
              <li key={value} role="option" aria-selected={theme === value}>
                <button
                  type="button"
                  onClick={() => {
                    setTheme(value)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition hover:bg-cream ${
                    theme === value ? 'font-medium text-ink' : 'text-muted'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {label}
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  )
}
