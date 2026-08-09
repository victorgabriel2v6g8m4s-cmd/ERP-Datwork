import { motion } from 'framer-motion';
import { CustomerAccordion } from '../../../../components/CustomerAccordion.tsx';
import { TEXTS } from '../../../../i18n/index.ts';
import type { AppointmentWizardState } from '../../hooks/useAppointmentWizard.ts';

interface WizardStep2Props {
  wizard: AppointmentWizardState;
}

export function WizardStep2({ wizard }: WizardStep2Props) {
  const setters: Record<string, (value: string) => void> = {
    firstName: wizard.setFirstName,
    lastName: wizard.setLastName,
    documentType: wizard.setDocumentType,
    documentNumber: wizard.setDocumentNumber,
    phone: wizard.setPhone,
    email: wizard.setEmail,
    cep: wizard.setCep,
    state: wizard.setState,
    city: wizard.setCity,
    neighborhood: wizard.setNeighborhood,
    street: wizard.setStreet,
    houseNumber: wizard.setHouseNumber,
    complement: wizard.setComplement,
    referencePoint: wizard.setReferencePoint
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
      <p className="text-xs text-slate-400 font-medium mb-3">{TEXTS.agenda.wizard.customerHint}</p>
      <CustomerAccordion
        data={{
          firstName: wizard.firstName, lastName: wizard.lastName, documentType: wizard.documentType, documentNumber: wizard.documentNumber,
          phone: wizard.phone, email: wizard.email, cep: wizard.cep, state: wizard.state, city: wizard.city, neighborhood: wizard.neighborhood,
          street: wizard.street, houseNumber: wizard.houseNumber, complement: wizard.complement, referencePoint: wizard.referencePoint
        }}
        onChangeField={(field, value) => setters[field]?.(value)}
      />
    </motion.div>
  );
}
