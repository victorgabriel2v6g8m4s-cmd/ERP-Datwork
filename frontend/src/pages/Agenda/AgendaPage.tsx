import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle2, CalendarIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// API Cliente e Contratos de Tipos Estáveis
import { api } from '../../api/client.ts';
import { type Appointment } from '../../types/appointment.ts';

// 📦 INTERFACE REUTILIZÁVEL E COMPONENTES UNIFICADOS (BARREL EMBUTIDO)
// Centralizado o carregamento de estruturas globais e utilitários
import {
    UniversalSearchBar,
    UniversalHeaderDashboard,
    GlobalTopTabs,
    GlobalFooterNav
} from '../../components/index.ts';
import { useGridGestures } from '../../hooks/useGridGestures.ts';

// Componentes Especializados do Módulo Operacional
import { AppointmentList } from './components/AppointmentList.tsx';
import { AppointmentModal } from './components/AppointmentModal.tsx';
import { EditAppointmentModal } from './components/EditAppointmentModal.tsx';
import { ViewAppointmentModal } from './components/ViewAppointmentModal.tsx';
import { AgendaCalendarView } from './components/AgendaCalendarView.tsx';
import { CascadeRescheduleModal } from './components/CascadeRescheduleModal.tsx';

// 🎨 DICIONÁRIO CORPORATIVO DE STATUS (RECICLÁVEL/AGNÓSTICO)
// Sugestão de Melhoria: Centraliza as cores em um único objeto reaproveitável em sub-telas
export const getStatusVisualStyle = (status: string) => {
    const styles: { [key: string]: { bg: string; text: string; border: string; indicator: string } } = {
        SCHEDULED: {
            bg: 'bg-indigo-50/40 hover:bg-indigo-50/80',
            text: 'text-indigo-700',
            border: 'border-indigo-100/50',
            indicator: 'bg-indigo-500'
        },
        PENDING: {
            bg: 'bg-amber-50/40 hover:bg-amber-50/80',
            text: 'text-amber-700',
            border: 'border-amber-100/50',
            indicator: 'bg-amber-500'
        },
        COMPLETED: {
            bg: 'bg-emerald-50/40 hover:bg-emerald-50/80',
            text: 'text-emerald-700',
            border: 'border-emerald-100/50',
            indicator: 'bg-emerald-500'
        },
        CANCELED: {
            bg: 'bg-rose-50/20 opacity-50 line-through text-slate-400',
            text: 'text-rose-600',
            border: 'border-rose-100',
            indicator: 'bg-rose-500'
        }
    };
    return styles[status] || { bg: 'bg-white', text: 'text-slate-700', border: 'border-slate-200', indicator: 'bg-slate-400' };
};

