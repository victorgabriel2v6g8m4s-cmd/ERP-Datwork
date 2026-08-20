import { ChevronRight } from 'lucide-react';
import { SYSTEM_TEXTS } from '../../../i18n/system.ts';
import { type NavigationGroupView, type NavigationModuleView } from '../../../navigation/navigation.registry.ts';
import { SYSTEM_THEME } from '../../../theme/system.ts';

interface HomeModuleMatrixProps {
  groups: NavigationGroupView[];
  searchQuery: string;
  onNavigate: (path: string) => void;
}

function ModuleButton({
  module,
  onNavigate
}: {
  module: NavigationModuleView;
  onNavigate: (path: string) => void;
}) {
  const ModuleIcon = module.icon;
  const isAvailable = module.availability === 'available';

  return (
    <button
      type="button"
      disabled={!isAvailable}
      onClick={() => onNavigate(module.path)}
      className={`${SYSTEM_THEME.home.moduleButton} ${
        isAvailable ? SYSTEM_THEME.home.availableModule : SYSTEM_THEME.home.plannedModule
      }`}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="shrink-0 rounded-lg border border-slate-200 bg-white p-2 text-slate-600">
          <ModuleIcon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-[11px] font-black leading-tight text-slate-800">{module.name}</span>
          <span className="mt-0.5 block text-[10px] font-bold leading-tight text-slate-500">{module.description}</span>
          {!isAvailable && (
            <span className="mt-1 block text-[9px] font-black uppercase tracking-wider text-amber-700">
              {SYSTEM_TEXTS.navigation.plannedBadge}
            </span>
          )}
        </span>
      </span>
      {isAvailable && <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />}
    </button>
  );
}

function ModuleGroupSection({
  group,
  onNavigate
}: {
  group: NavigationGroupView;
  onNavigate: (path: string) => void;
}) {
  const GroupIcon = group.icon;
  return (
    <section
      id={group.id}
      className="scroll-mt-20 space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-3xs"
      aria-labelledby={`module-group-${group.id}`}
    >
      <header className="flex w-full items-center gap-3 border-b border-slate-100 pb-2.5">
        <span className={`shrink-0 rounded-xl p-2 ${group.accentClass}`}>
          <GroupIcon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span>
          <h2 id={`module-group-${group.id}`} className="text-xs font-black uppercase tracking-wider text-slate-800">
            {group.title}
          </h2>
          <p className="mt-0.5 text-[10px] font-bold text-slate-500">{group.subtitle}</p>
        </span>
      </header>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {group.modules.map((module) => (
          <ModuleButton key={module.id} module={module} onNavigate={onNavigate} />
        ))}
      </div>
    </section>
  );
}

export function HomeModuleMatrix({ groups, searchQuery, onNavigate }: HomeModuleMatrixProps) {
  const normalizedSearch = searchQuery.trim().toLocaleLowerCase('pt-BR');
  const isSearching = normalizedSearch.length > 0;
  const searchableModules = groups.flatMap((group) => group.modules);
  const filteredModules = searchableModules.filter((module) =>
    module.name.toLocaleLowerCase('pt-BR').includes(normalizedSearch)
    || module.description.toLocaleLowerCase('pt-BR').includes(normalizedSearch)
  );

  return (
    <section className="space-y-4" aria-live="polite">
      <h2 className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
        {isSearching ? SYSTEM_TEXTS.navigation.filteredModules : SYSTEM_TEXTS.navigation.moduleMap}
      </h2>

      {isSearching ? (
        filteredModules.length > 0 ? (
          <div className="grid animate-fadeIn grid-cols-1 gap-2.5 sm:grid-cols-2">
            {filteredModules.map((module) => (
              <ModuleButton key={module.id} module={module} onNavigate={onNavigate} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs font-bold text-slate-500">
            {SYSTEM_TEXTS.navigation.noSearchResults}
          </p>
        )
      ) : (
        <div className="space-y-4">
          {groups.filter((group) => group.id !== 'home').map((group) => (
            <ModuleGroupSection key={group.id} group={group} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </section>
  );
}
