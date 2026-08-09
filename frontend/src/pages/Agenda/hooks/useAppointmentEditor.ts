import { useEffect, useState, type FormEvent } from 'react';
import { APP_CONFIG } from '../../../config/app.config.ts';
import type { Appointment, AppointmentSubStatus, FinancialItem, MediaItem } from '../../../types/appointment.ts';
import type { AppointmentMutationPayload } from '../types/agenda.types.ts';
import { getAppointmentDayKey } from '../utils/appointmentSchedule.ts';
import { useAppointmentAddressAutofill } from './useAppointmentAddressAutofill.ts';

interface UseAppointmentEditorProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onSave: (id: string, updatedData: AppointmentMutationPayload) => Promise<void>;
}

export function useAppointmentEditor({ isOpen, appointment, onClose, onSave }: UseAppointmentEditorProps) {
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [subStatus, setSubStatus] = useState<AppointmentSubStatus>(APP_CONFIG.agenda.defaults.subStatus);
  const [description, setDescription] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [documentType, setDocumentType] = useState<string>(APP_CONFIG.agenda.defaults.documentType);
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
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const [financials, setFinancials] = useState<FinancialItem[]>([]);

  useEffect(() => {
    if (!appointment || !isOpen) return;
    setName(appointment.title);
    setTime(appointment.time);
    setDate(getAppointmentDayKey(appointment.createdAt) ?? '');
    setSubStatus(appointment.subStatus);
    setDescription(appointment.description ?? '');
    setMedias(appointment.medias);
    setFinancials(appointment.financials);
    setFirstName(appointment.firstName ?? '');
    setLastName(appointment.lastName ?? '');
    setDocumentType(appointment.documentType ?? APP_CONFIG.agenda.defaults.documentType);
    setDocumentNumber(appointment.documentNumber ?? '');
    setPhone(appointment.phone ?? '');
    setEmail(appointment.email ?? '');
    setCep(appointment.cep ?? '');
    setState(appointment.state ?? '');
    setCity(appointment.city ?? '');
    setNeighborhood(appointment.neighborhood ?? '');
    setStreet(appointment.street ?? '');
    setHouseNumber(appointment.houseNumber ?? '');
    setComplement(appointment.complement ?? '');
    setReferencePoint(appointment.referencePoint ?? '');
  }, [appointment, isOpen]);

  useAppointmentAddressAutofill({ cep, setStreet, setNeighborhood, setCity, setState });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!appointment) return;
    await onSave(appointment.id, {
      title: name.trim(),
      time,
      createdAt: date,
      subStatus,
      description: description.trim() || null,
      medias,
      financials: financials.filter((item) => item.description.trim()),
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
      referencePoint: referencePoint.trim() || null
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
