import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Palette, Search } from 'lucide-react';
import { GlobalFooterNav } from '../../components/GlobalFooterNav.tsx';
import { FEATURE_FLAGS, ROUTE_PATHS } from '../../config/routes.config.ts';
import { SYSTEM_TEXTS } from '../../i18n/system.ts';
import { HOME_HIGHLIGHT_MODULES, NAVIGATION_GROUP_VIEWS } from '../../navigation/navigation.registry.ts';
import { SYSTEM_THEME } from '../../theme/system.ts';
import { UI_KEYS } from '../../ui/keys.ts';
import { HomeAnchorNav } from './components/HomeAnchorNav.tsx';
import { HomeCarousel } from './components/HomeCarousel.tsx';
import { HomeModuleMatrix } from './components/HomeModuleMatrix.tsx';

const HOME_NAVIGATION_GROUPS = NAVIGATION_GROUP_VIEWS.filter((group) => group.id !== 'home');

export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(true);
  const lastScrollY = useRef(0);
  const isSearching = searchQuery.trim().length > 0;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsSearchBarVisible(!(currentScrollY > lastScrollY.current && currentScrollY > 40));
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!location.hash) return;
    const element = document.getElementById(location.hash.substring(1));
    if (!element) return;
    const animationFrame = requestAnimationFrame(() => element.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    return () => cancelAnimationFrame(animationFrame);
  }, [location.hash]);

  return (
    <div className={SYSTEM_THEME.home.shell} data-ui-key={UI_KEYS.home.page}>
      <motion.header
        animate={{ y: isSearchBarVisible ? 0 : -80 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="sticky top-0 z-30 w-full border-b border-slate-200/40 bg-white/90 px-4 py-3 shadow-2xs backdrop-blur-md"
      >
        <div className="relative mx-auto max-w-4xl">
          <label className="sr-only" htmlFor="module-search">{SYSTEM_TEXTS.navigation.moduleSearchLabel}</label>
          <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" aria-hidden="true" />
          <input
            id="module-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={SYSTEM_TEXTS.navigation.moduleSearchPlaceholder}
            className={SYSTEM_THEME.home.search}
            data-ui-key={UI_KEYS.home.search}
          />
        </div>
      </motion.header>

      <main className="mx-auto mt-4 max-w-4xl space-y-6 px-4">
        {FEATURE_FLAGS.visualEditor && !isSearching && (
          <button
            type="button"
            className="flex min-h-14 w-full items-center justify-between rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-left text-indigo-950 shadow-3xs transition-colors hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => navigate(ROUTE_PATHS.visualEditor)}
            data-ui-key={UI_KEYS.home.visualEditorAction}
          >
            <span>
              <span className="block text-sm font-black">{SYSTEM_TEXTS.visualEditor.homeAction}</span>
              <span className="mt-0.5 block text-xs font-medium text-indigo-700">{SYSTEM_TEXTS.visualEditor.homeHint}</span>
            </span>
            <Palette className="h-5 w-5 shrink-0" aria-hidden="true" />
          </button>
        )}
        {!isSearching && (
          <>
            <HomeCarousel
              items={HOME_HIGHLIGHT_MODULES}
              onNavigate={navigate}
              sectionLabel={SYSTEM_TEXTS.navigation.highlights}
              previousLabel={SYSTEM_TEXTS.navigation.previousHighlight}
              nextLabel={SYSTEM_TEXTS.navigation.nextHighlight}
            />
            <HomeAnchorNav
              groups={HOME_NAVIGATION_GROUPS}
              currentHash={location.hash}
              onAnchorClick={(id) => navigate(`#${id}`)}
              sectionLabel={SYSTEM_TEXTS.navigation.assistedNavigation}
            />
          </>
        )}

        <HomeModuleMatrix groups={HOME_NAVIGATION_GROUPS} searchQuery={searchQuery} onNavigate={navigate} />
      </main>

      <GlobalFooterNav />
    </div>
  );
}
