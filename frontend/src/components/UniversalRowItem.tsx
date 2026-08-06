import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Draggable } from '@hello-pangea/dnd';
import { Edit2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { formatCurrencyBRL } from '../utils/format.ts';

interface UniversalRowItemProps {
    type: 'products' | 'ingredients'; // ✨ Chave seletora polimórfica
    item: any;                         // Aceita Product ou Ingredient
    index: number;
    onSwipeLeft: (item: any) => void;
    onSwipeRight: (id: string) => void;
    onThumbClick: (item: any) => void;
}

export function UniversalRowItem({
    type,
    item,
    index,
    onSwipeLeft,
    onSwipeRight,
    onThumbClick
}: UniversalRowItemProps) {
    const [isPressing, setIsPressing] = useState(false);
    const isProducts = type === 'products';

    const recipeCost = (item as any).recipeCostPerUnit || 0;
    const unitsBatch = (item as any).unitsPerBatch || 1;
    const indirectCost = (item as any).indirectCost || 0;
    const totalUnitCost = (item as any).totalUnitCost || 0;

    // 📐 Motores mecânicos de coordenadas para o efeito de arrasto lateral (Swipe)
    const x = useMotionValue(0);

    // Gatilhos de cores e opacidades baseados na distância arrastada
    const bgSwipe = useTransform(x, [-120, 0, 120], [
        'linear-gradient(to right, #ef4444, #ef4444)', // Vermelho na esquerda (Desativar)
        'linear-gradient(to right, #ffffff, #ffffff)',
        'linear-gradient(to right, #6366f1, #6366f1)'  // Roxo na direita (Editar)
    ]);

    const opacityLeft = useTransform(x, [-100, -30], [1, 0]);
    const opacityRight = useTransform(x, [30, 100], [0, 1]);

    const handleDragEnd = (_: any, info: any) => {
        if (info.offset.x < -100) {
            onSwipeLeft(item);
        } else if (info.offset.x > 100) {
            onSwipeRight(item.id);
        }
    };

    return (
        <Draggable draggableId={item.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                        ...provided.draggableProps.style,
                        background: bgSwipe as any
                    }}
                    className="relative transition-shadow duration-150 select-none touch-pan-y w-full block rounded-xl overflow-hidden"
                >
                    {/* Camada Oculta Inferior para Gesto Lateral */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-6 z-0 w-full">
                        <motion.div style={{ opacity: opacityRight }} className="flex items-center gap-1.5 text-white font-bold text-xs">
                            <Edit2 className="w-3.5 h-3.5" /> Editar Dados
                        </motion.div>
                        <motion.div style={{ opacity: opacityLeft }} className="flex items-center gap-1.5 text-white font-bold text-xs">
                            <ShieldAlert className="w-3.5 h-3.5" /> {item.status === 'ACTIVE' ? 'Desativar' : 'Reativar'}
                        </motion.div>
                    </div>

                    {/* Corpo da Linha Arrastável do Framer Motion */}
                    <div className="p-0 z-10 relative w-full">
                        <motion.div
                            drag="x"
                            dragConstraints={{ left: -120, right: 120 }}
                            dragElastic={{ left: 0.5, right: 0.5 }}
                            dragSnapToOrigin={true}
                            style={{ x }}
                            onDragEnd={(e, info) => {
                                if (info.offset.x < -100) {
                                    onSwipeLeft(item);
                                } else if (info.offset.x > 100) {
                                    onSwipeRight(item.id);
                                }
                                x.set(0);
                            }}
                            onPointerDown={() => setIsPressing(true)}
                            onPointerUp={() => setIsPressing(false)}
                            className={`grid items-center text-xs font-medium text-slate-700 divide-x divide-slate-100/60 bg-white border-b border-slate-100 py-2.5 w-full ${isProducts
                                ? 'grid-cols-[56px_75px_1fr_95px_65px_95px_95px_64px_64px]'
                                : 'grid-cols-[56px_90px_1fr_100px_90px_110px_64px]'
                                } ${snapshot.isDragging ? 'shadow-lg border-indigo-200 ring-2 ring-indigo-500/10 z-30' : 'hover:bg-slate-50/50'} ${item.status === 'INACTIVE' ? 'opacity-40 bg-slate-100/30 line-through text-slate-400' : ''
                                } ${isPressing ? 'border-indigo-400/50' : ''}`}
                        >
                            {/* 1. Thumbnail Clicável */}
                            <div className="flex items-center justify-center">
                                <div
                                    onClick={() => onThumbClick(item)}
                                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-100 overflow-hidden shadow-3xs flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform shrink-0"
                                >
                                    {item.thumbnail ? (
                                        <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover pointer-events-none" />
                                    ) : (
                                        <span className="text-[9px] font-black text-white pointer-events-none">{isProducts ? 'BOX' : 'MAT'}</span>
                                    )}
                                </div>
                            </div>

                            {/* 2. SKU */}
                            <div className="px-3 font-mono font-bold tracking-tight text-slate-500 tabular-nums truncate">{item.sku}</div>

                            {/* 3. Nome / Subtítulo */}
                            <div className="px-3 min-w-0">
                                <div className="font-black text-slate-800 text-xs truncate">{item.name}</div>
                                {isProducts && (
                                    <div className="text-[10px] text-slate-400 font-bold truncate">
                                        {item.brand} {item.variation ? `• ${item.variation}` : ''}
                                    </div>
                                )}
                            </div>

                            {/* RENDERIZAÇÃO SELETIVA DE COLUNAS COM BASE NO CONTEXTO */}
                            {isProducts ? (
                                <>
                                    {/* Colunas Exclusivas de Produtos */}
                                    <div className="px-3 text-right font-semibold text-slate-400 tabular-nums truncate">{formatCurrencyBRL(recipeCost * unitsBatch)}</div>
                                    <div className="px-3 text-center font-bold text-slate-500 tabular-nums truncate">{unitsBatch}</div>

                                    {/* 🍳 ✨ COLUNA CORRIGIDA: Vincula o custo real da ficha técnica (recipeCost) no lugar de indirectCost */}
                                    <div className="px-3 text-right font-bold text-slate-600 tabular-nums truncate">{formatCurrencyBRL(recipeCost)}</div>

                                    <div className="px-3 text-right font-black text-slate-900 tabular-nums truncate">{formatCurrencyBRL(totalUnitCost)}</div>
                                    <div className="px-4 text-center">
                                        <span className="px-1.5 py-0.5 rounded-md font-black text-[10px] bg-amber-50 text-amber-700 border border-amber-200">{item.abcCategory || 'C'}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Colunas Exclusivas de Insumos */}
                                    <div className="px-3 text-right font-black text-slate-800 tabular-nums truncate">{formatCurrencyBRL(item.price)}</div>
                                    <div className="px-3 text-center font-bold text-slate-600 tabular-nums truncate">{item.quantity}</div>
                                    <div className="px-3 text-center font-semibold text-slate-500 truncate">{item.unit}</div>
                                </>
                            )}

                            {/* Coluna Final Universal: Status */}
                            <div className="flex items-center justify-center">
                                {item.status === 'ACTIVE' ? (
                                    <span title="Registro Ativo" className="inline-flex"><ShieldCheck className="w-4 h-4 text-emerald-600" /></span>
                                ) : (
                                    <span title="Registro Desativado" className="inline-flex"><ShieldAlert className="w-4 h-4 text-red-500" /></span>
                                )}
                            </div>

                        </motion.div>
                    </div>
                </div>
            )}
        </Draggable>
    );
}