import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { GuestPool } from './GuestPool'
import { GroupManager } from './GroupManager'
import { TableManager } from './TableManager'
import { ConstraintsManager } from './ConstraintsManager'
import { WeightsPanel } from './WeightsPanel'

type Tab = 'guests' | 'groups' | 'tables' | 'rules' | 'weights'

const TABS: { id: Tab; label: string }[] = [
  { id: 'guests', label: 'Guests' },
  { id: 'groups', label: 'Groups' },
  { id: 'tables', label: 'Tables' },
  { id: 'rules', label: 'Rules' },
  { id: 'weights', label: 'Weights' },
]

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<Tab>('guests')
  const [collapsed, setCollapsed] = useState(false)

  if (collapsed) {
    return (
      <aside className="flex w-12 shrink-0 flex-col items-center border-r border-border bg-white py-4">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="rounded-lg p-2 hover:bg-cream"
          title="Expand sidebar"
        >
          <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
        </button>
      </aside>
    )
  }

  return (
    <aside className="flex w-80 shrink-0 flex-col border-r border-border bg-white">
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

      <div className="flex gap-1 overflow-x-auto border-b border-border px-2 py-2 scrollbar-thin">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === id
                ? 'bg-rose/15 text-rose-dark'
                : 'text-muted hover:bg-cream'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {activeTab === 'guests' && <GuestPool />}
        {activeTab === 'groups' && <GroupManager />}
        {activeTab === 'tables' && <TableManager />}
        {activeTab === 'rules' && <ConstraintsManager />}
        {activeTab === 'weights' && <WeightsPanel />}
      </div>
    </aside>
  )
}
