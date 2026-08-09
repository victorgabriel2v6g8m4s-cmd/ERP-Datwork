import { APP_CONFIG } from '../config/app.config.ts';
import { TEXTS } from '../i18n/index.ts';
import { ERP_THEME } from '../theme/presets.ts';
import type { AppointmentSubStatus } from '../types/appointment.ts';

export type AgendaSubStatusGroup = keyof typeof APP_CONFIG.agenda.subStatusGroups;

export function getAgendaSubStatusPresentation(value: AppointmentSubStatus) {
  return {
    label: TEXTS.agenda.subStatus.options[value],
    colorClass: ERP_THEME.agenda.subStatus[value]
  };
}

export function getAgendaSubStatusesForGroup(group: AgendaSubStatusGroup): readonly AppointmentSubStatus[] {
  return APP_CONFIG.agenda.subStatusGroups[group] as readonly AppointmentSubStatus[];
}
