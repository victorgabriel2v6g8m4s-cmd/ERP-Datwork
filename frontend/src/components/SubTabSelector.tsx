import { useNavigate } from 'react-router-dom';
import { type LucideIcon } from 'lucide-react';

interface SubTabItem {
    id: string;
    label: string;
    path: string;
    icon?: LucideIcon;
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
                        onClick={() => navigate(tab.path)}
                        className={`flex-1 py-2 text-center rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${isActive ? 'bg-white text-slate-900 shadow-3xs font-black' : 'text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        {Icon && <Icon className="w-3.5 h-3.5 opacity-80" />}
                        <span>{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
