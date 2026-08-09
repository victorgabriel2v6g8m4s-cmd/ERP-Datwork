import { Edit2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Draggable } from '@hello-pangea/dnd';
import { formatCurrencyBRL } from '../utils/format.ts';
import { ERP_THEME } from '../theme/presets.ts';
import { useSwipeGesture } from '../hooks/useSwipeGesture.ts'; // ✨ Motor de Gestos Universal

interface UniversalRowItemProps {
    type: 'products' | 'ingredients';
    item: any;
    index: number;
    onSwipeLeft: (item: any) => void;
    onSwipeRight: (id: string) => void;
    onThumbClick: (item: any) => void;
}

export function UniversalRowItem({ type, item, index, onSwipeLeft, onSwipeRight, onThumbClick }: UniversalRowItemProps) {
    const isProducts = type === 'products';
    const isItemDisabled = item.status === 'INACTIVE' || item.status === 'CANCELED';

    // 🪐 ACOPLAMENTO DO MOTOR DE SWIPE UNIFICADO
    const gesture = useSwipeGesture({
        itemId: item.id,
        itemActiveStatus: item.status,
        onSwipeLeft,
        onSwipeRight,
        itemRef: item
    });

    // 🚀 CÁLCULO CONDICIONAL MEMOIZADO EM RUNTIME
    const productMetrics = isProducts ? {
        recipeCost: Number(item.recipeCostPerUnit || 0),
        unitsBatch: Number(item.unitsPerBatch || 1),
        totalUnitCost: Number(item.totalUnitCost || 0),
    } : null;

    return (
        <Draggable draggableId={item.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                    style={{ ...provided.draggableProps.style, background: gesture.bgSwipe as any }}
                    className="relative transition-shadow duration-150 select-none touch-pan-y w-full block rounded-xl overflow-hidden mb-1"
                >
                    {/* Camada Inferior Oculta para Feedback de Gesto */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-6 z-0 w-full font-sans">
                        <motion.div style={{ opacity: gesture.opacityRight }} className="flex items-center gap-1.5 text-white font-bold text-xs"><Edit2 className="w-3.5 h-3.5" /> Editar Dados</motion.div>
                        <motion.div style={{ opacity: gesture.opacityLeft }} className="flex items-center gap-1.5 text-white font-bold text-xs"><ShieldAlert className="w-3.5 h-3.5" /> {item.status === 'ACTIVE' ? 'Desativar' : 'Reativar'}</motion.div>
                    </div>

                    {/* Linha Arrastável Fluida */}
                    <div className="p-0 z-10 relative w-full">
                        <motion.div
                            drag="x" dragConstraints={{ left: -120, right: 120 }} dragElastic={{ left: 0.5, right: 0.5 }} dragSnapToOrigin={true}
                            style={{ x: gesture.x }} onDragEnd={gesture.handleDragEnd}
                            onPointerDown={() => gesture.setIsPressing(true)} onPointerUp={() => gesture.setIsPressing(false)}
                            className={
                                `grid items-center text-xs font-medium text-slate-700 divide-x divide-slate-100/60 py-2.5 w-full font-sans
                                ${isProducts ? 'grid-cols-[56px_75px_1fr_95px_65px_95px_95px_64px_64px]' : 'grid-cols-[56px_90px_1fr_100px_90px_110px_64px]'} 
                                ${snapshot.isDragging ? 'shadow-lg border-indigo-200 ring-2 ring-indigo-500/10 z-30' : ''} 
                                ${isItemDisabled ? ERP_THEME.card.rowDisabled : 'bg-white hover:bg-slate-50/50'} 
                                ${gesture.isPressing ? 'border-indigo-400/50' : ''}
                            `}
                        >
                            {/* 1. Thumbnail */}
                            <div className="flex items-center justify-center">
                                <div onClick={() => onThumbClick(item)} className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-100 overflow-hidden shadow-3xs flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform shrink-0 border-slate-800">
                                    {item.thumbnail ? <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover pointer-events-none" /> : <span className="text-[9px] font-black text-white pointer-events-none tracking-widest">{isProducts ? 'BOX' : 'MAT'}</span>}
                                </div>
                            </div>

                            {/* 2. SKU */}
                            <div className="px-3 font-mono font-bold tracking-tight text-slate-500 tabular-nums truncate">{item.sku}</div>

                            {/* 3. Nome / Descrição */}
                            <div className="px-3 min-w-0 text-left">
                                <div className="font-black text-slate-800 text-xs truncate">{item.name}</div>
                                {isProducts && <div className="text-[10px] text-slate-400 font-bold truncate">{item.brand} {item.variation ? `• ${item.variation}` : ''}</div>}
                            </div>

                            {/* 4. Colunas Seletivas */}
                            {isProducts && productMetrics ? (
                                <>
                                    <div className="px-3 text-right font-semibold text-slate-400 tabular-nums truncate">{formatCurrencyBRL(productMetrics.recipeCost * productMetrics.unitsBatch)}</div>
                                    <div className="px-3 text-center font-bold text-slate-500 tabular-nums truncate">{productMetrics.unitsBatch}</div>
                                    <div className="px-3 text-right font-bold text-slate-600 tabular-nums truncate">{formatCurrencyBRL(productMetrics.recipeCost)}</div>
                                    <div className="px-3 text-right font-black text-slate-900 tabular-nums truncate">{formatCurrencyBRL(productMetrics.totalUnitCost)}</div>
                                    <div className="px-4 text-center"><span className="px-1.5 py-0.5 rounded-md font-black text-[10px] bg-amber-50 text-amber-700 border border-amber-200">{item.abcCategory || 'C'}</span></div>
                                </>
                            ) : (
                                <>
                                    <div className="px-3 text-right font-black text-slate-800 tabular-nums truncate">{formatCurrencyBRL(item.price)}</div>
                                    <div className="px-3 text-center font-bold text-slate-600 tabular-nums truncate">{item.quantity}</div>
                                    <div className="px-3 text-center font-semibold text-slate-500 truncate">{item.unit}</div>
                                </>
                            )}

                            {/* 5. Status Icon */}
                            <div className="flex items-center justify-center">
                                {item.status === 'ACTIVE' ? <span title="Registro Ativo" className="inline-flex"><ShieldCheck className="w-4 h-4 text-emerald-600" /></span> : <span title="Registro Desativado" className="inline-flex"><ShieldAlert className="w-4 h-4 text-red-500" /></span>}
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </Draggable>
    );
}
