import {
  BarChart3,
  Calendar,
  ChefHat,
  FlaskConical,
  Home,
  LayoutDashboard,
  Package,
  Tags,
  Wallet,
  type LucideIcon
} from 'lucide-react';
import {
  APP_MODULES,
  HOME_HIGHLIGHT_MODULE_IDS,
  NAVIGATION_GROUPS,
  TOP_TAB_MODULE_IDS,
  type AppModuleId,
  type NavigationGroupId
} from '../config/routes.config.ts';
import { SYSTEM_TEXTS } from '../i18n/system.ts';

const MODULE_ICONS: Record<AppModuleId, LucideIcon> = {
  home: Home,
  products: Tags,
  recipes: ChefHat,
  expenses: Wallet,
  pricing: Tags,
  ingredients: FlaskConical,
  inventory: Package,
  dashboard: LayoutDashboard,
  dre: BarChart3,
  agenda: Calendar
};

const GROUP_ICONS: Record<NavigationGroupId, LucideIcon> = {
  home: Home,
  engineering: ChefHat,
  supply: Package,
  finance: LayoutDashboard,
  operation: Calendar
};

const GROUP_ACCENTS: Record<NavigationGroupId, string> = {
  home: 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20',
  engineering: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
  supply: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
  finance: 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20',
  operation: 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
};

const HIGHLIGHT_GRADIENTS: Partial<Record<AppModuleId, string>> = {
  agenda: 'from-slate-900 to-rose-950 border-rose-900/30',
  recipes: 'from-slate-900 to-emerald-950 border-emerald-900/30',
  pricing: 'from-slate-900 to-indigo-950 border-indigo-900/30',
  expenses: 'from-slate-900 to-amber-950 border-amber-900/30'
};

export interface NavigationModuleView {
  id: AppModuleId;
  name: string;
  description: string;
  path: string;
  basePath: string;
  availability: 'available' | 'planned';
  icon: LucideIcon;
}

export interface NavigationGroupView {
  id: NavigationGroupId;
  label: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accentClass: string;
  modules: NavigationModuleView[];
}

function createModuleView(id: AppModuleId): NavigationModuleView {
  const module = APP_MODULES[id];
  const copy = SYSTEM_TEXTS.navigation.modules[id];
  return { ...module, ...copy, icon: MODULE_ICONS[id] };
}

export const NAVIGATION_GROUP_VIEWS: NavigationGroupView[] = NAVIGATION_GROUPS.map((group) => ({
  id: group.id,
  ...SYSTEM_TEXTS.navigation.groups[group.id],
  icon: GROUP_ICONS[group.id],
  accentClass: GROUP_ACCENTS[group.id],
  modules: group.moduleIds.map(createModuleView)
}));

export const TOP_TAB_MODULES = TOP_TAB_MODULE_IDS.map(createModuleView);

export const HOME_HIGHLIGHT_MODULES = HOME_HIGHLIGHT_MODULE_IDS.map((id) => ({
  ...createModuleView(id),
  bgGradient: HIGHLIGHT_GRADIENTS[id] ?? 'from-slate-900 to-indigo-950 border-indigo-900/30'
}));

export function findActiveNavigationGroup(pathname: string): NavigationGroupId | null {
  if (pathname === APP_MODULES.home.path) return 'home';

  return NAVIGATION_GROUP_VIEWS.find((group) =>
    group.modules.some((module) => pathname === module.basePath || pathname.startsWith(`${module.basePath}/`))
  )?.id ?? null;
}
