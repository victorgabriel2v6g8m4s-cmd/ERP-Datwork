import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ArrowUpDown, Layers, FlaskConical } from 'lucide-react';
import { OrderProfilesManager } from './OrderProfilesManager.tsx';

export interface UniversalFilters {
    search: string;
    sortBy: string;
    abcCategory: 'all' | 'A' | 'B' | 'C';
    unitFilter: 'all' | 'Unidades' | 'Gramas' | 'Quilos' | 'MLs' | 'Centímetros' | 'Metros';
}

interface UniversalSearchBarProps {
    type: 'products' | 'recipes' | 'ingredients' | 'agenda';
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

    const updateFilter = (field: string, value: any) => {
        onFilterChange({ ...filters, [field]: value });
    };

    return (
        <div className="w-full space-y-2 font-sans text-xs sm:text-sm">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={filters.search || ''}
                        onChange={(event) => updateFilter('search', event.target.value)}
                        placeholder={placeholder}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium shadow-3xs transition-colors"
                    />
                </div>

                {children && (
                    <div className="flex gap-2 w-full md:w-auto items-center flex-wrap shrink-0">
                        {children}
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => setIsExpanded((current) => !current)}
                    className={`px-3.5 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all cursor-pointer shadow-3xs ${
                        isExpanded
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 ring-2 ring-indigo-500/5'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
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
                        <div className="flex flex-col sm:flex-row gap-4 items-end w-full">
                            <div className="space-y-1.5 flex-1 min-w-[240px] w-full">
                                <label className="font-bold text-slate-500 uppercase text-[10px] tracking-wider flex items-center gap-1">
                                    <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" /> Critério de Ordenação
                                </label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(event) => updateFilter('sortBy', event.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 h-[38px] cursor-pointer focus:outline-none focus:border-indigo-500 text-xs"
                                >
                                    <option value="custom">Ordem customizada (Sua ordenação tátil)</option>
                                    <option value="az">Nome em ordem alfabética (A-Z)</option>
                                    <option value="date">Data de cadastro (Mais recentes)</option>

                                    {isRecipes ? (
                                        <>
                                            <option value="batch-cost-desc">Custo do Lote (Maior para Menor)</option>
                                            <option value="unit-cost-desc">Custo Unitário (Maior para Menor)</option>
                                            <option value="units-batch-desc">Unidades por Lote (Maior para Menor)</option>
                                        </>
                                    ) : (
                                        <option value="value">
                                            {isProducts ? 'Custo total unitário (Maior)' : 'Preço de custo (Maior)'}
                                        </option>
                                    )}

                                    {isProducts && <option value="rating">Avaliações e Notas (Melhores)</option>}
                                    {!isRecipes && orderProfiles?.map((profile) => (
                                        <option key={profile.id} value={`profile-${profile.id}`}>
                                            Perfil: {profile.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {!isRecipes && (
                                <div className="space-y-1.5 flex-1 min-w-[240px] w-full">
                                    <div className="flex items-center justify-between">
                                        <label className="font-bold text-slate-500 uppercase text-[10px] tracking-wider flex items-center gap-1">
                                            {isProducts
                                                ? <Layers className="w-3.5 h-3.5 text-indigo-500" />
                                                : <FlaskConical className="w-3.5 h-3.5 text-orange-500" />}
                                            <span>{isProducts ? 'Classificação Curva ABC' : 'Filtrar por Unidade de Medida'}</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onFilterChange({
                                                    ...filters,
                                                    search: '',
                                                    sortBy: 'custom',
                                                    abcCategory: 'all',
                                                    unitFilter: 'all',
                                                    statusFilter: 'all',
                                                    dateFilter: 'all'
                                                });
                                            }}
                                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer flex items-center justify-center font-bold text-xs shadow-3xs border border-slate-200/40 h-[34px] sm:h-[36px] px-3 gap-1"
                                            title="Limpar todos os filtros ativos"
                                        >
                                            <span>Limpar Filtros</span>
                                        </button>
                                    </div>

                                    {isProducts ? (
                                        <div className="grid grid-cols-4 gap-1.5 h-[38px]">
                                            {(['all', 'A', 'B', 'C'] as const).map((category) => (
                                                <button
                                                    key={category}
                                                    type="button"
                                                    onClick={() => updateFilter('abcCategory', category)}
                                                    className={`rounded-xl font-bold border text-xs transition-all cursor-pointer ${
                                                        filters.abcCategory === category
                                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                                                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    {category === 'all' ? 'Todos' : `Curva ${category}`}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <select
                                            value={filters.unitFilter}
                                            onChange={(event) => updateFilter('unitFilter', event.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 h-[38px] cursor-pointer focus:outline-none focus:border-indigo-500"
                                        >
                                            <option value="all">Todas as Unidades de Medida</option>
                                            <option value="Unidades">Unidades (un.)</option>
                                            <option value="Gramas">Gramas (g)</option>
                                            <option value="Quilos">Quilos (kg)</option>
                                            <option value="MLs">MLs (ml)</option>
                                            <option value="Centímetros">Centímetros (cm)</option>
                                            <option value="Metros">Metros (m)</option>
                                        </select>
                                    )}
                                </div>
                            )}
                        </div>

                        {type !== 'recipes' && (
                            <div className="flex gap-2 items-center flex-wrap w-full md:w-auto shrink-0 justify-end">
                                <OrderProfilesManager
                                    profiles={orderProfiles || []}
                                    onSaveNewProfile={onSaveNewProfile || (async () => { })}
                                    onRenameProfile={onRenameProfile || (async () => { })}
                                    onDeleteProfile={onDeleteProfile || (async () => { })}
                                    contextLabel={type === 'products' ? 'Produtos' : type === 'ingredients' ? 'Insumos' : 'Agenda'}
                                    onSelectProfile={(positionsJson) => {
                                        if (onSelectProfilePositions) {
                                            onSelectProfilePositions(positionsJson ? JSON.parse(positionsJson) : []);
                                            updateFilter('sortBy', 'custom');
                                        }
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
