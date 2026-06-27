import { useState } from 'react'
import { ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react'
import { GuestPool } from './GuestPool'
import { GroupManager } from './GroupManager'
import { TableManager } from './TableManager'
import { ConstraintsManager } from './ConstraintsManager'
import { WeightsPanel } from './WeightsPanel'
import { useUiStore } from '../../store/useUiStore'
import { useIsMobile } from '../../hooks/useMediaQuery'

type Tab = 'guests' | 'groups' | 'tables' | 'rules' | 'weights'

const TABS: { id: Tab; label: string }[] = [
  { id: 'guests', label: 'Guests' },
  { id: 'groups', label: 'Groups' },
  { id: 'tables', label: 'Tables' },
  { id: 'rules', label: 'Rules' },
  { id: 'weights', label: 'Weights' },
]

function SidebarTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}) {
  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-thin">
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onTabChange(id)}
          className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition ${
            activeTab === id
              ? 'bg-rose/15 text-rose-dark'
              : 'text-muted hover:bg-cream'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function SidebarPanel({ activeTab }: { activeTab: Tab }) {
  return (
    <>
      {activeTab === 'guests' && <GuestPool />}
      {activeTab === 'groups' && <GroupManager />}
      {activeTab === 'tables' && <TableManager />}
      {activeTab === 'rules' && <ConstraintsManager />}
      {activeTab === 'weights' && <WeightsPanel />}
    </>
  )
}

export function SidebarContent() {
  const [activeTab, setActiveTab] = useState<Tab>('guests')

  return (
    <>
      <SidebarTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="mt-4">
        <SidebarPanel activeTab={activeTab} />
      </div>
    </>
  )
}

export function Sidebar() {
  const isMobile = useIsMobile()
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const setCollapsed = useUiStore((s) => s.setSidebarCollapsed)
  const [activeTab, setActiveTab] = useState<Tab>('guests')

  if (isMobile) return null

  if (collapsed) {
    return (
      <aside className="hidden w-12 shrink-0 flex-col items-center border-r border-border bg-white py-3 md:flex">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="flex flex-col items-center gap-2 rounded-lg p-2 text-muted hover:bg-cream hover:text-ink"
          title="Open options"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
          <span className="mt-1 [writing-mode:vertical-rl] text-[10px] font-semibold uppercase tracking-wider">
            Options
          </span>
        </button>
      </aside>
    )
  }

  return (
    <aside className="hidden w-80 shrink-0 flex-col border-r border-border bg-white md:flex">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-serif text-lg font-semibold text-ink">Plan</h2>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="rounded p-1 hover:bg-cream"
          title="Collapse sidebar"
        >
          <ChevronUp className="h-4 w-4 rotate-[-90deg]" />
        </button>
      </div>

      <div className="border-b border-border px-2 py-2">
        <SidebarTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        <SidebarPanel activeTab={activeTab} />
      </div>
    </aside>
  )
}
