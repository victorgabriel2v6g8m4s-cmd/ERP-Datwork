import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, FlaskConical, Layers, Search, SlidersHorizontal } from 'lucide-react';
import { APP_CONFIG } from '../config/app.config.ts';
import { TEXTS } from '../i18n/index.ts';
import { OrderProfilesManager } from './OrderProfilesManager.tsx';

export interface UniversalFilters {
  search: string;
  sortBy: string;
  abcCategory: 'all' | 'A' | 'B' | 'C';
  unitFilter: 'all' | 'Unidades' | 'Gramas' | 'Quilos' | 'MLs' | 'Centímetros' | 'Metros';
}

interface UniversalSearchBarProps {
  type: 'products' | 'recipes' | 'ingredients' | 'agenda' | 'expenses';
  filters: any;
  onFilterChange: (filters: any) => void;
  orderProfiles?: any[];
  onSaveNewProfile?: (name: string) => Promise<void>;
  onRenameProfile?: (id: string, newName: string) => Promise<void>;
  onDeleteProfile?: (id: string) => Promise<void>;
  onSelectProfilePositions?: (positions: any[]) => void;
  children?: ReactNode;
  placeholder?: string;
}

export function UniversalSearchBar({
  type,
  filters,
  onFilterChange,
  orderProfiles,
  onSaveNewProfile,
  onRenameProfile,
  onDeleteProfile,
  onSelectProfilePositions,
  children,
  placeholder = 'Digitar termo para busca reativa rápida...'
}: UniversalSearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isProducts = type === 'products';
  const isRecipes = type === 'recipes';
  const isIngredients = type === 'ingredients';
  const isExpenses = type === 'expenses';
  const isAgenda = type === 'agenda';
  const hasCatalogFilters = isProducts || isIngredients;

  const updateFilter = (field: string, value: any) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <div className="w-full space-y-2 font-sans text-xs sm:text-sm">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input type="text" value={filters.search || ''} onChange={(event) => updateFilter('search', event.target.value)} placeholder={placeholder} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium shadow-3xs transition-colors" />
        </div>

        {children && <div className="flex gap-2 w-full md:w-auto items-center flex-wrap shrink-0">{children}</div>}

        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          aria-label={TEXTS.common.search.filters}
          aria-expanded={isExpanded}
          className={`min-h-11 min-w-11 px-3.5 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all cursor-pointer shadow-3xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isExpanded ? 'bg-indigo-50 border-indigo-300 text-indigo-700 ring-2 ring-indigo-500/5' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">{TEXTS.common.search.filters}</span>
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="w-full bg-white border border-slate-200/70 rounded-2xl p-4 overflow-hidden shadow-3xs space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-end w-full">
              <div className="space-y-1.5 flex-1 min-w-[240px] w-full">
                <label className="font-bold text-slate-500 uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" /> {TEXTS.common.search.sortCriterion}
                </label>
                <select value={filters.sortBy} onChange={(event) => updateFilter('sortBy', event.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 h-[38px] cursor-pointer focus:outline-none focus:border-indigo-500 text-xs">
                  <option value="custom">{TEXTS.common.search.customOrder}</option>
                  <option value="az">{TEXTS.common.search.alphabetical}</option>
                  <option value="date">{TEXTS.common.search.recentDate}</option>
                  {isAgenda && <option value="time">{TEXTS.agenda.filters.chronologicalSort}</option>}
                  {isRecipes && (
                    <>
                      <option value="batch-cost-desc">Custo do Lote (Maior para Menor)</option>
                      <option value="unit-cost-desc">Custo Unitário (Maior para Menor)</option>
                      <option value="units-batch-desc">Unidades por Lote (Maior para Menor)</option>
                    </>
                  )}
                  {!isRecipes && !isAgenda && (
                    <option value="value">{isProducts ? 'Custo total unitário (Maior)' : isExpenses ? 'Valor (Maior para Menor)' : TEXTS.ingredients.search.costSort}</option>
                  )}
                  {isProducts && <option value="rating">Avaliações e Notas (Melhores)</option>}
                  {hasCatalogFilters && orderProfiles?.map((profile) => (
                    <option key={profile.id} value={`profile-${profile.id}`}>{isIngredients ? TEXTS.ingredients.search.profilePrefix : 'Perfil:'} {profile.name}</option>
                  ))}
                </select>
              </div>

              {hasCatalogFilters && (
                <div className="space-y-1.5 flex-1 min-w-[240px] w-full">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-500 uppercase text-[10px] tracking-wider flex items-center gap-1">
                      {isProducts ? <Layers className="w-3.5 h-3.5 text-indigo-500" /> : <FlaskConical className="w-3.5 h-3.5 text-orange-500" />}
                      <span>{isProducts ? 'Classificação Curva ABC' : TEXTS.ingredients.search.unitFilterLabel}</span>
                    </label>
                    <button type="button" onClick={() => onFilterChange({ ...filters, search: '', sortBy: 'custom', abcCategory: 'all', unitFilter: 'all', statusFilter: 'all', dateFilter: 'all' })} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer flex items-center justify-center font-bold text-xs shadow-3xs border border-slate-200/40 h-[34px] sm:h-[36px] px-3 gap-1">
                      <span>{TEXTS.common.search.clearFilters}</span>
                    </button>
                  </div>

                  {isProducts ? (
                    <div className="grid grid-cols-4 gap-1.5 h-[38px]">
                      {(['all', 'A', 'B', 'C'] as const).map((category) => (
                        <button key={category} type="button" onClick={() => updateFilter('abcCategory', category)} className={`rounded-xl font-bold border text-xs transition-all cursor-pointer ${filters.abcCategory === category ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                          {category === 'all' ? 'Todos' : `Curva ${category}`}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <select value={filters.unitFilter} onChange={(event) => updateFilter('unitFilter', event.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 h-[38px] cursor-pointer focus:outline-none focus:border-indigo-500">
                      <option value="all">{TEXTS.ingredients.search.allUnits}</option>
                      {APP_CONFIG.ingredients.units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                    </select>
                  )}
                </div>
              )}
            </div>

            {hasCatalogFilters && (
              <div className="flex gap-2 items-center flex-wrap w-full md:w-auto shrink-0 justify-end">
                <OrderProfilesManager
                  profiles={orderProfiles || []}
                  onSaveNewProfile={onSaveNewProfile || (async () => {})}
                  onRenameProfile={onRenameProfile || (async () => {})}
                  onDeleteProfile={onDeleteProfile || (async () => {})}
                  contextLabel={isProducts ? 'Produtos' : 'Insumos'}
                  onSelectProfile={(positionsJson) => {
                    if (!onSelectProfilePositions) return;
                    try {
                      const positions: unknown = positionsJson ? JSON.parse(positionsJson) : [];
                      onSelectProfilePositions(Array.isArray(positions) ? positions : []);
                    } catch {
                      onSelectProfilePositions([]);
                    }
                    updateFilter('sortBy', 'custom');
                  }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
