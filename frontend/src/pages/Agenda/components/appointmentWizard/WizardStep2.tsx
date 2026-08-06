import { motion } from 'framer-motion';
import { CustomerAccordion } from '../../../../components/CustomerAccordion.tsx';

interface WizardStep2Props {
    wizard: any;
}

export function WizardStep2({ wizard }: WizardStep2Props) {
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
            <p className="text-xs text-slate-400 font-medium mb-3">Preencha os dados ou clique em "Pular Etapa" para avançar.</p>
            <CustomerAccordion
                data={{
                    firstName: wizard.firstName, lastName: wizard.lastName, documentType: wizard.documentType, documentNumber: wizard.documentNumber,
                    phone: wizard.phone, email: wizard.email, cep: wizard.cep, state: wizard.state, city: wizard.city, neighborhood: wizard.neighborhood,
                    street: wizard.street, houseNumber: wizard.houseNumber, complement: wizard.complement, referencePoint: wizard.referencePoint
                }}
                onChangeField={(field, value) => {
                    const setterName = `set${field.charAt(0).toUpperCase()}${field.slice(1)}`;
                    if (wizard[setterName]) wizard[setterName](value);
                }}
            />
        </motion.div>
    );
}
