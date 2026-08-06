import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ArrowUpDown, Layers, RefreshCw } from 'lucide-react';
import { OrderProfilesManager } from '../../../components/OrderProfilesManager.tsx'; // ✨ Importa o novo gerenciador

export interface ProductFilters {
  search: string;
  sortBy: 'custom' | 'az' | 'date' | 'value' | 'rating' | string; // Permite IDs de ordens salvas
  abcCategory: 'all' | 'A' | 'B' | 'C';
}

interface ProductSearchBarProps {
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
  orderProfiles: any[];
  onSaveNewProfile: (name: string) => Promise<void>;
  onRenameProfile: (id: string, newName: string) => Promise<void>;
  onDeleteProfile: (id: string) => Promise<void>;
  onSelectProfilePositions: (positions: any[]) => void;
}

export function ProductSearchBar({
  filters,
  onFilterChange,
  orderProfiles,
  onSaveNewProfile,
  onRenameProfile,
  onDeleteProfile,
  onSelectProfilePositions
}: ProductSearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof ProductFilters, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  // ✨ FUNÇÃO REQUISITADA: Limpa todos os filtros e restabelece a Ordem Customizada e Curva ABC
  const handleClearAllFilters = () => {
    onFilterChange({
      search: '',
      sortBy: 'custom',
      abcCategory: 'all'
    });
  };

  return (
    <div className="w-full space-y-2 font-sans text-xs sm:text-sm">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Pesquisar por SKU, Nome ou Marca do produto..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium shadow-3xs transition-colors"
          />
        </div>
        
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`px-3.5 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all cursor-pointer shadow-3xs ${
            isExpanded ? 'bg-indigo-50 border-indigo-300 text-indigo-700 ring-2 ring-indigo-500/5' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filtros</span>
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full bg-white border border-slate-200/70 rounded-2xl p-4 overflow-hidden shadow-3xs space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Critério de Ordenação */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" /> Critério de Ordenação
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 h-[38px] cursor-pointer focus:outline-none focus:border-indigo-500"
                >
                  <option value="custom">Ordem customizada (Sua ordenação tátil)</option>
                  <option value="az">Nome em ordem alfabética (A-Z)</option>
                  <option value="date">Data de cadastro (Mais recentes)</option>
                  <option value="value">Valor total unitário (Maior custo)</option>
                  <option value="rating">Avaliações e Notas (Melhores avaliados)</option>
                  {/* ✨ Injeta as Ordens Dinâmicas Salvas no Dropdown */}
                  {orderProfiles.map(p => (
                    <option key={p.id} value={`profile-${p.id}`}>Perfil: {p.name}</option>
                  ))}
                </select>
              </div>

              {/* Filtro Curva ABC + Botão Limpar Filtros */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-500 uppercase text-[10px] tracking-wider flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" /> Classificação Curva ABC
                  </label>
                  
                  {/* ✨ NOVO: Botão reativo para limpar todos os filtros ativos */}
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="flex items-center gap-1 text-[10px] font-black uppercase text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Limpar Filtros</span>
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-[38px]">
                  {(['all', 'A', 'B', 'C'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => updateFilter('abcCategory', cat)}
                      className={`rounded-xl font-bold border text-xs transition-all cursor-pointer ${
                        filters.abcCategory === cat ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {cat === 'all' ? 'Todos' : `Curva ${cat}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ✨ Acoplamento do Painel de Perfis customizados com chamadas limpas */}
            <OrderProfilesManager
              profiles={orderProfiles}
              onSaveNewProfile={onSaveNewProfile}
              onRenameProfile={onRenameProfile}
              onDeleteProfile={onDeleteProfile}
              onSelectProfile={(positionsJson) => {
                onSelectProfilePositions(JSON.parse(positionsJson));
                updateFilter('sortBy', 'custom'); // Volta para o modo customizado ao aplicar um perfil
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
