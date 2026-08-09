import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Draggable } from '@hello-pangea/dnd';
import { ShieldAlert } from 'lucide-react';
import { type Recipe } from '../../../types/recipe.ts';
import { formatCurrencyBRL } from '../../../utils/format.ts';

interface RecipeCardItemProps {
    recipe: Recipe;
    index: number;
    onSwipeLeft: (recipe: Recipe) => void;
    onSwipeRight: (id: string) => void;
    onCardClick: (recipe: Recipe) => void;
}

export function RecipeCardItem({ recipe, index, onSwipeLeft, onSwipeRight, onCardClick }: RecipeCardItemProps) {
    const isInactive = recipe.status === 'INACTIVE';

    const dragX = useMotionValue(0);
    const cardBg = useTransform(dragX, [-100, 0, 100], [isInactive ? '#10b981' : '#ef4444', isInactive ? '#fef2f2' : '#ffffff', '#6366f1']);
    const indicatorOpacity = useTransform(dragX, [-80, -20], [1, 0, 1]);

    return (
        <Draggable draggableId={recipe.id} index={index}>
            {(dragProvided, snapshot) => (
                <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    className={`w-full block rounded-2xl transition-shadow ${snapshot.isDragging ? 'shadow-md ring-2 ring-indigo-500/5 z-30 scale-[1.01]' : ''
                        }`}
                >
                    <motion.div
                        style={{ backgroundColor: cardBg }}
                        className={`w-full rounded-2xl border overflow-hidden relative shadow-3xs transition-colors duration-200 ${isInactive ? 'border-red-200 bg-red-50/30 opacity-45 shadow-none' : 'border-slate-200/80 bg-white hover:border-indigo-300'
                            }`}
                    >
                        {/* Camada Oculta Inferior de Swipe */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-end px-6 z-0 text-white font-bold text-xs w-full">
                            <motion.div style={{ opacity: indicatorOpacity }} className="flex items-center gap-1.5">
                                <ShieldAlert className="w-4 h-4" />
                                <span>{isInactive ? 'Reativar Receita' : 'Cancelar Receita'}</span>
                            </motion.div>
                        </div>

                        {/* Corpo Deslizante Superior do Card */}
                        <motion.div
                            drag="x"
                            dragConstraints={{ left: -120, right: 120 }}
                            dragElastic={{ left: 0.4, right: 0.4 }}
                            dragSnapToOrigin={true}
                            style={{ x: dragX }}
                            onDragEnd={(_, info) => {
                                if (info.offset.x < -80) {
                                    onSwipeLeft(recipe);
                                } else if (info.offset.x > 80) {
                                    onSwipeRight(recipe.id);
                                }
                                dragX.set(0);
                            }}
                            onClick={() => {
                                if (Math.abs(dragX.get()) < 5) {
                                    onCardClick(recipe);
                                }
                            }}
                            className={`p-4 z-10 relative flex items-center justify-between w-full h-full cursor-pointer select-none gap-3 ${isInactive ? 'bg-transparent' : 'bg-white hover:bg-slate-50/20'
                                }`}
                        >
                            {/* Thumbnail do Produto */}
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-100 overflow-hidden shadow-3xs flex items-center justify-center shrink-0">
                                {recipe.product.thumbnail ? (
                                    <img src={recipe.product.thumbnail} alt={recipe.product.name} className="w-full h-full object-cover pointer-events-none" />
                                ) : (
                                    <span className="text-[9px] font-black text-white pointer-events-none">BOX</span>
                                )}
                            </div>

                            {/* Informações textuais */}
                            <div className="space-y-1 min-w-0 flex-1 pointer-events-none">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] px-2 py-0.5 rounded-md font-mono tracking-tight font-black bg-indigo-50 text-indigo-700 border border-indigo-150 tabular-nums">{recipe.product.sku}</span>
                                    {isInactive && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">CANCELADO</span>
                                    )}
                                </div>
                                <h3 className={`text-xs font-black leading-tight truncate mt-1.5 ${isInactive ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{recipe.product.name}</h3>
                            </div>

                            {/* 📊 GRID LATERAL DE COLUNAS FINANCEIRAS PROPORCIONAIS */}
                            <div className="flex gap-4 text-[11px] font-bold text-slate-500 mt-2 bg-slate-50 p-2 rounded-xl w-fit border border-slate-100">

                                {/* 🧮 CUSTO DO LOTE ATUALIZADO: Multiplica o custo unitário pelo rendimento de porções salvo na receita */}
                                <div>
                                    <span className="text-slate-400 font-medium">Custo do Lote: </span>
                                    <span className="text-slate-800 tabular-nums">
                                        {formatCurrencyBRL(
                                            ((recipe.product?.recipeCostPerUnit || 0) * (recipe.unitsPerBatch || 1))
                                        )}
                                    </span>
                                </div>

                                <div className="w-px h-3 bg-slate-200 align-middle my-auto" />

                                {/* CUSTO POR PORÇÃO */}
                                <div>
                                    <span className="text-slate-400 font-medium">Por Porção: </span>
                                    <span className="text-indigo-600 tabular-nums">
                                        {formatCurrencyBRL(recipe.product?.recipeCostPerUnit || 0)}
                                    </span>
                                </div>

                                <div className="w-px h-3 bg-slate-200 align-middle my-auto" />

                                {/* EXIBIÇÃO DE RENDIMENTO DE PORÇÕES */}
                                <div>
                                    <span className="text-slate-400 font-medium">Rendimento: </span>
                                    <span className="text-slate-700 font-black tabular-nums">
                                        {recipe.unitsPerBatch || 1} un.
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            )}
        </Draggable>
    );
}
