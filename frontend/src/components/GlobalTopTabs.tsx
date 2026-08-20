import { useLocation, useNavigate } from 'react-router-dom';
import { isModuleActive } from '../config/routes.config.ts';
import { SYSTEM_TEXTS } from '../i18n/system.ts';
import { TOP_TAB_MODULES } from '../navigation/navigation.registry.ts';
import { SYSTEM_THEME } from '../theme/system.ts';

export function GlobalTopTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentModule = TOP_TAB_MODULES.find((module) => isModuleActive(location.pathname, module));

  if (!currentModule) return null;

  return (
    <nav
      className="sticky top-[69px] z-20 w-full border-b border-slate-100 bg-white shadow-3xs"
      aria-label={SYSTEM_TEXTS.navigation.topTabsLabel}
    >
      <div className="scrollbar-none mx-auto flex w-full max-w-4xl items-center justify-start gap-1 overflow-x-auto px-4 py-1.5 sm:justify-center">
        {TOP_TAB_MODULES.map((module) => {
          const isActive = currentModule.id === module.id;
          return (
            <button
              key={module.id}
              type="button"
              onClick={() => navigate(module.path)}
              aria-current={isActive ? 'page' : undefined}
              className={`${SYSTEM_THEME.navigation.topTab} ${
                isActive
                  ? 'border-indigo-100/50 bg-indigo-50 text-indigo-700 shadow-3xs'
                  : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              {module.name}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
