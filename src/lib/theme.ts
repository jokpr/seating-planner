export type ThemePreference = 'light' | 'dark' | 'system'

export const THEME_STORAGE_KEY = 'seatfinder-theme'

export function getStoredTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {
    /* ignore */
  }
  return 'system'
}

export function resolveTheme(preference: ThemePreference): 'light' | 'dark' {
  if (preference === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return preference
}

export function applyTheme(preference: ThemePreference) {
  const resolved = resolveTheme(preference)
  document.documentElement.classList.toggle('dark', resolved === 'dark')
  document.documentElement.style.colorScheme = resolved
}

let systemListener: (() => void) | null = null

export function initTheme(onSystemChange?: (preference: ThemePreference) => void) {
  const preference = getStoredTheme()
  applyTheme(preference)

  if (systemListener) {
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', systemListener)
  }

  systemListener = () => {
    const current = getStoredTheme()
    if (current === 'system') {
      applyTheme('system')
      onSystemChange?.('system')
    }
  }
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', systemListener)

  return preference
}

export function persistTheme(preference: ThemePreference) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    /* ignore */
  }
  applyTheme(preference)
}
