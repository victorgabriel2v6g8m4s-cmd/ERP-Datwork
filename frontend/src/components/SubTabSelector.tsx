import { useNavigate } from 'react-router-dom';
import { type LucideIcon } from 'lucide-react';

interface SubTabItem {
    id: string;
    label: string;
    path: string;
    icon?: LucideIcon;
    disabled?: boolean;
    badge?: string;
}

interface SubTabSelectorProps {
    tabs: SubTabItem[];
    activeTabId: string;
}

export function SubTabSelector({ tabs, activeTabId }: SubTabSelectorProps) {
    const navigate = useNavigate();

    return (
        <div className="flex p-1 bg-slate-100 border border-slate-200/40 rounded-2xl w-full max-w-md mx-auto font-bold text-xs gap-1.5 shadow-3xs bg-slate-100/80 select-none">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTabId === tab.id;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        disabled={tab.disabled}
                        onClick={() => navigate(tab.path)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-center transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${tab.disabled ? 'cursor-not-allowed text-slate-400 opacity-70' : 'cursor-pointer'} ${isActive ? 'bg-white text-slate-900 shadow-3xs font-black' : 'text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        {Icon && <Icon className="w-3.5 h-3.5 opacity-80" />}
                        <span>{tab.label}</span>
                        {tab.badge && <span className="text-[8px] font-black uppercase text-amber-700">{tab.badge}</span>}
                    </button>
                );
            })}
        </div>
    );
}
