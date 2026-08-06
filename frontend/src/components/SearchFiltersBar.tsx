import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, Clock, DollarSign, Filter, ChevronDown, ArrowRight, RotateCcw, X } from 'lucide-react';
import { type DatePeriod } from '../utils/dateFilters.ts';

interface SearchFiltersBarProps {
    onSearchChange: (text: string) => void;
    onPeriodChange: (period: DatePeriod) => void;
    onCustomRangeChange: (range: { start: string | null; end: string | null }) => void;
    onAdvancedFilterChange: (filters: AdvancedFilters) => void;
}

export interface AdvancedFilters {
    startTime: string;
    endTime: string;
    financeType: 'all' | 'above' | 'below' | 'exact';
    exactAmount: number;
}

export function SearchFiltersBar({ onSearchChange, onPeriodChange, onCustomRangeChange, onAdvancedFilterChange }: SearchFiltersBarProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPeriod, setCurrentPeriod] = useState<DatePeriod>('all');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    const [advFilters, setAdvFilters] = useState<AdvancedFilters>({
        startTime: '', endTime: '', financeType: 'all', exactAmount: 0
    });

    const handleCustomDateChange = (type: 'start' | 'end', value: string) => {
        if (type === 'start') {
            setCustomStart(value);
            onCustomRangeChange({ start: value, end: customEnd || null });
        } else {
            setCustomEnd(value);
            onCustomRangeChange({ start: customStart || null, end: value });
        }
    };

    // ✨ Função para limpar a data personalizada isoladamente
    const handleClearCustomDate = () => {
        setCustomStart('');
        setCustomEnd('');
        onCustomRangeChange({ start: null, end: null });
        setCurrentPeriod('all');
        onPeriodChange('all');
    };

    // ✨ Função para resetar todos os sub-filtros avançados de uma vez
    const handleClearAllFilters = () => {
        const reseted: AdvancedFilters = { startTime: '', endTime: '', financeType: 'all', exactAmount: 0 };
        setAdvFilters(reseted);
        onAdvancedFilterChange(reseted);
        setSearchTerm('');
        onSearchChange('');
        handleClearCustomDate();
        setShowAdvanced(false);
    };

    const handlePeriodSelect = (period: DatePeriod) => {
        setCurrentPeriod(period);
        onPeriodChange(period);
        setShowPeriodDropdown(false); // Fecha o menu de opções após o clique
    };

    const handleAdvChange = (field: keyof AdvancedFilters, value: any) => {
        const updated = { ...advFilters, [field]: value };
        setAdvFilters(updated);
        onAdvancedFilterChange(updated); // Envia os novos filtros aplicados para o componente pai
    };

    const periodLabels: Record<DatePeriod, string> = {
        custom: '📅 Personalizado', all: 'Qualquer Data', today: 'Hoje', yesterday: 'Ontem', tomorrow: 'Amanhã',
        this_week: 'Esta Semana', last_week: 'Semana Passada', next_week: 'Próxima Semana',
        this_month: 'Este Mês', last_month: 'Mês Passado', next_month: 'Próximo Mês'
    };

    return (
        <div className="w-full px-6 mx-auto mb-6 space-y-3">
            {/* 🔍 Barra Principal: Campo de Pesquisa + Dropdown de Período + Botão Filtros */}
            <div className="flex flex-col sm:flex-row gap-2 w-full">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); onSearchChange(e.target.value); }}
                        placeholder="Pesquisar por cliente ou observações..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 text-sm shadow-2xs"
                    />
                </div>

                {/* 📅 Dropdown de Períodos de Calendário */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                        className="w-full sm:w-48 flex items-center justify-between gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer h-[38px]"
                    >
                        <div className="flex items-center gap-2 truncate">
                            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="truncate">{periodLabels[currentPeriod]}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>

                    <AnimatePresence>
                        {showPeriodDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-100 rounded-xl shadow-lg z-40 py-1 divide-y divide-slate-50 max-h-64 overflow-y-auto"
                            >
                                {(['custom', 'all', 'today', 'yesterday', 'tomorrow', 'this_week', 'last_week', 'next_week', 'this_month', 'last_month', 'next_month'] as DatePeriod[]).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => handlePeriodSelect(p)}
                                        className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-indigo-50/50 transition-colors cursor-pointer ${currentPeriod === p ? 'text-indigo-600 bg-indigo-50/30 font-bold' : 'text-slate-600'}`}
                                    >
                                        {periodLabels[p]}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 🎛️ Botão Ativador do Sub-Painel */}
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2 border rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-2xs h-[38px] ${showAdvanced ? 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-2 ring-indigo-500/10' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filtros</span>
                </button>
            </div>

            {/* 📅 Painel do Intervalo Customizado Totalmente Centralizado e Absoluto */}
            <AnimatePresence>
                {currentPeriod === 'custom' && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="w-full bg-indigo-50/40 border border-indigo-100/50 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-center gap-3 overflow-hidden shadow-xs relative group"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-indigo-700 uppercase tracking-wider shrink-0">Intervalo:</span>
                            <input
                                type="date"
                                value={customStart}
                                onChange={(e) => handleCustomDateChange('start', e.target.value)}
                                className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none shadow-2xs h-[32px] cursor-pointer"
                            />
                        </div>

                        <ArrowRight className="w-4 h-4 text-indigo-400 hidden sm:block shrink-0" />

                        <input
                            type="date"
                            value={customEnd}
                            onChange={(e) => handleCustomDateChange('end', e.target.value)}
                            className="w-full sm:w-auto px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none shadow-2xs h-[32px] cursor-pointer"
                        />

                        {/* 🧹 Botão flutuante para apagar o range customizado rápido */}
                        <button
                            type="button"
                            onClick={handleClearCustomDate}
                            className="p-1 text-indigo-400 hover:text-indigo-700 bg-white border border-indigo-100 hover:border-indigo-200 rounded-full shadow-2xs transition-colors cursor-pointer sm:absolute sm:right-3"
                            title="Limpar período"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 🎛️ Sub-Painel Expansível Avançado (Horas + Financeiro de Tamanho Absoluto) */}
            <AnimatePresence>
                {showAdvanced && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', damping: 22, stiffness: 180 }}
                        className="w-full bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-4 overflow-hidden"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Intervalo de Horas */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Intervalo de Horas
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="time"
                                        value={advFilters.startTime}
                                        onChange={(e) => handleAdvChange('startTime', e.target.value)}
                                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
                                    />
                                    <input
                                        type="time"
                                        value={advFilters.endTime}
                                        onChange={(e) => handleAdvChange('endTime', e.target.value)}
                                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Financeiro com Animação Elástica de Largura */}
                            <motion.div layout className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                                    <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Movimentação Financeira
                                </label>
                                <div className="flex gap-2 w-full items-center">
                                    <motion.select
                                        layout
                                        value={advFilters.financeType}
                                        onChange={(e) => handleAdvChange('financeType', e.target.value)}
                                        className={`px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none h-[32px] cursor-pointer transition-all duration-300 ease-in-out
                      ${advFilters.financeType === 'all' ? 'w-full' : 'w-5/12'}
                    `}
                                    >
                                        <option value="all">Qualquer valor</option>
                                        <option value="above">Acima de ( &gt; )</option>
                                        <option value="below">Abaixo de ( &lt; )</option>
                                        <option value="exact">Exatamente ( = )</option>
                                    </motion.select>

                                    <AnimatePresence>
                                        {advFilters.financeType !== 'all' && (
                                            <motion.input
                                                initial={{ opacity: 0, x: 20, width: 0 }}
                                                animate={{ opacity: 1, x: 0, width: '7/12' }}
                                                exit={{ opacity: 0, x: 20, width: 0 }}
                                                transition={{ duration: 0.2 }}
                                                type="number"
                                                placeholder="R$ 0,00"
                                                value={advFilters.exactAmount || ''}
                                                onChange={(e) => handleAdvChange('exactAmount', parseFloat(e.target.value) || 0)}
                                                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none h-[32px]"
                                            />
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </div>

                        {/* 🔄 Rodapé do Painel: Limpeza Global de Filtros */}
                        <div className="flex justify-end border-t border-slate-50 pt-3">
                            <button
                                type="button"
                                onClick={handleClearAllFilters}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Limpar Todos os Filtros</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
