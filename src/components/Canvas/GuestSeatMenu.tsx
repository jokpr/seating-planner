import { Ban, Heart, Lock, Unlock, UserX, X } from 'lucide-react'
import type { Guest } from '../../types'
import { useSeatingStore } from '../../store/useSeatingStore'
import { RULE_META, useUiStore, type RuleType } from '../../store/useUiStore'

const RULE_ICON: Record<RuleType, typeof Ban> = {
  sameTableBlacklist: UserX,
  adjacencyBlacklist: Ban,
  mustSitTogether: Heart,
}

export function GuestSeatMenu({ guest }: { guest: Guest }) {
  const toggleGuestLock = useSeatingStore((s) => s.toggleGuestLock)
  const unassignGuest = useSeatingStore((s) => s.unassignGuest)
  const closeMenu = useUiStore((s) => s.closeMenu)
  const startLink = useUiStore((s) => s.startLink)
  const showToast = useUiStore((s) => s.showToast)

  const beginRule = (type: RuleType) => {
    startLink(guest.id, type)
    showToast(`Now click the guest who ${RULE_META[type].verb} ${guest.name}.`)
  }

  return (
    <>
      {/* click-away backdrop */}
      <div className="fixed inset-0 z-40" onClick={closeMenu} />
      <div
        className="absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border bg-cream/50 px-3 py-2">
          <span className="truncate text-xs font-semibold text-ink">{guest.name}</span>
          <button type="button" onClick={closeMenu} className="text-muted hover:text-ink">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-1">
          <MenuItem
            icon={guest.locked ? Unlock : Lock}
            label={guest.locked ? 'Unlock seat' : 'Lock in this seat'}
            onClick={() => {
              toggleGuestLock(guest.id)
              closeMenu()
            }}
          />
          <MenuItem
            icon={UserX}
            label="Remove from table"
            disabled={guest.locked}
            onClick={() => {
              unassignGuest(guest.id)
              closeMenu()
            }}
          />
        </div>

        <div className="border-t border-border px-3 py-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted">Create a rule</p>
        </div>
        <div className="p-1 pb-2">
          {(Object.keys(RULE_META) as RuleType[]).map((type) => (
            <MenuItem
              key={type}
              icon={RULE_ICON[type]}
              label={`${RULE_META[type].label}…`}
              onClick={() => beginRule(type)}
            />
          ))}
        </div>
      </div>
    </>
  )
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof Ban
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-ink transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Icon className="h-3.5 w-3.5 text-muted" />
      {label}
    </button>
  )
}
