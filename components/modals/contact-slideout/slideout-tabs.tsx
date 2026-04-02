"use client"

export type SlideoutTab = "Profile" | "Chat" | "Opportunities" | "Research" | "Summary" | "History"

interface SlideoutTabsProps {
  activeTab: SlideoutTab
  onTabChange: (tab: SlideoutTab) => void
}

export function SlideoutTabs({ activeTab, onTabChange }: SlideoutTabsProps) {
  const tabs: SlideoutTab[] = ["Profile", "Chat", "Opportunities", "Research", "Summary", "History"]

  return (
    <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto shrink-0 no-scrollbar border border-slate-200/50">
      {tabs.map(tab => (
        <button 
          key={tab} 
          onClick={() => onTabChange(tab)}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === tab 
            ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50" 
            : "text-slate-500 hover:text-slate-900"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
