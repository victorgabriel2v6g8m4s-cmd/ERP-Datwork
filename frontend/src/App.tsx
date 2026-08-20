import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ModuleUnavailableState, PageErrorBoundary } from './components/index.ts';
import { ROUTE_PATHS } from './config/routes.config.ts';
import { TEXTS } from './i18n/index.ts';
import { ERP_THEME } from './theme/presets.ts';
import { UI_KEYS } from './ui/keys.ts';

const LoginPage = lazy(() => import('./pages/Login/LoginPage.tsx').then((module) => ({ default: module.LoginPage })));
const HomePage = lazy(() => import('./pages/Home/HomePage.tsx').then((module) => ({ default: module.HomePage })));
const AgendaPage = lazy(() => import('./pages/Agenda/AgendaPage.tsx').then((module) => ({ default: module.AgendaPage })));
const AgendaSettingsPage = lazy(() => import('./pages/Agenda/AgendaSettingsPage.tsx').then((module) => ({ default: module.AgendaSettingsPage })));
const FAQPage = lazy(() => import('./pages/FAQ/FAQPage.tsx').then((module) => ({ default: module.FAQPage })));
const ProductsPage = lazy(() => import('./pages/Products/ProductsPage.tsx').then((module) => ({ default: module.ProductsPage })));
const IngredientsPage = lazy(() => import('./pages/Ingredients/IngredientsPage.tsx').then((module) => ({ default: module.IngredientsPage })));
const RecipesPage = lazy(() => import('./pages/Recipes/RecipesPage.tsx').then((module) => ({ default: module.RecipesPage })));
const ExpensesPage = lazy(() => import('./pages/Expenses/ExpensesPage.tsx').then((module) => ({ default: module.ExpensesPage })));
const PricingPage = lazy(() => import('./pages/Pricing/PricingPage.tsx').then((module) => ({ default: module.PricingPage })));

function RouteLoading() {
  return (
    <div className={ERP_THEME.app.routeLoading} data-ui-key={UI_KEYS.app.routeLoading}>
      {TEXTS.common.status.loading}
    </div>
  );
}

function PageRoutes() {
  const location = useLocation();

  return (
    <PageErrorBoundary key={location.key}>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path={ROUTE_PATHS.login} element={<LoginPage />} />
          <Route path={ROUTE_PATHS.faq} element={<FAQPage />} />
          <Route path={ROUTE_PATHS.home} element={<HomePage />} />
          <Route path={ROUTE_PATHS.agenda} element={<AgendaPage />} />
          <Route path={ROUTE_PATHS.agendaSettings} element={<AgendaSettingsPage />} />
          <Route path={ROUTE_PATHS.dashboard} element={<ModuleUnavailableState moduleId="dashboard" />} />
          <Route path={ROUTE_PATHS.dre} element={<ModuleUnavailableState moduleId="dre" />} />
          <Route path={ROUTE_PATHS.inventory} element={<ModuleUnavailableState moduleId="inventory" />} />
          <Route path={ROUTE_PATHS.ingredients} element={<IngredientsPage />} />
          <Route path={ROUTE_PATHS.products} element={<ProductsPage />} />
          <Route path={ROUTE_PATHS.recipes} element={<RecipesPage />} />
          <Route path={`${ROUTE_PATHS.expenses}/:subtab`} element={<ExpensesPage />} />
          <Route path={ROUTE_PATHS.expenses} element={<Navigate to={ROUTE_PATHS.expensesFixed} replace />} />
          <Route path={`${ROUTE_PATHS.pricing}/:subtab`} element={<PricingPage />} />
          <Route path={ROUTE_PATHS.pricing} element={<Navigate to={ROUTE_PATHS.pricingProducts} replace />} />
          <Route path="*" element={<Navigate to={ROUTE_PATHS.login} replace />} />
        </Routes>
      </Suspense>
    </PageErrorBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <PageRoutes />
    </BrowserRouter>
  );
}
