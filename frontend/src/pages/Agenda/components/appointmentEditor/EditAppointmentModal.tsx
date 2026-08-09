import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Save, X } from 'lucide-react';
import { CustomerAccordion } from '../../../../components/CustomerAccordion.tsx';
import { FinancialManager } from '../../../../components/FinancialManager.tsx';
import { MediaLightbox } from '../../../../components/MediaLightbox.tsx';
import { MediaManager } from '../../../../components/MediaManager.tsx';
import { UniversalSubStatusSelect } from '../../../../components/index.ts';
import { TEXTS } from '../../../../i18n/index.ts';
import { ERP_THEME } from '../../../../theme/presets.ts';
import type { Appointment } from '../../../../types/appointment.ts';
import { UI_KEYS } from '../../../../ui/keys.ts';
import { useAppointmentEditor } from '../../hooks/useAppointmentEditor.ts';
import type { AppointmentMutationPayload } from '../../types/agenda.types.ts';
import { EditorGeneralStep } from './EditorGeneralStep.tsx';

interface EditAppointmentModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onSave: (id: string, updatedData: AppointmentMutationPayload) => Promise<void>;
}

export function EditAppointmentModal(props: EditAppointmentModalProps) {
  const editor = useAppointmentEditor(props);
  const setters: Record<string, (value: string) => void> = {
    firstName: editor.setFirstName, lastName: editor.setLastName, documentType: editor.setDocumentType,
    documentNumber: editor.setDocumentNumber, phone: editor.setPhone, email: editor.setEmail,
    cep: editor.setCep, state: editor.setState, city: editor.setCity, neighborhood: editor.setNeighborhood,
    street: editor.setStreet, houseNumber: editor.setHouseNumber, complement: editor.setComplement,
    referencePoint: editor.setReferencePoint
  };

  return (
    <>
      <AnimatePresence>
        {props.isOpen && props.appointment && (
          <div data-ui-key={UI_KEYS.agenda.editModal} className={`${ERP_THEME.modal.overlay} overflow-y-auto`}>
            <motion.form
              onSubmit={editor.handleSubmit}
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              className={ERP_THEME.agenda.editor.container}
            >
              <div className={ERP_THEME.agenda.editor.header}>
                <div className="flex items-center gap-2 text-indigo-600">
                  <FileText className="w-5 h-5" />
                  <h3 className="text-lg font-black text-slate-800">{TEXTS.agenda.edit.title}</h3>
                </div>
                <button type="button" onClick={props.onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer" aria-label={TEXTS.common.actions.close}><X className="w-5 h-5" /></button>
              </div>

              <EditorGeneralStep name={editor.name} setName={editor.setName} date={editor.date} setDate={editor.setDate} time={editor.time} setTime={editor.setTime} />
              <UniversalSubStatusSelect value={editor.subStatus} onChange={editor.setSubStatus} variant="form" />

              <CustomerAccordion
                data={{
                  firstName: editor.firstName, lastName: editor.lastName, documentType: editor.documentType, documentNumber: editor.documentNumber,
                  phone: editor.phone, email: editor.email, cep: editor.cep, state: editor.state, city: editor.city, neighborhood: editor.neighborhood,
                  street: editor.street, houseNumber: editor.houseNumber, complement: editor.complement, referencePoint: editor.referencePoint
                }}
                onChangeField={(field, value) => setters[field]?.(value)}
              />

              <div data-ui-key={UI_KEYS.agenda.formNotes}>
                <label className={ERP_THEME.agenda.editor.fieldLabel}>{TEXTS.agenda.edit.notesLabel}</label>
                <textarea value={editor.description} onChange={(event) => editor.setDescription(event.target.value)} rows={3} placeholder={TEXTS.agenda.edit.notesPlaceholder} className={ERP_THEME.agenda.editor.textarea} />
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">{TEXTS.agenda.edit.mediaHeading(editor.medias.length)}</h4>
                <MediaManager medias={editor.medias} onChangeMedias={editor.setMedias} onOpenLightbox={editor.setActiveMedia} />
              </div>

              <FinancialManager financials={editor.financials} onChangeFinancials={editor.setFinancials} />

              <div className="flex gap-3 border-t border-slate-100 pt-4 justify-end">
                <button type="button" onClick={props.onClose} className={ERP_THEME.modal.btnCancel}>{TEXTS.common.actions.cancel}</button>
                <button data-ui-key={UI_KEYS.agenda.editSubmit} type="submit" className={ERP_THEME.modal.btnConfirm}>
                  <Save className="w-4 h-4" /><span>{TEXTS.agenda.edit.save}</span>
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      <MediaLightbox
        isOpen={editor.activeMedia !== null}
        medias={editor.medias}
        activeMedia={editor.activeMedia}
        onClose={() => editor.setActiveMedia(null)}
        onSelectMedia={editor.setActiveMedia}
      />
    </>
  );
}