export function AgendaPage() {
    const navigate = useNavigate();

    // ⏱️ Relógio de Auditoria Operacional
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('LIST');
    const [calendarRange, setCalendarRange] = useState<{ start: number | null; end: number | null }>({ start: null, end: null });

    // 📡 Estados de Dados Físicos do Banco SQLite
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const [cascadeModalOpen, setCascadeModalOpen] = useState(false);
    const [cascadeTargetIndex, setCascadeDroppedIndex] = useState<number>(0);
    const [cascadeTargetItem, setCascadeTargetItem] = useState<Appointment | null>(null);


    // 🎛️ MOTOR DE FILTRAGEM UNIVERSAL DO ERP (ÚNICO E LIMPO)
    // Expurgados estados redundantes para garantir o padrão DRY (Don't Repeat Yourself)
    const [activeFilters, setActiveFilters] = useState({
        search: '',
        sortBy: 'custom',
        statusFilter: 'all',
        dateFilter: 'all'
    });

    // 📡 Busca os dados iniciais do banco SQLite
    const fetchAppointments = async () => {
        try {
            const response = await api.get<Appointment[]>('/appointments');
            const sorted = response.data.sort((a, b) => a.position - b.position);
            setAppointments(sorted);
        } catch (error) {
            console.error('🔥 Erro ao carregar agendamentos do backend:', error);
        } finally {
            setLoading(false);
        }
    };

    // Controladores de Fluxo Tátil por Gestos (Modais e Swipe)
    const {
        activeItem: selectedAppointment,
        setActiveItem: setSelectedAppointment,
        confirmModalOpen,
        setConfirmModalOpen,
        editModalOpen,
        setEditModalOpen,
        viewModalOpen,
        setViewModalOpen,
        actions
    } = useGridGestures<Appointment>({
        endpoint: '/appointments',
        currentList: appointments,
        setListState: setAppointments,
        onRefresh: fetchAppointments
    });

    // ✨ Preferências e Customizações Locais da Engrenagem da Agenda
    const [showSettings, setShowSettings] = useState(false);
    const [timeFormat, setTimeFormat] = useState<'24h' | '12h'>('24h');
    const [showCanceledItems, setShowCanceledItems] = useState(true);

    const [orderProfiles, setOrderProfiles] = useState<any[]>([]);

    // 🧮 CÁLCULO DE PARÂMETROS FINANCEIROS REATIVOS PARA OS COMPONENTES UNIVERSAIS
    const totalAppointments = appointments?.length || 0;
    const pendingAppointments = appointments?.filter((a: any) => a.status === 'PENDING' || a.status === 'SCHEDULED').length || 0;
    const completedAppointments = appointments?.filter((a: any) => a.status === 'COMPLETED' || a.status === 'DONE').length || 0;
    const canceledAppointments = appointments?.filter((a: any) => a.status === 'CANCELED').length || 0;

    // ⏱️ Sincronização Dinâmica e Batimento de Ciclo de Vida
    useEffect(() => {
        fetchAppointments();

        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // 🧠 ESTEIRA REATIVA DE FILTRAGEM CALIBRADA (USEMEMO ANTI-Resets)
    const filteredAppointments = useMemo(() => {
        if (!appointments) return [];
        return appointments.filter((item: any) => {
            // Se a engrenagem local ocultar cancelados, barra o item imediatamente
            if (!showCanceledItems && item.status === 'CANCELED') return false;

            // A. Filtragem de Busca Direta Textual
            if (activeFilters.search) {
                const searchLower = activeFilters.search.toLowerCase();

                // Varre de forma segura todas as propriedades textuais possíveis do agendamento
                const matchesClient = (item.clientName || '').toLowerCase().includes(searchLower);
                const matchesService = (item.serviceName || item.title || '').toLowerCase().includes(searchLower);
                const matchesNotes = (item.notes || '').toLowerCase().includes(searchLower);

                // Varre de forma defensiva o JSON financeiro caso o usuário busque por valor/preço
                const matchesFinance = (item.financials || '').toLowerCase().includes(searchLower);

                // ✨ CLÁUSULA DE ACENDIMENTO SEGURO: Se não bater com nenhuma das frentes, esconde o card
                if (!matchesClient && !matchesService && !matchesNotes && !matchesFinance) {
                    return false;
                }
            }

            // B. Filtragem pelo Estado do Atendimento
            if (activeFilters.statusFilter !== 'all' && item.status !== activeFilters.statusFilter) {
                return false;
            }

            // C. Filtragem Temporal de Calendário
            if (activeFilters.dateFilter !== 'all') {
                const rawDate = item.createdAt || item.time || (item as any).date;
                if (!rawDate || isNaN(Date.parse(rawDate))) return false;

                // Converte e extrai Ano, Mês e Dia puros ajustados ao fuso do computador do usuário
                const d = new Date(rawDate);
                const itemYear = d.getFullYear();
                const itemMonth = String(d.getMonth() + 1).padStart(2, '0');
                const itemDay = String(d.getDate()).padStart(2, '0');
                const itemDayStr = `${itemYear}-${itemMonth}-${itemDay}`; // YYYY-MM-DD Local

                const now = new Date();
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;


                // 🤖 FILTRO 1: HOJE
                if (activeFilters.dateFilter === 'today') {
                    if (itemDayStr !== todayStr) return false;
                }

                // 🤖 FILTRO 2: ESTA SEMANA
                if (activeFilters.dateFilter === 'week') {
                    const startOfWeek = new Date();
                    startOfWeek.setDate(startOfWeek.getDate() - 7);
                    startOfWeek.setHours(0, 0, 0, 0); // Limpa o fuso para o início do dia

                    const endOfWeek = new Date();
                    endOfWeek.setHours(23, 59, 59, 999); // Vai até o fim do dia de hoje

                    // Compara os timestamps baseados no fuso local do navegador
                    if (d.getTime() < startOfWeek.getTime() || d.getTime() > endOfWeek.getTime()) {
                        return false;
                    }
                }

                // 🤖 FILTRO: ESTE MÊS (Janela do mês comercial ativo local do usuário)
                if (activeFilters.dateFilter === 'month') {
                    const currentYear = now.getFullYear();
                    const currentMonth = now.getMonth(); // Mês de 0 a 11

                    // Verifica se o ano e o mês do agendamento batem exatamente com o mês atual da sua máquina
                    if (d.getFullYear() !== currentYear || d.getMonth() !== currentMonth) {
                        return false;
                    }
                }

                // 🤖 FILTRO 4: INTERVALO PERSONALIZADO (Cenário Corrigido e Sincronizado)
                if (activeFilters.dateFilter === 'custom' && calendarRange.start && calendarRange.end) {
                    const startD = new Date(calendarRange.start);
                    const endD = new Date(calendarRange.end);

                    const targetStartStr = `${startD.getFullYear()}-${String(startD.getMonth() + 1).padStart(2, '0')}-${String(startD.getDate()).padStart(2, '0')}`;
                    const targetEndStr = `${endD.getFullYear()}-${String(endD.getMonth() + 1).padStart(2, '0')}-${String(endD.getDate()).padStart(2, '0')}`;

                    // Validação linear textual 100% segura contra horas e minutos
                    const isInsideRange = itemDayStr >= targetStartStr && itemDayStr <= targetEndStr;
                    if (!isInsideRange) return false;
                }
            }

            return true;
        });
    }, [appointments, activeFilters, showCanceledItems]);

    // 💾 Nova função para salvar os dados editados chamando a API PUT do Node.js
    const handleUpdateAppointment = async (id: string, updatedData: any) => {
        console.log(`📡 [FRONTEND - CASCATA 4] Disparando Axios PUT para ID: ${id}. Dados enviados:`, updatedData);
        try {
            const response = await api.put<Appointment>(`/appointments/${id}`, updatedData);
            console.log('📡 [FRONTEND - CASCATA 5] Resposta HTTP do Axios recebida (response.data):', response.data);

            setAppointments((prev) =>
                {
                    const mapped = prev.map((item) => (item.id === id ? response.data : item))
                    console.log('📡 [FRONTEND - CASCATA 6] Nova esteira de Appointments calculada na memória do React:', mapped.find(i => i.id === id));
                    return mapped;
                }
            );
            setEditModalOpen(false); // ✨ Fecha o modal após o sucesso da operação
            setSelectedAppointment(null);

            fetchAppointments();
        } catch (error) {
            console.error('🔥 Erro ao atualizar agendamento no servidor:', error);
        }
    };

    const handleDragEnd = async (result: any) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.index === source.index) return;

        // Identifica qual item foi arrastado e solto pelo usuário
        const targetItem = appointments.find(a => a.id === draggableId) || null;

        setCascadeTargetItem(targetItem);
        setCascadeDroppedIndex(destination.index);
        setCascadeModalOpen(true); // ✨ Dispara a abertura do modal informando a nova vaga física
    };

    const handleExecuteCascadeReschedule = async (selectedIds: string[], offsetValue: number, unit: string, actionType: 'POSTERIOR' | 'ANTERIOR') => {
        try {
            setLoading(true);

            // AUTOMAÇÃO: Força o estado na memória do React a marcar a esteira alterada como REAGENDADO
            setAppointments(prev => prev.map(item =>
                selectedIds.includes(item.id) || item.id === cascadeTargetItem?.id
                    ? { ...item, subStatus: 'REAGENDADO' }
                    : item
            ));

            await api.patch('/appointments/cascade-reschedule', {
                appointmentIds: selectedIds,
                offsetValue,
                unit,
                newPosition: cascadeTargetIndex,
                targetId: cascadeTargetItem?.id,
                actionType
            });

            setCascadeModalOpen(false);
            setCascadeTargetItem(null);
            await fetchAppointments();
        } catch (error) {
            console.error('🔥 Erro no reagendamento cascata:', error);
        } finally {
            setLoading(false);
        }
    };

    // 🧮 CÁLCULO DE SALDO DINÂMICO COMPACTO (Aproveita 100% da velocidade useMemo)
    const totalFilteredBalance = useMemo(() => {
        let incomeAccumulator = 0;
        let expenseAccumulator = 0;

        filteredAppointments.forEach((item) => {
            if (item.status === 'CANCELED') return;

            try {
                const itemFinancials: any[] = item.financials ? JSON.parse(item.financials) : [];
                itemFinancials.forEach((f) => {
                    if (f.type === 'income') incomeAccumulator += Number(f.value || 0);
                    if (f.type === 'expense') expenseAccumulator += Number(f.value || 0);
                });
            } catch {
                console.warn(`⚠️ Erro ao processar string JSON financeira do item ID: ${item.id}`);
            }
        });

        return incomeAccumulator - expenseAccumulator;
    }, [filteredAppointments]);

    // 📆 Formatadores Cronológicos para o Relógio do Cabeçalho
    const formattedDate = currentDateTime.toLocaleDateString('pt-BR', {
        weekday: 'long', day: '2-digit', month: 'long'
    });

    const formattedTime = currentDateTime.toLocaleTimeString('pt-BR', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    // ➕ Salva um novo agendamento completo vindo do Assistente (Wizard)
    const handleCreateAppointment = async (payload: any) => {
        try {
            const response = await api.post<Appointment>('/appointments', payload);
            setAppointments((prev) => [...prev, response.data]);
        } catch (error) {
            console.error('🔥 Erro ao salvar novo agendamento no servidor:', error);
        }
    };

    return (
        <div className="w-full min-h-screen bg-slate-50/50 pb-24 font-sans select-none tracking-tight antialiased">

            {/* 🔮 Header Universal Hidratado com os KPIs Reativos da Fila */}
            <UniversalHeaderDashboard
                title="Agenda & Horários"
                subtitle="Grade Operacional e Fluxo de Atendimentos"
                subBadge={
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-2.5 py-0.5 rounded-md mt-1 w-fit font-mono tabular-nums">
                        <span>{formattedDate}</span>
                        <span className="text-indigo-300">•</span>
                        <span>{formattedTime}</span>
                    </div>
                }
                icon={Calendar}
                iconColorClass="text-rose-600"
                backPath="/home"
                kpiCards={[
                    { label: 'Total Agendados', value: `${totalAppointments} serv.`, valueColorClass: 'text-slate-800' },
                    { label: 'Pendentes', value: `${pendingAppointments} un.`, valueColorClass: 'text-amber-600' },
                    { label: 'Realizados', value: `${completedAppointments} un.`, valueColorClass: 'text-emerald-600' },
                    /* ✨ ADICIONADO: Novo mini-card injetado na esteira */
                    { label: 'Cancelados', value: `${canceledAppointments} un.`, valueColorClass: 'text-rose-600' }
                ]}
            />

            {/* Barramento Centralizador Superior do ERP */}
            <GlobalTopTabs />

            {/* ⚙️ Área Central Operacional Expandida em 100% da Largura Útil */}
            <main className="w-full px-6 md:px-8 mt-5 space-y-4">

                {viewMode === 'CALENDAR' ? (
                    /* ✨ SE ESTIVER NO MODO CALENDÁRIO: Renderiza o grid de rolagem vertical */
                    <AgendaCalendarView
                        appointments={appointments}
                        onBack={() => setViewMode('LIST')}
                        onSelectRange={(start, end) => {
                            // 📐 FIXAÇÃO DO CORREDOR SEGURO: Zera as horas do primeiro dia e crava 23:59:59 no último dia
                            const absoluteStart = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0).getTime();
                            const absoluteEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999).getTime();

                            setCalendarRange({
                                start: absoluteStart,
                                end: absoluteEnd
                            });

                            setActiveFilters({ ...activeFilters, dateFilter: 'custom' });
                            setViewMode('LIST');
                        }}
                    />
                ) : (
                    /* SE ESTIVER NO MODO PLANILHA/LISTA TRADICIONAL */
                    <div className="space-y-4 block w-full">
                        <UniversalSearchBar
                            type="agenda"
                            filters={activeFilters}
                            onFilterChange={(filters) => setActiveFilters(filters)}
                            placeholder="Pesquisar por agendamento, nome do cliente ou valor"
                        >
                            {/* ✨ BOTÃO DE GATILHO DO CALENDÁRIO: Adicionado no barramento de filhos */}
                            <button
                                type="button"
                                onClick={() => setViewMode('CALENDAR')}
                                className="px-3 py-1.5 bg-slate-900 text-white rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-3xs border border-slate-950 transition-transform active:scale-95 shrink-0 h-[32px] sm:h-[34px]"
                            >
                                <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Ver Calendário</span>
                            </button>

                            <select value={activeFilters.statusFilter} onChange={(e) => setActiveFilters({ ...activeFilters, statusFilter: e.target.value })} className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 text-xs focus:outline-none cursor-pointer h-[32px] sm:h-[34px]">
                                <option value="all">Qualquer Status</option>
                                <option value="PENDING">Agendados</option>
                                <option value="COMPLETED">Realizados</option>
                                <option value="CANCELED">Cancelados</option>
                            </select>

                            <select
                                value={activeFilters.dateFilter}
                                onChange={(e) => setActiveFilters({ ...activeFilters, dateFilter: e.target.value })}
                                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 text-xs focus:outline-none cursor-pointer h-[32px] sm:h-[34px]"
                            >
                                <option value="all">Todas as Datas</option>
                                <option value="today">Hoje</option>
                                <option value="week">Esta Semana</option>
                                <option value="month">Este Mês</option>
                                {/* ✨ ADICIONADO: Opção de indicação automática de intervalo personalizado */}
                                <option value="custom" disabled>Personalizado</option>
                            </select>
                        </UniversalSearchBar>

                        {loading ? (
                            <div className="flex justify-center items-center py-20 w-full">
                                <div className="w-7 h-7 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="w-full block animate-fadeIn">
                                <AppointmentList
                                    appointments={filteredAppointments}
                                    onDragEnd={handleDragEnd}
                                    onSwipeRight={(id) => actions.cycleStatus(id, ['PENDING', 'COMPLETED'], 'CANCELED')}
                                    onSwipeLeft={actions.triggerSoftDelete}
                                    onLongPress={actions.openEditModal}
                                    onClick={actions.openViewModal}
                                    onUpdateSubStatus={actions.updateSubStatus} 
                                />
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Botão Flutuante + Assistente de Agendamento Passo a Passo */}
            <AppointmentModal onSave={handleCreateAppointment} />

            {/* 🛡️ Popup de Confirmação de Cancelamento Preventivo */}
            <AnimatePresence>
                {confirmModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans text-xs sm:text-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl border border-slate-100 p-6 max-w-sm w-full text-center space-y-4 shadow-2xl"
                        >
                            <h3 className="text-base font-black text-slate-800">Deseja desmarcar este item?</h3>
                            <p className="text-xs text-slate-400 font-bold leading-normal">
                                O registro do agendamento será cancelado.
                            </p>
                            <div className="flex gap-2 font-bold text-xs pt-2">
                                <button
                                    type="button"
                                    /* ✨ REAJUSTADO: Usa os limpadores do hook genérico para fechar e limpar a memória */
                                    onClick={() => { setConfirmModalOpen(false); setSelectedAppointment(null); }}
                                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors cursor-pointer"
                                >
                                    Desistir
                                </button>
                                <button
                                    type="button"
                                    /* ✨ REAJUSTADO: Invoca o executor selado gravando o status de cancelamento direto no SQLite */
                                    onClick={() => actions.executeConfirmDelete('CANCELED')}
                                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors cursor-pointer"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Edição Avançada */}
            <EditAppointmentModal
                isOpen={editModalOpen}
                appointment={selectedAppointment}
                /* ✨ REAJUSTADO: Limpa o estado ativo em sincronia com o fechamento do painel */
                onClose={() => { setEditModalOpen(false); setSelectedAppointment(null); }}
                onSave={handleUpdateAppointment}
            />

            {/* Modal de Visualização Detalhada */}
            <ViewAppointmentModal
                isOpen={viewModalOpen}
                appointment={selectedAppointment}
                /* ✨ REAJUSTADO: Limpa o estado ativo em sincronia com o fechamento do painel */
                onClose={() => { setViewModalOpen(false); setSelectedAppointment(null); }}
            />

            <CascadeRescheduleModal
                isOpen={cascadeModalOpen}
                targetAppointment={cascadeTargetItem}
                droppedIndex={cascadeTargetIndex}
                fullList={appointments}
                onClose={() => { setCascadeModalOpen(false); setCascadeTargetItem(null); }}
                /* ✨ CORREÇÃO: O modal agora injeta a aba ativa (activeTab) como quarto parâmetro da execução */
                onExecuteCascade={(ids, val, unit, tab) => handleExecuteCascadeReschedule(ids, val, unit, tab as any)}
            />

            {/* 🧭 Dock Inferior Escuro Ocultável Automaticamente por Scroll Reverso */}
            <GlobalFooterNav />
        </div>
    );
}
