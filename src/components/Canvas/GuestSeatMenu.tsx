import { useState } from 'react'
import { Ban, Heart, Lock, Palette, Plus, Unlock, UserX, X } from 'lucide-react'
import type { Guest } from '../../types'
import { useSeatingStore } from '../../store/useSeatingStore'
import { RULE_META, useUiStore, type RuleType } from '../../store/useUiStore'

const RULE_ICON: Record<RuleType, typeof Ban> = {
  sameTableBlacklist: UserX,
  adjacencyBlacklist: Ban,
  mustSitTogether: Heart,
}

export function GuestSeatMenu({
  guest,
  placement = 'bottom',
}: {
  guest: Guest
  placement?: 'top' | 'bottom'
}) {
  const groups = useSeatingStore((s) => s.groups)
  const addGroup = useSeatingStore((s) => s.addGroup)
  const updateGuest = useSeatingStore((s) => s.updateGuest)
  const toggleGuestLock = useSeatingStore((s) => s.toggleGuestLock)
  const unassignGuest = useSeatingStore((s) => s.unassignGuest)
  const closeMenu = useUiStore((s) => s.closeMenu)
  const startLink = useUiStore((s) => s.startLink)
  const showToast = useUiStore((s) => s.showToast)
  const [newGroupName, setNewGroupName] = useState('')

  const beginRule = (type: RuleType) => {
    startLink(guest.id, type)
    showToast(`Now click the guest who ${RULE_META[type].verb} ${guest.name}.`)
  }

  const assignGroup = (groupId: string | undefined, groupName?: string) => {
    updateGuest(guest.id, { groupId })
    showToast(groupName ? `${guest.name} added to ${groupName}` : `${guest.name} removed from groups`)
    closeMenu()
  }

  const createAndAssignGroup = () => {
    const name = newGroupName.trim()
    if (!name) return
    const groupId = addGroup(name)
    updateGuest(guest.id, { groupId })
    showToast(`${guest.name} added to ${name}`)
    closeMenu()
  }

  return (
    <>
      {/* click-away backdrop */}
      <div className="fixed inset-0 z-40" onClick={closeMenu} />
      <div
        className={`absolute left-1/2 z-50 w-64 -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-white shadow-2xl ${
          placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-cream to-white px-3 py-2">
          <div className="min-w-0">
            <span className="block truncate text-xs font-semibold text-ink">{guest.name}</span>
            <span className="text-[10px] text-muted">
              {groups.find((g) => g.id === guest.groupId)?.name ?? 'No group yet'}
            </span>
          </div>
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
          {guest.seat && (
            <MenuItem
              icon={UserX}
              label="Remove from table"
              disabled={guest.locked}
              onClick={() => {
                unassignGuest(guest.id)
                closeMenu()
              }}
            />
          )}
        </div>

        <div className="border-t border-border px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <Palette className="h-3 w-3 text-rose-dark" />
            <p className="text-[10px] uppercase tracking-wide text-muted">Group</p>
          </div>
        </div>
        <div className="px-2 pb-2">
          <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto pr-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => assignGroup(undefined)}
              className={`rounded-full border px-2 py-1 text-[11px] transition ${
                !guest.groupId
                  ? 'border-rose bg-rose/15 text-rose-dark'
                  : 'border-border bg-cream/50 text-muted hover:bg-cream'
              }`}
            >
              No group
            </button>
            {groups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => assignGroup(group.id, group.name)}
                className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] transition ${
                  guest.groupId === group.id
                    ? 'border-rose bg-rose/15 text-rose-dark'
                    : 'border-border bg-white text-ink hover:border-rose/50'
                }`}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: group.color }} />
                <span className="max-w-[8rem] truncate">{group.name}</span>
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-1.5 rounded-xl border border-border bg-cream/40 p-1">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createAndAssignGroup()}
              placeholder="New group..."
              className="min-w-0 flex-1 bg-transparent px-1.5 text-xs outline-none placeholder:text-muted"
            />
            <button
              type="button"
              onClick={createAndAssignGroup}
              className="rounded-lg bg-sage px-2 py-1 text-white transition hover:opacity-90"
              title="Create group and assign"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
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
