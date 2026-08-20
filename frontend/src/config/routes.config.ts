export const ROUTE_PATHS = {
  login: '/login',
  faq: '/faq',
  home: '/home',
  agenda: '/agenda',
  agendaSettings: '/agenda/settings',
  dashboard: '/dashboard',
  dre: '/dre',
  inventory: '/estoque',
  ingredients: '/insumos',
  products: '/produtos',
  recipes: '/receitas',
  expenses: '/despesas',
  expensesFixed: '/despesas/custos-fixos',
  pricing: '/precificacao',
  pricingSettings: '/precificacao/ajustes',
  pricingProducts: '/precificacao/produtos',
  pricingServices: '/precificacao/servicos'
} as const;

export const FEATURE_FLAGS = {
  realAuthentication: false,
  modules: {
    dashboard: false,
    dre: false,
    inventory: false,
    pricingServices: false
  }
} as const;

export type AppModuleId =
  | 'home'
  | 'products'
  | 'recipes'
  | 'expenses'
  | 'pricing'
  | 'ingredients'
  | 'inventory'
  | 'dashboard'
  | 'dre'
  | 'agenda';

export type NavigationGroupId = 'home' | 'engineering' | 'supply' | 'finance' | 'operation';
export type ModuleAvailability = 'available' | 'planned';

export interface AppModuleMetadata {
  id: AppModuleId;
  path: string;
  basePath: string;
  groupId: NavigationGroupId;
  availability: ModuleAvailability;
}

export const APP_MODULES: Record<AppModuleId, AppModuleMetadata> = {
  home: { id: 'home', path: ROUTE_PATHS.home, basePath: ROUTE_PATHS.home, groupId: 'home', availability: 'available' },
  products: { id: 'products', path: ROUTE_PATHS.products, basePath: ROUTE_PATHS.products, groupId: 'engineering', availability: 'available' },
  recipes: { id: 'recipes', path: ROUTE_PATHS.recipes, basePath: ROUTE_PATHS.recipes, groupId: 'engineering', availability: 'available' },
  expenses: { id: 'expenses', path: ROUTE_PATHS.expensesFixed, basePath: ROUTE_PATHS.expenses, groupId: 'engineering', availability: 'available' },
  pricing: { id: 'pricing', path: ROUTE_PATHS.pricingProducts, basePath: ROUTE_PATHS.pricing, groupId: 'engineering', availability: 'available' },
  ingredients: { id: 'ingredients', path: ROUTE_PATHS.ingredients, basePath: ROUTE_PATHS.ingredients, groupId: 'supply', availability: 'available' },
  inventory: { id: 'inventory', path: ROUTE_PATHS.inventory, basePath: ROUTE_PATHS.inventory, groupId: 'supply', availability: FEATURE_FLAGS.modules.inventory ? 'available' : 'planned' },
  dashboard: { id: 'dashboard', path: ROUTE_PATHS.dashboard, basePath: ROUTE_PATHS.dashboard, groupId: 'finance', availability: FEATURE_FLAGS.modules.dashboard ? 'available' : 'planned' },
  dre: { id: 'dre', path: ROUTE_PATHS.dre, basePath: ROUTE_PATHS.dre, groupId: 'finance', availability: FEATURE_FLAGS.modules.dre ? 'available' : 'planned' },
  agenda: { id: 'agenda', path: ROUTE_PATHS.agenda, basePath: ROUTE_PATHS.agenda, groupId: 'operation', availability: 'available' }
};

export const NAVIGATION_GROUPS: ReadonlyArray<{
  id: NavigationGroupId;
  moduleIds: readonly AppModuleId[];
}> = [
  { id: 'home', moduleIds: ['home'] },
  { id: 'engineering', moduleIds: ['products', 'recipes', 'expenses', 'pricing'] },
  { id: 'supply', moduleIds: ['inventory', 'ingredients'] },
  { id: 'finance', moduleIds: ['dashboard', 'dre'] },
  { id: 'operation', moduleIds: ['agenda'] }
];

export const TOP_TAB_MODULE_IDS = ['products', 'recipes', 'pricing', 'expenses'] as const;
export const HOME_HIGHLIGHT_MODULE_IDS = ['agenda', 'recipes', 'pricing', 'expenses'] as const;

export function isModuleActive(pathname: string, module: Pick<AppModuleMetadata, 'basePath'>): boolean {
  return pathname === module.basePath || pathname.startsWith(`${module.basePath}/`);
}
