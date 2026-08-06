import { motion, AnimatePresence } from 'framer-motion';
import { X, ChefHat, Layers, DollarSign, Package } from 'lucide-react';
import { type Recipe } from '../../../types/recipe.ts';
import { formatCurrencyBRL } from '../../../utils/format.ts';

interface ViewRecipeModalProps {
    isOpen: boolean;
    recipe: Recipe | null;
    onClose: () => void;
}

export function ViewRecipeModal({ isOpen, recipe, onClose }: ViewRecipeModalProps) {
    if (!isOpen || !recipe) return null;

    // 🧮 Motor de Cálculo do Custo Total Somado da Receita (Lote)
    const totalRecipeCost = recipe.items.reduce((acc, item) => {
        const basePrice = item.ingredient.price || 0;
        const baseVolume = item.ingredient.quantity || 1;
        const quantityUsed = item.quantityNeeded || 0;

        // Fórmula: (Preço / Quantidade original) * Quantidade usada
        const itemCost = (basePrice / baseVolume) * quantityUsed;
        return acc + itemCost;
    }, 0);

    // Custo por porção individual (Custo Total / Qtd Porções Lote)
    const costPerServing = totalRecipeCost / (recipe.product.unitsPerBatch || 1);

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans text-xs sm:text-sm select-none">
                        <motion.div
                            key="view-recipe-modal-card"
                            initial={{ y: 25, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 25, opacity: 0 }}
                            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[85vh] overflow-y-auto space-y-5 relative"
                        >
                            {/* Botão Fechar */}
                            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full cursor-pointer z-10">
                                <X className="w-4 h-4" />
                            </button>

                            {/* 🔮 Cabeçalho da Receita com Thumbnail do Produto */}
                            <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="w-14 h-12 rounded-xl bg-slate-900 border border-slate-150 overflow-hidden flex items-center justify-center shadow-3xs shrink-0 text-white">
                                    {recipe.product.thumbnail ? (
                                        <img src={recipe.product.thumbnail} alt={recipe.product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <ChefHat className="w-5 h-5 text-slate-400" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase font-mono tracking-tight tabular-nums">{recipe.product.sku}</span>
                                    <h3 className="text-base font-black text-slate-800 truncate mt-1 leading-tight">{recipe.product.name}</h3>
                                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Ficha Técnica & Composição Fracionada</p>
                                </div>
                            </div>

                            {/* 📈 Painel Reativo de Custos Consolidados */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-3xs space-y-0.5">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1"><Layers className="w-3 h-3 text-indigo-500" /> Rendimento Lote</span>
                                    <span className="text-xs font-black text-slate-800 tabular-nums">{recipe.product.unitsPerBatch} porções</span>
                                </div>
                                <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-3xs space-y-0.5">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1"><DollarSign className="w-3 h-3 text-emerald-500" /> Custo Total Lote</span>
                                    <span className="text-xs font-black text-slate-800 tabular-nums">{formatCurrencyBRL(totalRecipeCost)}</span>
                                </div>
                                <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-3xs space-y-0.5">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1"><Package className="w-3 h-3 text-indigo-500" /> Custo por Porção</span>
                                    <span className="text-xs font-black text-indigo-600 tabular-nums">{formatCurrencyBRL(costPerServing)}</span>
                                </div>
                            </div>

                            {/* 📊 TABELA DE COMPOSIÇÃO NÃO-EDITÁVEL (CLEAN CODE) */}
                            <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-3xs overflow-hidden">
                                <div className="overflow-x-auto w-full">
                                    <div className="w-full min-w-[500px]">

                                        {/* Cabeçalho Grid */}
                                        <div className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider text-[10px] grid grid-cols-[1fr_100px_100px_110px] items-center py-2.5 w-full">
                                            <div className="px-4">Item (Insumo)</div>
                                            <div className="px-3 text-center">Quantidade</div>
                                            <div className="px-3 text-center">Medida</div>
                                            <div className="px-4 text-right">Custo Fracionado</div>
                                        </div>

                                        {/* Corpo do Grid de Matérias-Primas */}
                                        <div className="divide-y divide-slate-100 font-medium text-slate-700 block w-full bg-white">
                                            {recipe.items.map((item, idx) => {
                                                const basePrice = item.ingredient.price || 0;
                                                const baseVolume = item.ingredient.quantity || 1;
                                                const quantityUsed = item.quantityNeeded || 0;

                                                // ✨ CÁLCULO REQUISITADO: Preço dividido pelo que vem, vezes a quantidade usada
                                                const calculatedCost = (basePrice / baseVolume) * quantityUsed;

                                                return (
                                                    <div
                                                        key={item.id || `recipe-row-${idx}`}
                                                        className="grid grid-cols-[1fr_100px_100px_110px] items-center py-2.5 w-full text-xs hover:bg-slate-50/50"
                                                    >
                                                        <div className="px-4 font-black text-slate-800 truncate">{item.ingredient.name}</div>
                                                        <div className="px-3 text-center font-bold text-slate-600 tabular-nums">{item.quantityNeeded}</div>
                                                        {/* Células Bloqueadas / Não-editáveis puxando direto do cadastro base */}
                                                        <div className="px-3 text-center font-semibold text-slate-500 truncate">{item.ingredient.unit}</div>
                                                        <div className="px-4 text-right font-black text-slate-800 tabular-nums">{formatCurrencyBRL(calculatedCost)}</div>
                                                    </div>
                                                );
                                            })}

                                            {recipe.items.length === 0 && (
                                                <div className="text-center py-8 text-slate-400 font-bold text-xs uppercase tracking-wider block w-full">
                                                    Nenhum insumo associado a esta receita.
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* Botão de Fechar no Rodapé */}
                            <div className="flex border-t border-slate-100 pt-4">
                                <button type="button" onClick={onClose} className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors cursor-pointer text-center">
                                    Fechar Ficha Técnica
                                </button>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}