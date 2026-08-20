import { ROUTE_PATHS } from '../../../config/routes.config.ts';
import { SYSTEM_TEXTS } from '../../../i18n/system.ts';
import { UI_KEYS, type UiKey } from '../../../ui/keys.ts';
import type { EditableCssProperty, VisualPageDefinition, VisualPageId, VisualSurface } from '../contracts/visualEditor.types.ts';

const SHELL_PROPERTIES = ['color', 'backgroundColor', 'fontFamily', 'fontSize', 'padding'] as const;
const HEADER_PROPERTIES = ['color', 'backgroundColor', 'fontFamily', 'fontSize', 'fontWeight', 'padding', 'borderRadius', 'boxShadow'] as const;
const COLLECTION_PROPERTIES = ['color', 'backgroundColor', 'padding', 'gap', 'display', 'gridTemplateColumns', 'maxWidth'] as const;
const CARD_PROPERTIES = ['color', 'backgroundColor', 'padding', 'gap', 'borderRadius', 'boxShadow', 'flexDirection', 'justifyContent', 'alignItems'] as const;

export const VISUAL_PAGES: readonly VisualPageDefinition[] = [
  { id: 'home', label: SYSTEM_TEXTS.visualEditor.pages.home, path: ROUTE_PATHS.home },
  { id: 'recipes', label: SYSTEM_TEXTS.visualEditor.pages.recipes, path: ROUTE_PATHS.recipes },
  { id: 'ingredients', label: SYSTEM_TEXTS.visualEditor.pages.ingredients, path: ROUTE_PATHS.ingredients },
  { id: 'expenses', label: SYSTEM_TEXTS.visualEditor.pages.expenses, path: ROUTE_PATHS.expensesFixed },
  { id: 'pricing', label: SYSTEM_TEXTS.visualEditor.pages.pricing, path: ROUTE_PATHS.pricingProducts },
  { id: 'agenda', label: SYSTEM_TEXTS.visualEditor.pages.agenda, path: ROUTE_PATHS.agenda }
] as const;

const surface = (
  pageId: VisualPageId,
  uiKey: UiKey,
  label: string,
  properties: readonly EditableCssProperty[]
): VisualSurface => ({
  pageId,
  uiKey,
  label,
  properties,
  categories: [...new Set(properties.map((property) => {
    if (property === 'color' || property === 'backgroundColor') return 'color';
    if (property.startsWith('font') || property === 'letterSpacing') return 'typography';
    if (property === 'padding' || property === 'gap') return 'spacing';
    if (property === 'borderRadius') return 'shape';
    if (property === 'boxShadow') return 'effect';
    return 'layout';
  }))]
});

const labels = SYSTEM_TEXTS.visualEditor.surfaces;

export const VISUAL_SURFACES: readonly VisualSurface[] = [
  surface('home', UI_KEYS.home.page, labels.homePage, SHELL_PROPERTIES),
  surface('home', UI_KEYS.home.search, labels.homeSearch, HEADER_PROPERTIES),
  surface('recipes', UI_KEYS.recipes.page, labels.recipesPage, SHELL_PROPERTIES),
  surface('recipes', UI_KEYS.recipes.headerTitle, labels.recipesTitle, HEADER_PROPERTIES),
  surface('recipes', UI_KEYS.recipes.list, labels.recipesList, COLLECTION_PROPERTIES),
  surface('recipes', UI_KEYS.recipes.card, labels.recipesCard, CARD_PROPERTIES),
  surface('ingredients', UI_KEYS.ingredients.page, labels.ingredientsPage, SHELL_PROPERTIES),
  surface('ingredients', UI_KEYS.ingredients.header, labels.ingredientsHeader, HEADER_PROPERTIES),
  surface('ingredients', UI_KEYS.ingredients.table, labels.ingredientsTable, COLLECTION_PROPERTIES),
  surface('expenses', UI_KEYS.expenses.page, labels.expensesPage, SHELL_PROPERTIES),
  surface('expenses', UI_KEYS.expenses.header, labels.expensesHeader, HEADER_PROPERTIES),
  surface('expenses', UI_KEYS.expenses.table, labels.expensesTable, COLLECTION_PROPERTIES),
  surface('pricing', UI_KEYS.pricing.page, labels.pricingPage, SHELL_PROPERTIES),
  surface('pricing', UI_KEYS.pricing.header, labels.pricingHeader, HEADER_PROPERTIES),
  surface('pricing', UI_KEYS.pricing.panel, labels.pricingPanel, CARD_PROPERTIES),
  surface('agenda', UI_KEYS.agenda.page, labels.agendaPage, SHELL_PROPERTIES),
  surface('agenda', UI_KEYS.agenda.header, labels.agendaHeader, HEADER_PROPERTIES),
  surface('agenda', UI_KEYS.agenda.list, labels.agendaList, COLLECTION_PROPERTIES),
  surface('agenda', UI_KEYS.agenda.card, labels.agendaCard, CARD_PROPERTIES)
] as const;

export function getVisualPage(pageId: VisualPageId): VisualPageDefinition {
  const page = VISUAL_PAGES.find((item) => item.id === pageId);
  if (!page) throw new Error('Visual editor page registry is incomplete.');
  return page;
}

export function getPageSurfaces(pageId: VisualPageId): readonly VisualSurface[] {
  return VISUAL_SURFACES.filter((item) => item.pageId === pageId);
}

export function getVisualSurface(uiKey: string): VisualSurface | undefined {
  return VISUAL_SURFACES.find((item) => item.uiKey === uiKey);
}

export function isVisualPageId(value: unknown): value is VisualPageId {
  return typeof value === 'string' && VISUAL_PAGES.some((page) => page.id === value);
}
