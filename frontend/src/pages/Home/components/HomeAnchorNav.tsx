import { Link2, type LucideIcon } from 'lucide-react';

interface AnchorGroup {
  id: string;
  title: string;
  icon: LucideIcon;
}

interface HomeAnchorNavProps {
  groups: AnchorGroup[];
  currentHash: string;
  onAnchorClick: (id: string) => void;
  sectionLabel: string;
}

export function HomeAnchorNav({ groups, currentHash, onAnchorClick, sectionLabel }: HomeAnchorNavProps) {
  return (
    <div className="space-y-2 select-none text-left">
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
        <Link2 className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" /> {sectionLabel}
      </span>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none w-full pb-1">
        {groups.map((group) => {
          const AnchorIcon = group.icon;
          const isCurrentActive = currentHash === `#${group.id}`;
          return (
            <button
              key={`anchor-${group.id}`}
              type="button"
              onClick={() => onAnchorClick(group.id)}
              aria-current={isCurrentActive ? 'location' : undefined}
              className={`min-h-11 px-3 py-2 rounded-xl border font-black text-[10px] uppercase tracking-wider shrink-0 flex items-center gap-1.5 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isCurrentActive
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-3xs shadow-indigo-100'
                  : 'bg-white border-slate-200/80 text-slate-500 hover:border-slate-300'
              }`}
            >
              <AnchorIcon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{group.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
