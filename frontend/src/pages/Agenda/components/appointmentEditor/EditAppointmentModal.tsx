import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Save } from 'lucide-react';
import { type Appointment } from '../../../../types/appointment.ts';
import { MediaLightbox } from '../../../../components/MediaLightbox.tsx'
import { CustomerAccordion } from '../../../../components/CustomerAccordion.tsx';
import { FinancialManager } from '../../../../components/FinancialManager.tsx';
import { MediaManager } from '../../../../components/MediaManager.tsx';
import { UniversalSubStatusSelect } from '../../../../components/index.ts';
import { ERP_THEME } from '../../../../theme/presets.ts';

// 🧠 Sub-Módulos Isolados Importados
import { useAppointmentEditor } from '../../hooks/useAppointmentEditor.ts';
import { EditorGeneralStep } from './EditorGeneralStep.tsx';

interface EditAppointmentModalProps {
    isOpen: boolean;
    appointment: Appointment | null;
    onClose: () => void;
    onSave: (id: string, updatedData: any) => Promise<void>;
}

export function EditAppointmentModal(props: EditAppointmentModalProps) {
    const { isOpen, appointment, onClose } = props;
    const editor = useAppointmentEditor(props);

    return (
        <>
            <AnimatePresence>
                {isOpen && appointment && (
                    <div className={ERP_THEME.modal.overlay + ' overflow-y-auto'}>
                        <motion.form
                            onSubmit={editor.handleSubmit}
                            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                            className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 p-6 my-8 max-h-[90vh] overflow-y-auto space-y-6"
                        >
                            {/* Header do Form */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2 text-indigo-600">
                                    <FileText className="w-5 h-5" />
                                    <h3 className="text-lg font-black text-slate-800">Editar Agendamento</h3>
                                </div>
                                <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* 🧩 BLOCO 1: INPUTS DO CABEÇALHO */}
                            <EditorGeneralStep name={editor.name} setName={editor.setName} date={editor.date} setDate={editor.setDate} time={editor.time} setTime={editor.setTime} />

                            <div>
                                <UniversalSubStatusSelect value={editor.subStatus || 'CONFIRMADO'} onChange={(nextSub) => editor.setSubStatus(nextSub)} variant="form" />
                            </div>

                            {/* 🧩 BLOCO 2: SANFONA CADASTRAL (ACCORDION) */}
                            <CustomerAccordion
                                data={{
                                    firstName: editor.firstName, lastName: editor.lastName, documentType: editor.documentType, documentNumber: editor.documentNumber,
                                    phone: editor.phone, email: editor.email, cep: editor.cep, state: editor.state, city: editor.city, neighborhood: editor.neighborhood,
                                    street: editor.street, houseNumber: editor.houseNumber, complement: editor.complement, referencePoint: editor.referencePoint
                                }}
                                onChangeField={(field, value) => {
                                    const setterName = `set${field.charAt(0).toUpperCase()}${field.slice(1)}`;
                                    if ((editor as any)[setterName]) (editor as any)[setterName](value);
                                }}
                            />

                            {/* Observações da Tarefa */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Observações da Tarefa</label>
                                <textarea value={editor.description} onChange={(e) => editor.setDescription(e.target.value)} rows={3} placeholder="Adicione detalhes, notas ou observações..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 text-sm font-medium resize-none" />
                            </div>

                            {/* 🧩 BLOCO 3: ANEXOS */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Mídias e Anexos ({editor.medias.length})</h4>
                                <MediaManager medias={editor.medias} onChangeMedias={(updated) => editor.setMedias(updated)} onOpenLightbox={(media) => editor.setActiveMedia(media)} />
                            </div>

                            {/* 🧩 BLOCO 4: LANÇAMENTOS FINANCEIROS */}
                            <FinancialManager financials={editor.financials} onChangeFinancials={(updated) => editor.setFinancials(updated)} />

                            {/* 🧩 BLOCO 5: RODAPÉ E BOTÕES DE AÇÃO */}
                            <div className="flex gap-3 border-t border-slate-100 pt-4 justify-end">
                                <button type="button" onClick={onClose} className={ERP_THEME.modal.btnCancel}>
                                    Cancelar
                                </button>
                                <button type="submit" className={ERP_THEME.modal.btnConfirm}>
                                    <Save className="w-4 h-4" />
                                    <span>Salvar Alterações</span>
                                </button>
                            </div>
                        </motion.form>
                    </div>
                )}
            </AnimatePresence>

            {/* ✨ REAPROVEITAMENTO UNIVERSAL: Consome o mesmo Lightbox modular do Wizard! */}
            <MediaLightbox
                isOpen={editor.activeMedia !== null}
                medias={editor.medias}
                activeMedia={editor.activeMedia}
                onClose={() => editor.setActiveMedia(null)}
                onSelectMedia={(media) => editor.setActiveMedia(media)}
            />
        </>
    );
}
