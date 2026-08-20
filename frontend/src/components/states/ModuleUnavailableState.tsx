import { Construction } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS, type AppModuleId } from '../../config/routes.config.ts';
import { SYSTEM_TEXTS } from '../../i18n/system.ts';
import { SYSTEM_THEME } from '../../theme/system.ts';

interface ModuleUnavailableStateProps {
  moduleId: AppModuleId;
}

export function ModuleUnavailableState({ moduleId }: ModuleUnavailableStateProps) {
  const navigate = useNavigate();
  const moduleName = SYSTEM_TEXTS.navigation.modules[moduleId].name;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className={SYSTEM_THEME.feedback.shell} aria-labelledby="planned-module-title">
        <div className={SYSTEM_THEME.feedback.content}>
          <Construction className={`${SYSTEM_THEME.feedback.icon} text-amber-500`} aria-hidden="true" />
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-600">
            {SYSTEM_TEXTS.navigation.plannedBadge}
          </p>
          <h1 id="planned-module-title" className={SYSTEM_THEME.feedback.title}>
            {moduleName}
          </h1>
          <p className={SYSTEM_THEME.feedback.description}>{SYSTEM_TEXTS.feedback.moduleUnavailableDescription}</p>
          <button type="button" className={SYSTEM_THEME.feedback.retry} onClick={() => navigate(ROUTE_PATHS.home)}>
            {SYSTEM_TEXTS.feedback.backToHome}
          </button>
        </div>
      </section>
    </main>
  );
}
