import { useState, useEffect } from 'react';
import { CustomLogger } from '../../../utils/CustomLogger.ts';

interface UseAppointmentWizardProps {
    onSave: (payload: any) => Promise<void>;
}

export function useAppointmentWizard({ onSave }: UseAppointmentWizardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);

    // Etapa 1: Dados Gerais
    const [title, setTitle] = useState('');
    const [time, setTime] = useState('');
    const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
    const [description, setDescription] = useState('');

    // Etapa 2: Cadastro do Cliente
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [documentType, setDocumentType] = useState('CPF');
    const [documentNumber, setDocumentNumber] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [cep, setCep] = useState('');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [street, setStreet] = useState('');
    const [houseNumber, setHouseNumber] = useState('');
    const [complement, setComplement] = useState('');
    const [referencePoint, setReferencePoint] = useState('');

    // Etapas 3 e 4: Mídias e Finanças
    const [medias, setMedias] = useState<any[]>([]);
    const [financials, setFinancials] = useState<any[]>([]);

    // Monitor e Autocompletar de CEP Resiliente
    useEffect(() => {
        const autoFill = async () => {
            const cleanCEP = cep.replace(/\D/g, '');
            if (cleanCEP.length === 8) {
                try {
                    CustomLogger.info(`[Wizard CEP] CEP completo detectado: ${cleanCEP}. Consultando endereço...`);
                    const { fetchAddressByCEP } = await import('../../../utils/cep.ts');
                    const data = await fetchAddressByCEP(cleanCEP);

                    if (data) {
                        setStreet(data.logradouro || '');
                        setNeighborhood(data.bairro || '');
                        setCity(data.localidade || '');
                        setState(data.uf || '');
                        CustomLogger.info('[Wizard CEP] Dados de endereço autocompletados com sucesso no formulário.');
                    }
                } catch (error) {
                    CustomLogger.error('[Wizard CEP] Erro na requisição assíncrona do CEP', error);
                }
            }
        };

        autoFill();
    }, [cep]);

    const handleResetModal = () => {
        setTitle(''); setTime(''); setDescription('');
        setFirstName(''); setLastName(''); setDocumentNumber('');
        setPhone(''); setEmail(''); setCep(''); setState('');
        setCity(''); setNeighborhood(''); setStreet(''); setHouseNumber('');
        setComplement(''); setReferencePoint(''); setMedias([]); setFinancials([]);
        setStep(1); setIsOpen(false);
    };

    const handleFinalSubmit = async () => {
        const filteredFinancials = financials.filter(f => f.description?.trim() !== '');

        CustomLogger.info('[Wizard] Compilando payload unificado estruturado.');

        // ✨ CORREÇÃO CRÍTICA: Envia os objetos e arrays puros (JSON nativo), sem stringify!
        await onSave({
            title,
            time,
            createdAt: date,
            description: description.trim() || null,
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
            medias: medias.length > 0 ? medias : null,
            financials: filteredFinancials.length > 0 ? filteredFinancials : null,
        });

        handleResetModal();
    };

    return {
        isOpen, setIsOpen, step, setStep, title, setTitle, time, setTime, date, setDate,
        description, setDescription, firstName, setFirstName, lastName, setLastName,
        documentType, setDocumentType, documentNumber, setDocumentNumber, phone, setPhone,
        email, setEmail, cep, setCep, state, setState, city, setCity, neighborhood, setNeighborhood,
        street, setStreet, houseNumber, setHouseNumber, complement, setComplement,
        referencePoint, setReferencePoint, medias, setMedias, financials, setFinancials,
        handleResetModal, handleFinalSubmit
    };
}
