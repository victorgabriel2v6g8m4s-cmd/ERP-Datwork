import { api } from '../../../api/client.ts';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, FileText, Upload } from 'lucide-react';
import { type Appointment, type FinancialItem, type MediaItem } from '../../../types/appointment.ts';
import { MediaLightbox } from '../../../components/MediaLightbox.tsx';
import { CustomerAccordion } from '../../../components/CustomerAccordion.tsx';
import { FinancialManager } from '../../../components/FinancialManager.tsx';
import { MediaManager } from '../../../components/MediaManager.tsx';
import { type SubStatusKey, UniversalSubStatusSelect } from '../../../components/index.ts';

interface EditAppointmentModalProps {
    isOpen: boolean;
    appointment: Appointment | null;
    onClose: () => void;
    onSave: (id: string, updatedData: any) => Promise<void>;
}
export function EditAppointmentModal({ isOpen, appointment, onClose, onSave }: EditAppointmentModalProps) {
    const [name, setName] = useState('');
    const [time, setTime] = useState('');
    const [date, setDate] = useState('');
    const [subStatus, setSubStatus] = useState<SubStatusKey>('CONFIRMADO');
    const [description, setDescription] = useState('');

    // 📝 Estados para a categoria de IDENTIFICAÇÃO
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [documentType, setDocumentType] = useState('CPF');
    const [documentNumber, setDocumentNumber] = useState('');

    // 📝 Estados para a categoria de CONTATO
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    // 📝 Estados para a categoria de ENDEREÇO
    const [cep, setCep] = useState('');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [street, setStreet] = useState('');
    const [houseNumber, setHouseNumber] = useState('');
    const [complement, setComplement] = useState('');
    const [referencePoint, setReferencePoint] = useState('');

    const [medias, setMedias] = useState<MediaItem[]>([]);
    const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
    const [financials, setFinancials] = useState<FinancialItem[]>([{ value: 0, type: 'income', description: '' }]);

    useEffect(() => {
        if (appointment && isOpen) {
            setName(appointment.title); // Sincronizado com title
            setTime(appointment.time);
            setDate(appointment.createdAt.substring(0, 10));
            setSubStatus(appointment.subStatus || 'CONFIRMADO');
            setDescription(appointment.description || '');
            setMedias(appointment.medias ? JSON.parse(appointment.medias) : []);
            const savedFinancials = appointment.financials ? JSON.parse(appointment.financials) : [];
            setFinancials(savedFinancials.length > 0 ? savedFinancials : [{ value: 0, type: 'income', description: '' }]);

            // ✨ Carrega os novos dados do Accordion se existirem
            setFirstName(appointment.firstName || '');
            setLastName(appointment.lastName || '');
            setDocumentType(appointment.documentType || 'CPF');
            setDocumentNumber(appointment.documentNumber || '');
            setPhone(appointment.phone || '');
            setEmail(appointment.email || '');
            setCep(appointment.cep || '');
            setState(appointment.state || '');
            setCity(appointment.city || '');
            setNeighborhood(appointment.neighborhood || '');
            setStreet(appointment.street || '');
            setHouseNumber(appointment.houseNumber || '');
            setComplement(appointment.complement || '');
            setReferencePoint(appointment.referencePoint || '');
        }
    }, [appointment, isOpen]);

    useEffect(() => {
        const autoFill = async () => {
            const cleanCEP = cep.replace(/\D/g, '');
            if (cleanCEP.length === 8) {
                const { fetchAddressByCEP } = await import('../../../utils/cep.ts');
                const data = await fetchAddressByCEP(cleanCEP);

                console.log(data)

                if (data) {
                    setStreet(data.logradouro);
                    setNeighborhood(data.bairro);
                    setCity(data.localidade);
                    setState(data.uf);
                }
            }
        };

        autoFill();
    }, [cep]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!appointment) return;

        // 1. Filtra as linhas financeiras vazias geradas pelo accordion/botão
        const filteredFinancials = financials.filter(f => f.description.trim() !== '');

        // 2. Converte as mídias e finanças para string de texto literal (Evita PrismaClientValidationError)
        const mediasPayload = medias && medias.length > 0
            ? typeof medias === 'string' ? medias : JSON.stringify(medias)
            : null;

        const financialsPayload = filteredFinancials.length > 0
            ? JSON.stringify(filteredFinancials)
            : null;

        // 3. Dispara a esteira passando os tipos corretos exigidos pelo SQLite
        await onSave(appointment.id, {
            title: name,
            time,
            createdAt: date,
            subStatus,
            description: description.trim() || null,
            medias: mediasPayload,       // ✨ Enviado estritamente como String
            financials: financialsPayload, // ✨ Enviado estritamente como String

            // Dados adicionais das sanfonas (Accordion)
            firstName: firstName.trim() || null,
            lastName: lastName.trim() || null,
            documentType,
            documentNumber: documentNumber.trim() || null,
            phone: phone.trim() || null,
            email: email.trim() || null,
            cep: cep.trim() || null,
            state: state.trim() || null,
            city: city.trim() || null,
            neighborhood: neighborhood.trim() || null,
            street: street.trim() || null,
            houseNumber: houseNumber.trim() || null,
            complement: complement.trim() || null,
            referencePoint: referencePoint.trim() || null,
        });

        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && appointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <motion.form
                        onSubmit={handleSubmit}
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 p-6 my-8 max-h-[90vh] overflow-y-auto space-y-6"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2 text-indigo-600">
                                <FileText className="w-5 h-5" />
                                <h3 className="text-lg font-black text-slate-800">Editar Agendamento</h3>
                            </div>
                            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Grid Principal: Nome e Horário */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nome do Cliente</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-800"
                                />
                            </div>
                            {/* ✨ Novo Input de Data no Form */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Data Agendada</label>
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-semibold cursor-pointer h-[38px]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Horário</label>
                                <input
                                    type="time"
                                    required
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-800"
                                />
                            </div>
                        </div>

                        <div>
                            <UniversalSubStatusSelect
                                value={subStatus || (appointment as any)?.subStatus || 'CONFIRMADO'}
                                onChange={(nextSub) => setSubStatus(nextSub)}
                                variant="form"
                            />
                        </div>

                        <CustomerAccordion
                            data={{
                                firstName, lastName, documentType, documentNumber,
                                phone, email, cep, state, city, neighborhood,
                                street, houseNumber, complement, referencePoint
                            }}
                            onChangeField={(field, value) => {
                                // Mapeador dinâmico de estados para atualizar a caixa correspondente
                                if (field === 'firstName') setFirstName(value);
                                else if (field === 'lastName') setLastName(value);
                                else if (field === 'documentType') setDocumentType(value);
                                else if (field === 'documentNumber') setDocumentNumber(value);
                                else if (field === 'phone') setPhone(value);
                                else if (field === 'email') setEmail(value);
                                else if (field === 'cep') setCep(value);
                                else if (field === 'state') setState(value);
                                else if (field === 'city') setCity(value);
                                else if (field === 'neighborhood') setNeighborhood(value);
                                else if (field === 'street') setStreet(value);
                                else if (field === 'houseNumber') setHouseNumber(value);
                                else if (field === 'complement') setComplement(value);
                                else if (field === 'referencePoint') setReferencePoint(value);
                            }}
                        />

                        {/* Observações da Tarefa */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Observações da Tarefa</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="Adicione detalhes, notas ou observações..."
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 resize-none"
                            />
                        </div>

                        {/* 📁 SEÇÃO DE MÍDIAS REORGANIZADA (CLEAN CODE) */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Mídias e Anexos ({medias.length})</h4>
                            <MediaManager
                                medias={medias}
                                onChangeMedias={(updated) => setMedias(updated)} // ✨ Atualiza o estado local reativamente
                                onOpenLightbox={(media) => setActiveMedia(media)} // ✨ Abre o visualizador de tela cheia linear
                            />
                        </div>

                        {/* Movimentação Financeira */}
                        <FinancialManager
                            financials={financials}
                            onChangeFinancials={(updated) => setFinancials(updated)} // ✨ Sincroniza o estado de forma transparente
                        />

                        {/* Rodapé e Botões de Ação */}
                        <div className="flex gap-3 border-t border-slate-100 pt-4 justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2 text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-md shadow-indigo-100 cursor-pointer"
                            >
                                <Save className="w-4 h-4" />
                                <span>Salvar Alterações</span>
                            </button>
                        </div>
                    </motion.form>
                    <MediaLightbox
                        isOpen={activeMedia !== null}
                        medias={medias}
                        activeMedia={activeMedia}
                        onClose={() => setActiveMedia(null)}
                        onSelectMedia={(media) => setActiveMedia(media)}
                    />
                </div>
            )}
        </AnimatePresence>
    );
}

