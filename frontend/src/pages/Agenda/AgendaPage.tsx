import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { GlobalFooterNav, GlobalTopTabs, UniversalHeaderDashboard } from '../../components/index.ts';
import { TEXTS } from '../../i18n/index.ts';
import { ERP_THEME } from '../../theme/presets.ts';
import { UI_KEYS } from '../../ui/keys.ts';
import { AgendaCalendarView } from './components/agendaCalendar/AgendaCalendarView.tsx';
import { AgendaFilterBar } from './components/AgendaFilterBar.tsx';
import { AppointmentList } from './components/agendaKanban/AppointmentList.tsx';
import { AgendaModalsGroup } from './components/AgendaModalsGroup.tsx';
import { AppointmentModal } from './components/appointmentWizard/AppointmentModal.tsx';
import { useAgendaActions } from './hooks/useAgendaActions.ts';
import { useAgendaFilters } from './hooks/useAgendaFilters.ts';
import { useAgendaMetrics } from './hooks/useAgendaMetrics.ts';
import type { AgendaViewMode } from './types/agenda.types.ts';

export function AgendaPage() {
  const [viewMode, setViewMode] = useState<AgendaViewMode>('LIST');
  const agenda = useAgendaActions();
  const filters = useAgendaFilters(agenda.appointments);
  const metrics = useAgendaMetrics(agenda.appointments);

  return (
    <div data-ui-key={UI_KEYS.agenda.page} className={ERP_THEME.agenda.page.shell}>
      <div data-ui-key={UI_KEYS.agenda.header}>
        <UniversalHeaderDashboard
          title={TEXTS.agenda.page.title}
          subtitle={TEXTS.agenda.page.subtitle}
          subBadge={(
            <div data-ui-key={UI_KEYS.agenda.liveClock} className={ERP_THEME.agenda.page.subBadge}>
              <span>{metrics.formattedDate}</span><span className="text-indigo-300">•</span><span>{metrics.formattedTime}</span>
            </div>
          )}
          icon={Calendar}
          iconColorClass="text-rose-600"
          backPath="/home"
          kpiCards={[
            { label: TEXTS.agenda.page.totalKpi, value: `${metrics.totalAppointments} ${TEXTS.agenda.page.serviceSuffix}`, valueColorClass: 'text-slate-800' },
            { label: TEXTS.agenda.page.pendingKpi, value: `${metrics.pendingAppointments} ${TEXTS.agenda.page.unitSuffix}`, valueColorClass: 'text-amber-600' },
            { label: TEXTS.agenda.page.completedKpi, value: `${metrics.completedAppointments} ${TEXTS.agenda.page.unitSuffix}`, valueColorClass: 'text-emerald-600' },
            { label: TEXTS.agenda.page.canceledKpi, value: `${metrics.canceledAppointments} ${TEXTS.agenda.page.unitSuffix}`, valueColorClass: 'text-rose-600' }
          ]}
        />
      </div>

      <GlobalTopTabs />

      <main className={ERP_THEME.agenda.page.main}>
        {viewMode === 'CALENDAR' ? (
          <AgendaCalendarView
            appointments={agenda.appointments}
            onBack={() => setViewMode('LIST')}
            onSelectRange={(start, end) => {
              filters.setCalendarRange({
                start: new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime(),
                end: new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999).getTime()
              });
              filters.setActiveFilters({ ...filters.activeFilters, dateFilter: 'custom' });
              setViewMode('LIST');
            }}
          />
        ) : (
          <div className="space-y-4 block w-full">
            <AgendaFilterBar
              activeFilters={filters.activeFilters}
              setActiveFilters={filters.setActiveFilters}
              onToggleViewMode={() => setViewMode('CALENDAR')}
            />

            {agenda.loading ? (
              <div className={ERP_THEME.agenda.page.loading}>
                <div className={ERP_THEME.agenda.page.spinner} aria-label={TEXTS.agenda.page.loading} />
              </div>
            ) : (
              <div data-ui-key={UI_KEYS.agenda.list} className="w-full block animate-fadeIn">
                <AppointmentList
                  appointments={filters.filteredAppointments}
                  onDragEnd={agenda.handleDragEnd}
                  onSwipeRight={(id) => void agenda.actions.cycleStatus(id)}
                  onSwipeLeft={(appointment) => void agenda.actions.triggerSoftDelete(appointment)}
                  onLongPress={agenda.actions.openEditModal}
                  onClick={agenda.actions.openViewModal}
                  onUpdateSubStatus={agenda.actions.updateSubStatus}
                />
              </div>
            )}
          </div>
        )}
      </main>

      <AppointmentModal onSave={agenda.handleCreateAppointment} />
      <AgendaModalsGroup
        confirmModalOpen={agenda.confirmModalOpen}
        editModalOpen={agenda.editModalOpen}
        viewModalOpen={agenda.viewModalOpen}
        cascadeModalOpen={agenda.cascadeModalOpen}
        selectedAppointment={agenda.selectedAppointment}
        cascadeTargetItem={agenda.cascadeTargetItem}
        cascadeTargetIndex={agenda.cascadeTargetIndex}
        appointments={agenda.appointments}
        setConfirmModalOpen={agenda.setConfirmModalOpen}
        setEditModalOpen={agenda.setEditModalOpen}
        setViewModalOpen={agenda.setViewModalOpen}
        setCascadeModalOpen={agenda.setCascadeModalOpen}
        setSelectedAppointment={agenda.setSelectedAppointment}
        setCascadeTargetItem={agenda.setCascadeTargetItem}
        handleUpdateAppointment={agenda.handleUpdateAppointment}
        handleExecuteCascadeReschedule={agenda.handleExecuteCascadeReschedule}
        executeConfirmDelete={agenda.actions.executeConfirmDelete}
      />
      <GlobalFooterNav />
    </div>
  );
}
