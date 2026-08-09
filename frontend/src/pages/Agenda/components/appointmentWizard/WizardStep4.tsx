import { motion } from 'framer-motion';
import { FinancialManager } from '../../../../components/FinancialManager.tsx';
import { TEXTS } from '../../../../i18n/index.ts';
import type { FinancialItem } from '../../../../types/appointment.ts';

interface WizardStep4Props {
  financials: FinancialItem[];
  setFinancials: (financials: FinancialItem[]) => void;
}

export function WizardStep4({ financials, setFinancials }: WizardStep4Props) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <p className="text-xs text-slate-400 font-medium">{TEXTS.agenda.wizard.financialHint}</p>
      <FinancialManager financials={financials} onChangeFinancials={setFinancials} />
    </motion.div>
  );
}
