import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { LoginPage } from './pages/Login/LoginPage.tsx';
import { HomePage } from './pages/Home/HomePage.tsx';
import { AgendaPage } from './pages/Agenda/AgendaPage.tsx';
import { AgendaSettingsPage } from './pages/Agenda/AgendaSettingsPage.tsx';
import { FAQPage } from './pages/FAQ/FAQPage.tsx';
import { ProductsPage } from './pages/Products/ProductsPage.tsx';
import { IngredientsPage } from './pages/Ingredients/IngredientsPage.tsx';
import { RecipesPage } from './pages/Recipes/RecipesPage.tsx';
import { ExpensesPage } from './pages/Expenses/ExpensesPage.tsx';
import { PricingPage } from './pages/Pricing/PricingPage.tsx';

function PrivateRoute() {
  // const token = localStorage.getItem('token'); // Ou o nome da chave que seu ERP usa para salvar o token

  // // Se houver token, o Outlet libera a renderização das páginas filhas internas; senão, joga para o login
  // return token ? <Outlet /> : <Navigate to="/login" replace />;
  return <Outlet />;
}


export default function App() {
  // type AppRoute = 'login' | 'home' | 'agenda' | 'dashboard' | 'dre' | 'estoque' | 'precificacao' | 'produtos' | 'insumos' | 'receitas' | 'despesas' | 'servicos';

  return (
    <BrowserRouter>
      <Routes>
        {/* 🔐 Rota da tela de Login */}
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
          {/* Redirecionamento preventivo caso o usuário digite apenas /despesas na barra */}
          <Route path="/despesas" element={<Navigate to="/despesas/custos-fixos" replace />} />
          <Route path="/precificacao/:subtab" element={<PricingPage />} />
          {/* Redirecionamento de segurança para carregar a aba de Produtos por padrão */}
          <Route path="/precificacao" element={<Navigate to="/precificacao/produtos" replace />} />
        </Route>


        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
