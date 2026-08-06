import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Calculator, Plus, Trash2, Layers, CheckCircle } from 'lucide-react';
import { api } from '../../../api/client.ts';
import { type Recipe } from '../../../types/recipe.ts';
import { type Ingredient } from '../../../types/ingredient.ts';
import { formatCurrencyBRL } from '../../../utils/format.ts';

interface EditRecipeModalProps {
    isOpen: boolean;
    recipe: Recipe | null;
    onClose: () => void;
    onSave: (id: string, payload: any) => Promise<void>;
}

export function EditRecipeModal({ isOpen, recipe, onClose, onSave }: EditRecipeModalProps) {
    const [openSection, setOpenSection] = useState<'info' | 'ingredients' | null>('info');
    const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);

    // 🎛️ Estados Locais de Formulário
    const [unitsPerBatch, setUnitsPerBatch] = useState<number>(1);
    const [recipeItems, setRecipeItems] = useState<any[]>([]);
    const [currentIngredientId, setCurrentIngredientId] = useState('');
    const [currentQuantity, setCurrentQuantity] = useState<number>(0);
    const [isSaving, setIsSaving] = useState(false);

    // 📡 LOG DE ENTRADA: Monitora a abertura e a hidratação dos dados vindos do componente pai
    useEffect(() => {
        console.log('🔍 [EditRecipeModal] useEffect acionado. Estado do Modal:', { isOpen, hasRecipe: !!recipe });

        if (isOpen && recipe) {
            console.log('📦 [EditRecipeModal] Dados brutos da receita recebidos para edição:', recipe);
            console.log('📐 [EditRecipeModal] Propriedades do Produto vinculadas:', recipe.product);

            fetchIngredientsOptions();

            // Captura o rendimento salvo (Tenta ler de recipe ou de product dependendo de onde o front está segurando)
            const savedUnits = recipe.unitsPerBatch || (recipe.product as any)?.unitsPerBatch || 1;
            console.log(`📋 [EditRecipeModal] Inicializando unitsPerBatch com o valor: ${savedUnits} (Tipo: ${typeof savedUnits})`);

            setUnitsPerBatch(savedUnits);

            const mappedItems = recipe.items?.map(item => {
                console.log(`   🧪 Mapeando Insumo: ${item.ingredient?.name} | Qtd Usada: ${item.quantityNeeded}`);
                return {
                    ingredientId: item.ingredientId,
                    quantityNeeded: item.quantityNeeded,
                    name: item.ingredient?.name || 'Insumo Ocular',
                    unit: item.ingredient?.unit || 'un',
                    price: item.ingredient?.price || 0,
                    quantityMax: item.ingredient?.quantity || 1
                };
            }) || [];

            setRecipeItems(mappedItems);
        }
    }, [recipe, isOpen]);

    const fetchIngredientsOptions = async () => {
        try {
            const response = await api.get<Ingredient[]>('/ingredients');
            setAvailableIngredients(response.data.filter(i => i.status === 'ACTIVE'));
        } catch (error) {
            console.error('❌ [EditRecipeModal] Falha ao carregar opções de insumos:', error);
        }
    };

    // 🧮 MÁQUINA MATEMÁTICA INTERNA COM TELEMETRIA ANTI-NaN
    const calculatedBatchPreviewCost = recipeItems.reduce((acc, item, idx) => {
        const price = item.price || 0;
        const maxVol = item.quantityMax || 1;
        const needed = item.quantityNeeded || 0;
        const rowCost = (price / maxVol) * needed;

        if (isNaN(rowCost)) {
            console.warn(`🚨 [EditRecipeModal] NaN detectado no cálculo da linha ${idx}! Detalhes do item:`, item);
        }

        return acc + rowCost;
    }, 0);

    // 🛡️ DETECTOR DE NaN DE PORÇÃO: Registra o momento exato em que a divisão quebra
    const calculatedUnitPreviewCost = calculatedBatchPreviewCost / (unitsPerBatch || 1);

    console.log('🧮 [EditRecipeModal] Executando simulação de custos em tempo real:', {
        totalInsumos: recipeItems.length,
        custoLote: calculatedBatchPreviewCost,
        porcoesInformadas: unitsPerBatch,
        custoPorcaoFinal: calculatedUnitPreviewCost,
        isUnitsPerBatchNaN: isNaN(unitsPerBatch),
        isCustoLoteNaN: isNaN(calculatedBatchPreviewCost),
        isCustoPorcaoNaN: isNaN(calculatedUnitPreviewCost)
    });

    // 📝 MONITOR DE DIGITAÇÃO: Loga cada tecla pressionada no input de quantidade por lote
    const handleUnitsChange = (val: string) => {
        const numericValue = Number(val);
        console.log(`⌨️ [EditRecipeModal] Usuário digitou no campo Qtd por Lote. Valor bruto string: "${val}" | Convertido para Number: ${numericValue}`);

        if (isNaN(numericValue)) {
            console.error('🚨 [EditRecipeModal] Erro Crítico: A conversão da string digitada resultou em NaN!');
        }

        setUnitsPerBatch(numericValue);
    };

    const handleAddIngredientRow = () => {
        if (!currentIngredientId || currentQuantity <= 0) return;
        const targetIng = availableIngredients.find(i => i.id === currentIngredientId);
        if (!targetIng) return;

        setRecipeItems(prev => {
            const exists = prev.find(item => item.ingredientId === currentIngredientId);
            if (exists) {
                return prev.map(item => item.ingredientId === currentIngredientId
                    ? { ...item, quantityNeeded: item.quantityNeeded + currentQuantity } : item
                );
            }
            return [...prev, {
                ingredientId: targetIng.id, quantityNeeded: currentQuantity, name: targetIng.name,
                unit: targetIng.unit, price: targetIng.price, quantityMax: targetIng.quantity
            }];
        });
        setCurrentIngredientId('');
        setCurrentQuantity(0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('📡 [EditRecipeModal] Preparando envio de formulário para persistência...');
        console.log('📊 [EditRecipeModal] Payload gerado:', { id: recipe?.id, unitsPerBatch, ingredientsCount: recipeItems.length });

        if (!recipe || recipeItems.length === 0) return;
        setIsSaving(true);

        try {
            await onSave(recipe.id, {
                unitsPerBatch: Number(unitsPerBatch),
                ingredients: recipeItems.map(item => ({
                    ingredientId: item.ingredientId,
                    quantityNeeded: item.quantityNeeded
                }))
            });
            onClose();
        } catch (err) {
            console.error('❌ [EditRecipeModal] Falha ao executar o callback onSave:', err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !recipe) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans text-xs sm:text-sm select-none">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4 text-left"
            >

                {/* Cabeçalho do Painel */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <h3 className="text-base font-black text-slate-800">Editar Engenharia</h3>
                    </div>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 🗂️ GAVETA SANFONA 1: PRODUTO VINCULADO & RENDIMENTO DO LOTE DESTRAVADO */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
                    <button
                        type="button"
                        onClick={() => setOpenSection(openSection === 'info' ? null : 'info')}
                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-slate-50 font-bold text-xs uppercase text-slate-700 cursor-pointer"
                    >
                        <span>Vinculação & Rendimento do Lote</span>
                        <motion.div animate={{ rotate: openSection === 'info' ? 90 : 0 }} className="text-slate-400">
                            <ChevronRight className="w-4 h-4" />
                        </motion.div>
                    </button>
                    <AnimatePresence>
                        {openSection === 'info' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="p-4 bg-white border-t border-slate-100 overflow-hidden grid grid-cols-3 gap-3 items-center"
                            >
                                <div className="col-span-2 space-y-0.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Produto Vinculado</span>
                                    <div className="font-black text-slate-800 text-xs truncate">[{recipe.product?.sku}] {recipe.product?.name}</div>
                                </div>

                                {/* ✨ INPUT DESTRAVADO: Altera o porcionamento e força o recálculo elástico */}
                                <div className="col-span-1">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 text-center">Qtd por Lote</label>
                                    <input
                                        type="number"
                                        required
                                        min={1}
                                        value={unitsPerBatch}
                                        onChange={(e) => setUnitsPerBatch(Math.max(1, Number(e.target.value)))}
                                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800 h-[34px] text-center focus:outline-none focus:border-indigo-500 tabular-nums text-xs"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 🗂️ GAVETA SANFONA 2: INSERÇÃO DE NOVOS COMPONENTES FRACIONADOS */}
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Calculator className="w-3.5 h-3.5 text-indigo-500" /> Modificar Estrutura de Insumos
                    </span>
                    <div className="grid grid-cols-[1fr_90px_48px] gap-2 items-end">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Matéria-Prima</label>
                            <select
                                value={currentIngredientId}
                                onChange={(e) => setCurrentIngredientId(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 h-[36px] focus:outline-none cursor-pointer text-xs"
                            >
                                <option value="">Escolha...</option>
                                {availableIngredients.map(i => (
                                    <option key={i.id} value={i.id}>{i.name} ({i.unit.substring(0, 2).toLowerCase()})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Qtd. Adicional</label>
                            <input
                                type="number"
                                min={0}
                                step="any"
                                value={currentQuantity || ''}
                                onChange={(e) => setCurrentQuantity(Number(e.target.value))}
                                placeholder="0.0"
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 h-[36px] focus:outline-none text-xs"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleAddIngredientRow}
                            disabled={!currentIngredientId || currentQuantity <= 0}
                            className="h-[36px] w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center font-bold disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer transition-colors shadow-3xs"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* LISTAGEM DE INSUMOS ATIVOS DA RECEITA ATUAL */}
                <div className="space-y-1.5">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Estrutura de Insumos Salva</span>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-[140px] overflow-y-auto bg-white shadow-3xs">
                        {recipeItems.map(item => (
                            <div key={item.ingredientId} className="grid grid-cols-[1fr_80px_95px_40px] items-center py-2 px-3 text-xs font-semibold text-slate-700">
                                <div className="truncate font-black text-slate-800">{item.name}</div>
                                <div className="text-center font-bold text-slate-500 tabular-nums">{item.quantityNeeded} {item.unit?.substring(0, 2).toLowerCase()}</div>
                                <div className="text-right font-bold text-slate-600 tabular-nums">{formatCurrencyBRL(((item.price || 0) / (item.quantityMax || 1)) * item.quantityNeeded)}</div>
                                <button
                                    type="button"
                                    onClick={() => setRecipeItems(prev => prev.filter(i => i.ingredientId !== item.ingredientId))}
                                    className="text-slate-400 hover:text-red-500 ml-auto p-1 rounded transition-colors cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 📊 CARD DE OUTPUTS CALCULADOS REATIVOS COMPLETAMENTE IMUNE A NaN */}
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

                {/* Rodapé de Gatilhos */}
                <div className="flex gap-3 border-t border-slate-100 pt-4 font-bold text-xs">
                    <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors">Cancelar</button>
                    <button
                        type="submit"
                        disabled={recipeItems.length === 0 || isSaving}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1 shadow-md cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <CheckCircle className="w-3.5 h-3.5" /> <span>Salvar Alterações</span>
                    </button>
                </div>

            </form>
        </div>
    );
}