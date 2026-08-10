import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { PageErrorBoundary } from './components/PageErrorBoundary.tsx';
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

function PrivateRoute() {
  return <Outlet />;
}

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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/faq" element={<FAQPage />} />

          <Route element={<PrivateRoute />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/agenda/settings" element={<AgendaSettingsPage />} />
            <Route path="/dashboard" element={<div className="p-8 font-bold">Módulo Dashboard em construção...</div>} />
            <Route path="/dre" element={<div className="p-8 font-bold">Módulo DRE em construção...</div>} />
            <Route path="/estoque" element={<div className="p-8 font-bold">Módulo Estoque em construção...</div>} />
            <Route path="/insumos" element={<IngredientsPage />} />
            <Route path="/produtos" element={<ProductsPage />} />
            <Route path="/receitas" element={<RecipesPage />} />
            <Route path="/despesas/:subtab" element={<ExpensesPage />} />
            <Route path="/despesas" element={<Navigate to="/despesas/custos-fixos" replace />} />
            <Route path="/precificacao/:subtab" element={<PricingPage />} />
            <Route path="/precificacao" element={<Navigate to="/precificacao/produtos" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
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
