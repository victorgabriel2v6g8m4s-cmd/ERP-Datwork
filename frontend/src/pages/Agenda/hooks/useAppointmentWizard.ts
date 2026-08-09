import { useState } from 'react';
import { APP_CONFIG } from '../../../config/app.config.ts';
import type { FinancialItem, MediaItem } from '../../../types/appointment.ts';
import type { AppointmentMutationPayload } from '../types/agenda.types.ts';
import { getLocalDayKey } from '../utils/appointmentSchedule.ts';
import { useAppointmentAddressAutofill } from './useAppointmentAddressAutofill.ts';

interface UseAppointmentWizardProps {
  onSave: (payload: AppointmentMutationPayload) => Promise<void>;
}

export function useAppointmentWizard({ onSave }: UseAppointmentWizardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState(() => getLocalDayKey(new Date()));
  const [description, setDescription] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [documentType, setDocumentType] = useState(APP_CONFIG.agenda.defaults.documentType);
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
  const [medias, setMedias] = useState<MediaItem[]>([]);
  const [financials, setFinancials] = useState<FinancialItem[]>([]);

  useAppointmentAddressAutofill({ cep, setStreet, setNeighborhood, setCity, setState });

  const handleResetModal = () => {
    setTitle('');
    setTime('');
    setDate(getLocalDayKey(new Date()));
    setDescription('');
    setFirstName('');
    setLastName('');
    setDocumentType(APP_CONFIG.agenda.defaults.documentType);
    setDocumentNumber('');
    setPhone('');
    setEmail('');
    setCep('');
    setState('');
    setCity('');
    setNeighborhood('');
    setStreet('');
    setHouseNumber('');
    setComplement('');
    setReferencePoint('');
    setMedias([]);
    setFinancials([]);
    setStep(1);
    setIsOpen(false);
  };

  const handleFinalSubmit = async () => {
    const filteredFinancials = financials.filter((item) => item.description.trim());
    await onSave({
      title: title.trim(),
      time,
      createdAt: date,
      subStatus: APP_CONFIG.agenda.defaults.subStatus,
      description: description.trim() || null,
      firstName: firstName.trim() || null,
      lastName: lastName.trim() || null,
      documentType: documentType.trim() || null,
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
      medias,
      financials: filteredFinancials
    });
    handleResetModal();
  };

  return {
    isOpen, setIsOpen, step, setStep,
    title, setTitle, time, setTime, date, setDate, description, setDescription,
    firstName, setFirstName, lastName, setLastName, documentType, setDocumentType,
    documentNumber, setDocumentNumber, phone, setPhone, email, setEmail,
    cep, setCep, state, setState, city, setCity, neighborhood, setNeighborhood,
    street, setStreet, houseNumber, setHouseNumber, complement, setComplement,
    referencePoint, setReferencePoint, medias, setMedias, financials, setFinancials,
    handleResetModal, handleFinalSubmit
  };
}

export type AppointmentWizardState = ReturnType<typeof useAppointmentWizard>;
