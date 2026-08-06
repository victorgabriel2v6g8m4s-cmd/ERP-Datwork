import { useState, useEffect } from 'react';
import { type Appointment, type FinancialItem, type MediaItem } from '../../../types/appointment.ts';
import { type SubStatusKey } from '../../../components/index.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';

interface UseAppointmentEditorProps {
    isOpen: boolean;
    appointment: Appointment | null;
    onClose: () => void;
    onSave: (id: string, updatedData: any) => Promise<void>;
}

export function useAppointmentEditor({ isOpen, appointment, onClose, onSave }: UseAppointmentEditorProps) {
    const [name, setName] = useState('');
    const [time, setTime] = useState('');
    const [date, setDate] = useState('');
    const [subStatus, setSubStatus] = useState<SubStatusKey>('CONFIRMADO');
    const [description, setDescription] = useState('');

    // Identificação e Contato
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [documentType, setDocumentType] = useState('CPF');
    const [documentNumber, setDocumentNumber] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    // Endereço
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

    // 🛡️ Sincronização inicial blindada contra arrays nativos
    useEffect(() => {
        if (appointment && isOpen) {
            CustomLogger.info(`[Editor] Carregando parâmetros do agendamento ID: ${appointment.id}`);
            setName(appointment.title);
            setTime(appointment.time);
            setDate(appointment.createdAt.substring(0, 10));
            setSubStatus((appointment.subStatus as SubStatusKey) || 'CONFIRMADO');
            setDescription(appointment.description || '');

            setMedias(typeof appointment.medias === 'string'
                ? (() => { try { return JSON.parse(appointment.medias); } catch { return []; } })()
                : (Array.isArray(appointment.medias) ? appointment.medias : [])
            );

            const savedFinancials = typeof appointment.financials === 'string'
                ? (() => { try { return JSON.parse(appointment.financials); } catch { return []; } })()
                : (Array.isArray(appointment.financials) ? appointment.financials : []);

            setFinancials(savedFinancials.length > 0 ? savedFinancials : [{ value: 0, type: 'income', description: '' }]);

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

    // 🤖 Consulta assíncrona inteligente de CEP
    useEffect(() => {
        const autoFill = async () => {
            const cleanCEP = cep.replace(/\D/g, '');
            if (cleanCEP.length === 8) {
                try {
                    const { fetchAddressByCEP } = await import('../../../utils/cep.ts');
                    const data = await fetchAddressByCEP(cleanCEP);
                    if (data) {
                        setStreet(data.logradouro || '');
                        setNeighborhood(data.bairro || '');
                        setCity(data.localidade || '');
                        setState(data.uf || '');
                        CustomLogger.info('[Editor CEP] Endereço preenchido com sucesso por indexação reativa.');
                    }
                } catch (error) {
                    CustomLogger.error('[Editor CEP] Falha na requisição assíncrona', error);
                }
            }
        };
        autoFill();
    }, [cep]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!appointment) return;

        const filteredFinancials = financials.filter(f => f.description.trim() !== '');
        CustomLogger.info(`[Editor] Persistindo alterações na API do Node para o agendamento ${appointment.id}`);

        // ✨ Envia mídias e finanças como objetos puros para o Prisma JSON nativo!
        await onSave(appointment.id, {
            title: name,
            time,
            createdAt: date,
            subStatus,
            description: description.trim() || null,
            medias: medias.length > 0 ? medias : null,
            financials: filteredFinancials.length > 0 ? filteredFinancials : null,
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

    return {
        name, setName, time, setTime, date, setDate, subStatus, setSubStatus, description, setDescription,
        firstName, setFirstName, lastName, setLastName, documentType, setDocumentType, documentNumber, setDocumentNumber,
        phone, setPhone, email, setEmail, cep, setCep, state, setState, city, setCity, neighborhood, setNeighborhood,
        street, setStreet, houseNumber, setHouseNumber, complement, setComplement, referencePoint, setReferencePoint,
        medias, setMedias, activeMedia, setActiveMedia, financials, setFinancials, handleSubmit
    };
}
