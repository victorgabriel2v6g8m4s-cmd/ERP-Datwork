import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

// Componentes Universais da Aplicação (Barrel)
import { UniversalHeaderDashboard, GlobalTopTabs, GlobalFooterNav } from '../../components/index.ts';

// Componentes Especializados do Domínio da Agenda (Pastas Dedicadas)
import { AppointmentList } from './components/agendaKanban/AppointmentList.tsx';
import { AppointmentModal } from './components/appointmentWizard/AppointmentModal.tsx';
import { AgendaCalendarView } from './components/agendaCalendar/AgendaCalendarView.tsx';
import { AgendaModalsGroup } from './components/AgendaModalsGroup.tsx';
import { AgendaFilterBar } from './components/AgendaFilterBar.tsx'; // ✨ Novo sub-módulo atômico

// Ganchos de Negócio Reativos (Hooks)
import { useAgendaActions } from './hooks/useAgendaActions.ts';
import { useAgendaFilters } from './hooks/useAgendaFilters.ts';
import { useAgendaMetrics } from './hooks/useAgendaMetrics.ts';

export function AgendaPage() {
    const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('LIST');
    const [showCanceledItems] = useState(true);

    const actionsState = useAgendaActions();
    const { activeFilters, setActiveFilters, setCalendarRange, filteredAppointments } =
        useAgendaFilters(actionsState.appointments, showCanceledItems);
    const metrics = useAgendaMetrics(actionsState.appointments);

    useEffect(() => {
        actionsState.fetchAppointments();
    }, []);

    return (
        <div className="w-full min-h-screen bg-slate-50/50 pb-24 font-sans select-none tracking-tight antialiased">

            {/* 🔮 Dashboard Header Hidratado com KPIs Analíticos */}
            <UniversalHeaderDashboard
                title="Agenda & Horários"
                subtitle="Grade Operacional e Fluxo de Atendimentos"
                subBadge={
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-2.5 py-0.5 rounded-md mt-1 w-fit font-mono tabular-nums">
                        <span>{metrics.formattedDate}</span>
                        <span className="text-indigo-300">•</span>
                        <span>{metrics.formattedTime}</span>
                    </div>
                }
                icon={Calendar}
                iconColorClass="text-rose-600"
                backPath="/home"
                kpiCards={[
                    { label: 'Total Agendados', value: `${metrics.totalAppointments} serv.`, valueColorClass: 'text-slate-800' },
                    { label: 'Pendentes', value: `${metrics.pendingAppointments} un.`, valueColorClass: 'text-amber-600' },
                    { label: 'Realizados', value: `${metrics.completedAppointments} un.`, valueColorClass: 'text-emerald-600' },
                    { label: 'Cancelados', value: `${metrics.canceledAppointments} un.`, valueColorClass: 'text-rose-600' }
                ]}
            />

            <GlobalTopTabs />

            {/* ⚙️ Área Central Operacional */}
            <main className="w-full px-6 md:px-8 mt-5 space-y-4">
                {viewMode === 'CALENDAR' ? (
                    <AgendaCalendarView
                        appointments={actionsState.appointments}
                        onBack={() => setViewMode('LIST')}
                        onSelectRange={(start, end) => {
                            const absoluteStart = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0).getTime();
                            const absoluteEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999).getTime();
                            setCalendarRange({ start: absoluteStart, end: absoluteEnd });
                            setActiveFilters({ ...activeFilters, dateFilter: 'custom' });
                            setViewMode('LIST');
                        }}
                    />
                ) : (
                    <div className="space-y-4 block w-full">
                        {/* ✨ O sub-módulo de filtros enxugou drasticamente as declarações inline daqui! */}
                        <AgendaFilterBar activeFilters={activeFilters} setActiveFilters={setActiveFilters} onToggleViewMode={() => setViewMode('CALENDAR')} />

                        {actionsState.loading ? (
                            <div className="flex justify-center items-center py-20 w-full">
                                <div className="w-7 h-7 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="w-full block animate-fadeIn">
                                <AppointmentList
                                    appointments={filteredAppointments}
                                    onDragEnd={actionsState.handleDragEnd}
                                    onSwipeRight={(id) => actionsState.actions.cycleStatus(id, ['PENDING', 'COMPLETED'], 'CANCELED')}
                                    onSwipeLeft={actionsState.actions.triggerSoftDelete}
                                    onLongPress={actionsState.actions.openEditModal}
                                    onClick={actionsState.actions.openViewModal}
                                    onUpdateSubStatus={actionsState.actions.updateSubStatus}
                                />
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Assistente Avançado Passo a Passo de Criação */}
            <AppointmentModal onSave={actionsState.handleCreateAppointment} />

            {/* Casulo Unificado de Modais Avançados (Edição, Resumo e Cascata) */}
            <AgendaModalsGroup {...actionsState} appointments={actionsState.appointments} />

            <GlobalFooterNav />
        </div>
    );
}
