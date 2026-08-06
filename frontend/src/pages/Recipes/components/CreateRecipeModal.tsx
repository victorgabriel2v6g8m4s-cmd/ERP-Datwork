import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChefHat, Plus, Trash2, CheckCircle, Calculator, Layers, Archive } from 'lucide-react';
import { api } from '../../../api/client.ts';
import { type Product } from '../../../types/product.ts';
import { type Ingredient } from '../../../types/ingredient.ts';
import { formatCurrencyBRL } from '../../../utils/format.ts';

interface CreateRecipeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: any) => Promise<void>;
}

interface SelectedIngredientItem {
    ingredientId: string;
    quantityNeeded: number;
    name: string;
    unit: string;
    price: number;
    quantityMax: number;
}

export function CreateRecipeModal({ isOpen, onClose, onSave }: CreateRecipeModalProps) {
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
    const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);

    // Estados do Formulário
    const [selectedProductId, setSelectedProductId] = useState('');
    const [unitsPerBatch, setUnitsPerBatch] = useState<number>(1); // ✨ Novo Estado
    const [recipeItems, setRecipeItems] = useState<SelectedIngredientItem[]>([]);

    const [currentIngredientId, setCurrentIngredientId] = useState('');
    const [currentQuantity, setCurrentQuantity] = useState<number>(0);

    useEffect(() => {
        if (isOpen) { fetchFormOptions(); }
    }, [isOpen]);

    const fetchFormOptions = async () => {
        try {
            const [prodRes, ingRes] = await Promise.all([
                api.get<Product[]>('/products'),
                api.get<Ingredient[]>('/ingredients')
            ]);
            setAvailableProducts(prodRes.data.filter(p => p.status === 'ACTIVE'));
            setAvailableIngredients(ingRes.data.filter(i => i.status === 'ACTIVE'));
        } catch (error) { console.error(error); }
    };

    const handleAddIngredientRow = () => {
        if (!currentIngredientId || currentQuantity <= 0) return;
        const targetIng = availableIngredients.find(i => i.id === currentIngredientId);
        if (!targetIng) return;

        if (recipeItems.find(item => item.ingredientId === currentIngredientId)) {
            setRecipeItems(prev => prev.map(item => item.ingredientId === currentIngredientId
                ? { ...item, quantityNeeded: item.quantityNeeded + currentQuantity } : item
            ));
        } else {
            setRecipeItems(prev => [...prev, {
                ingredientId: targetIng.id, quantityNeeded: currentQuantity, name: targetIng.name,
                unit: targetIng.unit, price: targetIng.price, quantityMax: targetIng.quantity
            }]);
        }
        setCurrentIngredientId('');
        setCurrentQuantity(0);
    };

    const calculatedBatchPreviewCost = recipeItems.reduce((acc, item) => acc + ((item.price / item.quantityMax) * item.quantityNeeded), 0);
    // Custo unitário provisório reativo exibido no card inferior
    const calculatedUnitPreviewCost = calculatedBatchPreviewCost / (unitsPerBatch || 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId || recipeItems.length === 0) return;

        await onSave({
            productId: selectedProductId,
            unitsPerBatch, // ✨ Enviando o porcionamento do lote
            ingredients: recipeItems.map(item => ({
                ingredientId: item.ingredientId, quantityNeeded: item.quantityNeeded
            }))
        });
        handleReset();
    };

    const handleReset = () => {
        setSelectedProductId(''); setUnitsPerBatch(1); setRecipeItems([]); setCurrentIngredientId(''); setCurrentQuantity(0);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans text-xs sm:text-sm select-none">
            <motion.form
                onSubmit={handleSubmit}
                initial={{ y: 35, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 35, opacity: 0 }}
                className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4"
            >
                {/* 🔮 Cabeçalho do Painel */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <ChefHat className="w-5 h-5" />
                        <h3 className="text-base font-black text-slate-800">Nova Ficha Técnica</h3>
                    </div>
                    <button type="button" onClick={handleReset} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 1️⃣ PRODUTO ALVO E RENDIMENTO QUANTITATIVO DO LOTE SIMÉTRICO */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Produto Alvo</label>
                        <select
                            required
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-700 h-[38px] focus:outline-none cursor-pointer focus:border-indigo-500"
                        >
                            <option value="">Escolha um produto...</option>
                            {availableProducts.map(p => (
                                <option key={p.id} value={p.id}>[{p.sku}] {p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* ✨ NOVO INPUT: Define a quantidade de porções que o lote rende diretamente na criação */}
                    <div className="col-span-1">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-0.5">
                            <Archive className="w-3 h-3 text-indigo-500" /> Qtd por Lote
                        </label>
                        <input
                            type="number"
                            required
                            min={1}
                            value={unitsPerBatch}
                            onChange={(e) => setUnitsPerBatch(Math.max(1, Number(e.target.value)))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 h-[38px] text-center focus:outline-none focus:border-indigo-500 tabular-nums"
                        />
                    </div>
                </div>

                {/* 2️⃣ INSERIR COMPONENTE FRACIONADO DE MATÉRIAS-PRIMAS */}
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Calculator className="w-3.5 h-3.5 text-indigo-500" /> Inserir Componente Fracionado
                    </span>
                    <div className="grid grid-cols-[1fr_90px_48px] gap-2 items-end">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Matéria-Prima / Insumo</label>
                            <select
                                value={currentIngredientId}
                                onChange={(e) => setCurrentIngredientId(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 h-[36px] focus:outline-none cursor-pointer"
                            >
                                <option value="">Escolha...</option>
                                {availableIngredients.map(i => (
                                    <option key={i.id} value={i.id}>{i.name} ({i.unit.substring(0, 2).toLowerCase()})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Qtd. Usada</label>
                            <input
                                type="number"
                                min={0}
                                step="any"
                                value={currentQuantity || ''}
                                onChange={(e) => setCurrentQuantity(Number(e.target.value))}
                                placeholder="0.0"
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 h-[36px] focus:outline-none"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleAddIngredientRow}
                            disabled={!currentIngredientId || currentQuantity <= 0}
                            className="h-[36px] w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl flex items-center justify-center font-bold cursor-pointer transition-colors shadow-3xs"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* 3️⃣ LISTA PROVISÓRIA DE COMPOSIÇÃO DA FICHA TÉCNICA */}
                <div className="space-y-1.5">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Estrutura de Insumos da Receita</span>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-[140px] overflow-y-auto bg-white shadow-3xs">
                        {recipeItems.map(item => (
                            <div key={item.ingredientId} className="grid grid-cols-[1fr_80px_95px_40px] items-center py-2 px-3 text-xs font-semibold text-slate-700">
                                <div className="truncate font-black text-slate-800">{item.name}</div>
                                <div className="text-center font-bold text-slate-500 tabular-nums">{item.quantityNeeded} {item.unit.substring(0, 2).toLowerCase()}</div>
                                <div className="text-right font-bold text-slate-600 tabular-nums">{formatCurrencyBRL((item.price / item.quantityMax) * item.quantityNeeded)}</div>
                                <button
                                    type="button"
                                    onClick={() => setRecipeItems(prev => prev.filter(i => i.ingredientId !== item.ingredientId))}
                                    className="text-slate-400 hover:text-red-500 ml-auto p-1 rounded transition-colors cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                        {recipeItems.length === 0 && (
                            <div className="text-center py-8 text-slate-400 font-bold font-sans text-xs uppercase tracking-wider">
                                Adicione insumos acima para compor a receita.
                            </div>
                        )}
                    </div>
                </div>

                {/* 📊 CARD FINANCEIRO DUPLO DE OUTPUTS CALCULADOS REATIVOS */}
                <div className="bg-slate-900 text-white p-3 rounded-2xl grid grid-cols-2 gap-4 px-4 divide-x divide-slate-800 border border-slate-800">
                    <div>
                        <span className="block text-[9px] font-bold uppercase text-slate-400 flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-indigo-400" /> Custo Total Lote
                        </span>
                        <span className="text-xs font-black tabular-nums text-emerald-400">{formatCurrencyBRL(calculatedBatchPreviewCost)}</span>
                    </div>
                    <div className="pl-4">
                        <span className="block text-[9px] font-bold uppercase text-slate-400 flex items-center gap-1">
                            Custo por Porção
                        </span>
                        <span className="text-xs font-black tabular-nums text-indigo-400">{formatCurrencyBRL(calculatedUnitPreviewCost)}</span>
                    </div>
                </div>

                {/* Rodapé de Ações */}
                <div className="flex gap-3 border-t border-slate-100 pt-4 font-bold text-xs">
                    <button type="button" onClick={handleReset} className="flex-1 py-2.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors">Cancelar</button>
                    <button
                        type="submit"
                        disabled={!selectedProductId || recipeItems.length === 0}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1 shadow-md cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <CheckCircle className="w-3.5 h-3.5" /> <span>Salvar Engenharia</span>
                    </button>
                </div>
            </motion.form>
        </div>
    );
}