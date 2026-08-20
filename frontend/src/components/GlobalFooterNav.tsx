import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import { isModuleActive, type NavigationGroupId } from '../config/routes.config.ts';
import { SYSTEM_TEXTS } from '../i18n/system.ts';
import {
  findActiveNavigationGroup,
  NAVIGATION_GROUP_VIEWS,
  type NavigationGroupView
} from '../navigation/navigation.registry.ts';
import { SYSTEM_THEME } from '../theme/system.ts';

export function GlobalFooterNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openedGroupId, setOpenedGroupId] = useState<NavigationGroupId | null>(null);
  const [isFooterVisible, setIsFooterVisible] = useState(true);
  const lastScrollY = useRef(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpenedGroupId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY.current && currentScrollY > 30;
      setIsFooterVisible(!isScrollingDown);
      if (isScrollingDown) setOpenedGroupId(null);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeGroupId = findActiveNavigationGroup(location.pathname);
  const openedGroup = NAVIGATION_GROUP_VIEWS.find((group) => group.id === openedGroupId);

  const handleGroupClick = (group: NavigationGroupView) => {
    if (group.id === 'home') {
      setOpenedGroupId(null);
      navigate(group.modules[0].path);
      return;
    }
    setOpenedGroupId((current) => current === group.id ? null : group.id);
  };

  return (
    <motion.div
      ref={menuRef}
      animate={{ y: isFooterVisible ? 0 : 80 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className="fixed bottom-0 left-0 right-0 z-40 w-full font-sans"
    >
      <AnimatePresence>
        {openedGroup && openedGroup.modules.length > 0 && (
          <motion.section
            id="erp-module-drawer"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full rounded-t-3xl border border-b-0 border-slate-800 bg-slate-950/95 px-4 pb-20 pt-4 shadow-2xl backdrop-blur-md"
            aria-label={SYSTEM_TEXTS.navigation.groupDialog(openedGroup.label)}
          >
            <header className="mb-3 flex items-center justify-between border-b border-slate-800 px-1 pb-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                {SYSTEM_TEXTS.navigation.groupDialog(openedGroup.label)}
              </span>
              <button
                type="button"
                onClick={() => setOpenedGroupId(null)}
                className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                aria-label={SYSTEM_TEXTS.navigation.closeGroup}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </header>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {openedGroup.modules.map((module) => {
                const ModuleIcon = module.icon;
                const isActive = isModuleActive(location.pathname, module);
                const isAvailable = module.availability === 'available';
                return (
                  <button
                    key={module.id}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      setOpenedGroupId(null);
                      navigate(module.path);
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    className={`${SYSTEM_THEME.navigation.moduleButton} ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-600 text-white shadow-md'
                        : isAvailable
                          ? SYSTEM_THEME.navigation.availableModule
                          : SYSTEM_THEME.navigation.plannedModule
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className={`shrink-0 rounded-lg p-2 ${isActive ? 'bg-indigo-500' : 'bg-slate-800'}`}>
                        <ModuleIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-black">{module.name}</span>
                        {!isAvailable && (
                          <span className="mt-0.5 block text-[9px] font-black uppercase tracking-wider text-amber-400">
                            {SYSTEM_TEXTS.navigation.plannedBadge}
                          </span>
                        )}
                      </span>
                    </span>
                    {isAvailable && <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <nav
        className="flex h-[72px] w-full items-center justify-between border-t border-slate-800 bg-slate-950/95 px-2 py-2 shadow-2xl backdrop-blur-md sm:px-6"
        aria-label={SYSTEM_TEXTS.navigation.primaryNavigationLabel}
      >
        {NAVIGATION_GROUP_VIEWS.map((group) => {
          const GroupIcon = group.icon;
          const isSelected = openedGroupId === group.id || (!openedGroupId && activeGroupId === group.id);
          const controlsDrawer = group.id !== 'home';
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => handleGroupClick(group)}
              className={SYSTEM_THEME.navigation.footerButton}
              aria-label={controlsDrawer ? SYSTEM_TEXTS.navigation.openGroup(group.label) : group.label}
              aria-expanded={controlsDrawer ? openedGroupId === group.id : undefined}
              aria-controls={controlsDrawer ? 'erp-module-drawer' : undefined}
              aria-current={activeGroupId === group.id ? 'page' : undefined}
            >
              <span className={`flex items-center justify-center rounded-xl p-1.5 transition-all ${
                isSelected ? 'scale-105 bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}>
                <GroupIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className={`mt-1 block text-[10px] font-bold uppercase tracking-wide ${
                isSelected ? 'text-indigo-300' : 'text-slate-400'
              }`}>
                {group.label}
              </span>
              {isSelected && (
                <motion.span
                  layoutId="magneticFooterLine"
                  className="absolute bottom-0 h-0.5 w-5 rounded-full bg-indigo-400"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </motion.div>
  );
}
