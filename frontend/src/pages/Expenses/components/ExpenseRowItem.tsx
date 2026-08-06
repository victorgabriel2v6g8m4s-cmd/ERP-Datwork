import { motion, useMotionValue, useTransform } from 'framer-motion';
import { DollarSign, Percent, Trash2 } from 'lucide-react';
import { type Expense } from '../../../types/expense.ts';

interface ExpenseRowItemProps {
    expense: Expense;
    categoryTotal: number;
    onUpdateCell: (id: string, field: keyof Expense, value: any) => void;
    onSwipeLeft: (id: string) => void;
}

export function ExpenseRowItem({ expense, categoryTotal, onUpdateCell, onSwipeLeft }: ExpenseRowItemProps) {

    const representationPercent = expense.valueType === 'PERCENT'
        ? expense.value
        : categoryTotal > 0 ? (expense.value / categoryTotal) * 100 : 0;

    // Coordenadas mecânicas de Swipe Esquerdo
    const dragX = useMotionValue(0);

    // Efeito de fundo vermelho surge gradualmente conforme arrasta para a esquerda
    const rowBg = useTransform(dragX, [-100, 0], ['#fef2f2', '#ffffff']);

    // ✨ CORREGIDO: Quando o card for arrastado em -20px a lixeira é 0 (invisível). Em -80px atinge 1 (totalmente visível).
    const trashOpacity = useTransform(dragX, [-80, -20], [1, 0]);

    return (
        <div className="relative block w-full overflow-hidden bg-white" style={{ backgroundColor: rowBg as any }}>

            {/* 🛡️ CAMADA INFERIOR OCULTA ISOLADA: A lixeira fica no centro vertical do fundo, sem encavalar os textos da frente */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none z-0">
                <motion.div style={{ opacity: trashOpacity }} className="text-red-600 flex items-center gap-1 font-bold text-xs">
                    <Trash2 className="w-4 h-4" />
                    <span>Apagar</span>
                </motion.div>
            </div>

            {/* 📱 CAMADA SUPERIOR FRONTAL: Grid reajustado em sintonia milimétrica com o cabeçalho pai */}
            <motion.div
                drag="x"
                dragConstraints={{ left: -100, right: 0 }} // 🚫 TRAVA DE SEGURANÇA: Bloqueado arrastar para a direita
                dragElastic={{ left: 0.4, right: 0 }}
                dragSnapToOrigin={true}
                style={{ x: dragX }}
                onDragEnd={(_, info) => {
                    if (info.offset.x < -60) onSwipeLeft(expense.id);
                    dragX.set(0);
                }}
                className="grid grid-cols-[1fr_120px_140px_120px] items-center py-2.5 bg-white text-xs font-medium text-slate-700 w-full border-b border-slate-100 z-10 relative"
            >
                {/* 1. Nome da Despesa */}
                <div className="px-3">
                    <input
                        type="text"
                        value={expense.name}
                        onChange={(e) => onUpdateCell(expense.id, 'name', e.target.value)}
                        placeholder="Clique para digitar o nome da despesa..."
                        className="w-full px-3 py-1.5 bg-slate-50/60 border border-slate-200/80 rounded-xl font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all text-xs"
                    />
                </div>

                {/* 2. Valor Bruto Numérico */}
                <div className="px-2">
                    <input
                        type="number"
                        min={0}
                        step="any"
                        value={expense.value || ''}
                        onChange={(e) => onUpdateCell(expense.id, 'value', Number(e.target.value))}
                        placeholder="0.00"
                        className="w-full px-3 py-1.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-center font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all tabular-nums text-xs"
                    />
                </div>

                {/* 3. Seletor de Tipo de Entrada */}
                <div className="px-3">
                    <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/60 w-full font-black text-[10px] h-8 items-center">
                        <button
                            type="button"
                            onClick={() => onUpdateCell(expense.id, 'valueType', 'LITERAL')}
                            className={`flex-1 h-full rounded-lg flex items-center justify-center gap-0.5 transition-all cursor-pointer ${expense.valueType === 'LITERAL' ? 'bg-white text-slate-800 shadow-3xs font-black' : 'text-slate-400 hover:text-slate-500'}`}
                        >
                            <DollarSign className="w-3 h-3 opacity-80" /><span>R$</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onUpdateCell(expense.id, 'valueType', 'PERCENT')}
                            className={`flex-1 h-full rounded-lg flex items-center justify-center gap-0.5 transition-all cursor-pointer ${expense.valueType === 'PERCENT' ? 'bg-white text-slate-800 shadow-3xs font-black' : 'text-slate-400 hover:text-slate-500'}`}
                        >
                            <Percent className="w-2.5 h-2.5 opacity-80" /><span>%</span>
                        </button>
                    </div>
                </div>

                {/* 4. Coluna Realinhada e Limpa de Porcentagem Representativa */}
                <div className="text-center font-black text-slate-900 tabular-nums text-xs pr-4">
                    {representationPercent.toFixed(2)}%
                </div>
            </motion.div>
        </div>
    );
}
