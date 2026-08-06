import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Wallet, History, CloudCheck, CloudLightning, Sliders, Landmark, Trash2 } from 'lucide-react';
import { api } from '../../api/client.ts';
import { type Expense } from '../../types/expense.ts';
import { ExpenseHistoryModal } from './components/ExpenseHistoryModal.tsx';
import { formatCurrencyBRL } from '../../utils/format.ts';
import { UniversalSearchBar, type UniversalFilters, UniversalGridTable, type GridColumn, UniversalHeaderDashboard, GlobalTopTabs, GlobalFooterNav, SubTabSelector } from '../../components/index.ts'

interface PricingHeaderData { fixedCostPerUnitFactor: number; totalVariablePercent: number; }
interface ExpensesApiResponse { expenses: Expense[]; fixedCostPerUnitFactor: number; totalVariablePercent: number; }

export function ExpensesPage() {
    const navigate = useNavigate();

    // ✨ SOLUÇÃO DO RESET: Captura o parâmetro dinâmico direto da URL (/despesas/custos-fixos ou /despesas/variaveis)
    const { subtab } = useParams<{ subtab: string }>();

    // Converte o parâmetro da URL no tipo estrito de categoria do banco SQLite
    const activeTab = subtab === 'variaveis' ? 'VARIABLE' : 'FIXED';

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingStatus, setSavingStatus] = useState<'saved' | 'saving' | 'idle'>('saved');
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const [metrics, setMetrics] = useState<PricingHeaderData>({ fixedCostPerUnitFactor: 0, totalVariablePercent: 0 });
    const [activeFilters, setActiveFilters] = useState<UniversalFilters>({ search: '', sortBy: 'custom', abcCategory: 'all', unitFilter: 'all' });

    const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSavedSnapshotRef = useRef<string>('');

    // 🗺️ Definição das Sub-Abas do Centro de Custo para o componente reciclado
    const EXPENSES_SUB_TABS = [
        { id: 'FIXED', label: 'Custos Fixos', path: '/despesas/custos-fixos', icon: Sliders },
        { id: 'VARIABLE', label: 'Despesas Variáveis', path: '/despesas/variaveis', icon: Landmark }
    ];

    useEffect(() => {
        fetchExpenses();
    }, []);

    // 🤖 MOTOR 1: Gerador de Linha em Branco Automática Segura
    useEffect(() => {
        if (loading) return;
        const currentTabExpenses = expenses.filter(e => e.category === activeTab && e.status === 'ACTIVE');
        const hasBlankRowAlready = currentTabExpenses.some(e => e.name.trim() === '' && e.value === 0);
        if (hasBlankRowAlready) return;

        const lastItem = currentTabExpenses[currentTabExpenses.length - 1];
        if (currentTabExpenses.length === 0 || (lastItem && (lastItem.name.trim() !== '' || lastItem.value > 0))) {
            const tempId = `temp-${Date.now()}`;
            setExpenses(prev => [...prev, {
                id: tempId, name: '', value: 0, valueType: 'LITERAL', category: activeTab,
                status: 'ACTIVE', position: expenses.length, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            }]);
        }
    }, [expenses, activeTab, loading]);

    // ☁️ MOTOR 2: AUTO-SAVE DEBOUNCE COM TRAVA CONTRA LOOPS
    useEffect(() => {
        if (loading || expenses.length === 0) return;

        const validLines = expenses
            .filter(e => e.name.trim() !== '')
            .map(e => ({
                id: e.id.startsWith('temp-') ? undefined : e.id,
                name: e.name.trim(), value: Number(e.value), valueType: e.valueType, category: e.category
            }));

        if (validLines.length === 0) return;

        const currentStructureSnapshot = JSON.stringify(validLines);
        if (currentStructureSnapshot === lastSavedSnapshotRef.current) {
            setSavingStatus('saved');
            return;
        }

        if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        setSavingStatus('saving');

        debounceTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await api.post<Expense[]>('/expenses/bulk', { expenses: validLines });
                const updatedValidLines = response.data.map(e => ({
                    id: e.id, name: e.name.trim(), value: Number(e.value), valueType: e.valueType, category: e.category
                }));
                lastSavedSnapshotRef.current = JSON.stringify(updatedValidLines);
                setSavingStatus('saved');

                setExpenses(prev => {
                    const blankLine = prev.find(e => e.id.startsWith('temp-') && e.name.trim() === '' && e.value === 0);
                    return blankLine ? [...response.data, blankLine] : response.data;
                });

                const updateRes = await api.get<ExpensesApiResponse>('/expenses');
                setMetrics({ fixedCostPerUnitFactor: updateRes.data.fixedCostPerUnitFactor || 0, totalVariablePercent: updateRes.data.totalVariablePercent || 0 });
            } catch { setSavingStatus('idle'); }
        }, 800);

        return () => { if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current); };
    }, [expenses, loading]);

    const fetchExpenses = async () => {
        try {
            const response = await api.get<ExpensesApiResponse>('/expenses');
            const dataList = response.data.expenses || [];
            setExpenses(dataList);
            setMetrics({ fixedCostPerUnitFactor: response.data.fixedCostPerUnitFactor || 0, totalVariablePercent: response.data.totalVariablePercent || 0 });

            const initialValid = dataList.map(e => ({ id: e.id, name: e.name.trim(), value: Number(e.value), valueType: e.valueType, category: e.category }));
            lastSavedSnapshotRef.current = JSON.stringify(initialValid);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const totalsByCategory = useMemo(() => {
        const fixedSum = expenses.filter(e => e.category === 'FIXED' && e.status === 'ACTIVE').reduce((acc, e) => acc + (e.valueType === 'LITERAL' ? e.value : 0), 0);
        const variableSum = expenses.filter(e => e.category === 'VARIABLE' && e.status === 'ACTIVE').reduce((acc, e) => acc + (e.valueType === 'LITERAL' ? e.value : 0), 0);
        return { FIXED: fixedSum, VARIABLE: variableSum };
    }, [expenses]);

    const filteredExpenses = useMemo(() => {
        let result = expenses.filter((e) => e.category === activeTab && e.status === 'ACTIVE');
        if (activeFilters.search) {
            result = result.filter((e) => e.name.toLowerCase().includes(activeFilters.search.toLowerCase()));
        }
        return result.sort((a, b) => a.position - b.position);
    }, [expenses, activeTab, activeFilters]);

    const handleUpdateCell = (id: string, field: keyof Expense, value: any) => {
        setExpenses(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const handleSwipeLeftDelete = async (id: string) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
        if (!id.startsWith('temp-')) {
            try {
                await api.patch(`/expenses/${id}/status`, { status: 'INACTIVE' });
                const updateRes = await api.get<ExpensesApiResponse>('/expenses');
                setMetrics({ fixedCostPerUnitFactor: updateRes.data.fixedCostPerUnitFactor || 0, totalVariablePercent: updateRes.data.totalVariablePercent || 0 });
            } catch { fetchExpenses(); }
        }
    };

    const expensesColumnsDefinition: GridColumn<Expense>[] = [
        {
            header: 'Nome da Despesa / Canal',
            gridRatio: '1fr', // Ocupa o maior espaço disponível proporcionalmente
            textAlign: 'left',
            render: (expense) => (
                <div className="px-1 text-left w-full block">
                    <input
                        type="text"
                        value={expense.name}
                        onChange={(e) => handleUpdateCell(expense.id, 'name', e.target.value)}
                        placeholder="Nome da despesa..."
                        className="w-full bg-transparent border border-transparent rounded-lg font-black text-slate-800 focus:outline-none focus:bg-slate-50 focus:border-slate-200 text-xs sm:text-sm"
                    />
                </div>
            )
        },
        {
            header: 'Valor Bruto',
            gridRatio: '120px', // Largura fixa simétrica ao cabeçalho original
            textAlign: 'center',
            render: (expense) => (
                <input
                    type="number" step="any" min={0}
                    value={expense.value || ''}
                    onChange={(e) => handleUpdateCell(expense.id, 'value', Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full max-w-[95px] mx-auto px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-black text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 tabular-nums text-xs"
                />
            )
        },
        {
            header: 'Tipo de Entrada',
            gridRatio: '140px', // Largura fixa simétrica ao cabeçalho original
            textAlign: 'center',
            render: (expense) => (
                <select
                    value={expense.valueType}
                    onChange={(e) => handleUpdateCell(expense.id, 'valueType', e.target.value)}
                    className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-600 text-[10px] focus:outline-none cursor-pointer"
                >
                    <option value="LITERAL">Literal (R$)</option>
                    <option value="PERCENT">Porcentagem (%)</option>
                </select>
            )
        },
        {
            header: 'Representação (%)',
            gridRatio: '120px', // Largura fixa simétrica ao cabeçalho original
            textAlign: 'center',
            render: (expense) => {
                const total = totalsByCategory[activeTab] || 1;
                const representation = expense.valueType === 'PERCENT'
                    ? expense.value
                    : (expense.value / total) * 100;

                return (
                    <span className="font-black text-slate-400 font-mono tracking-tight tabular-nums block text-center w-full">
                        {isNaN(representation) ? '0.00' : representation.toFixed(2)}%
                    </span>
                );
            }
        },
        {
            // ✨ BOTOES DE AÇÃO EM GESTO DE EXCLUSÃO PRESERVADOS DE FORMA EM DESTAQUE
            header: 'Ações',
            gridRatio: '60px',
            textAlign: 'center',
            render: (expense) => (
                <button
                    type="button"
                    onClick={() => handleSwipeLeftDelete(expense.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors block mx-auto"
                    title="Excluir Despesa"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            )
        }
    ];

    return (
        <div className="w-full min-h-screen bg-slate-50/50 pb-24 font-sans selection:bg-indigo-500/10 select-none">

            {/* 🔮 Header Corporativo Superior Fixado Contendo o Seletor e os Badges Reciclados */}
            <UniversalHeaderDashboard
                title="Despesas Operacionais"
                subtitle="Centro de Custo & Margens de Planejamento"
                icon={Wallet}
                backPath="/home"
                statusBadge={
                    savingStatus === 'saving' ? (
                        <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5 animate-pulse"><CloudLightning className="w-3 h-3" /> Gravando...</span>
                    ) : (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5"><CloudCheck className="w-3 h-3" /> Sincronizado</span>
                    )
                }
                subBadge={
                    <div className="text-[9px] font-black text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded w-fit border border-slate-200/60 font-mono">
                        Total Aba: {formatCurrencyBRL(totalsByCategory[activeTab])}
                    </div>
                }
                kpiCards={[
                    { label: 'Rateio Fixo Un.', value: formatCurrencyBRL(metrics.fixedCostPerUnitFactor), valueColorClass: 'text-slate-800' },
                    { label: 'Desp. Variáveis', value: `${metrics.totalVariablePercent.toFixed(2)}%`, valueColorClass: 'text-indigo-600' }
                ]}
                actionButtons={[
                    { label: 'Histórico', icon: History, onClick: () => setIsHistoryOpen(true), title: 'Abrir histórico de auditoria' }
                ]}
            />

            {/* 🎛️ Eixo 1: Barramento Principal Superior do ERP ( Dashboard | Fichas | Precificação | Despesas ) */}
            <GlobalTopTabs />

            {/* Área Central de Planilha e Controles Sub-Aninhados */}
            <main className="w-full px-6 mx-auto mt-5 space-y-4">

                {/* 🎛️ ✨ Eixo 2 (COPIADO DA IMAGEM): Sub-Abas Tri-Estáveis que apontam para rotas persistentes */}
                <SubTabSelector tabs={EXPENSES_SUB_TABS} activeTabId={activeTab} />

                {/* Barra de Busca Reativa local */}
                <UniversalSearchBar
                    type="recipes"
                    filters={activeFilters}
                    onFilterChange={(f) => setActiveFilters(f)}
                    orderProfiles={[]}
                    onSaveNewProfile={async () => { }}
                    onRenameProfile={async () => { }}
                    onDeleteProfile={async () => { }}
                    onSelectProfilePositions={() => { }}
                />

                {/* Planilha de Alta Performance */}
                <UniversalGridTable
                    columns={expensesColumnsDefinition}
                    data={filteredExpenses}
                    emptyMessage="Nenhuma despesa ativa vinculada a esta categoria."
                />
            </main>

            {/* Modal Suspenso Histórico */}
            <ExpenseHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} onRevertVersion={(restoredItems) => setExpenses(restoredItems)} />

            {/* Menu do Rodapé */}
            <GlobalFooterNav />
        </div>
    );
}
