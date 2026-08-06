import { motion } from 'framer-motion';
import { FinancialManager } from '../../../../components/FinancialManager.tsx';

interface WizardStep4Props {
    financials: any[];
    setFinancials: (f: any[]) => void;
}

export function WizardStep4({ financials, setFinancials }: WizardStep4Props) {
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <p className="text-xs text-slate-400 font-medium">Lance receitas ou despesas vinculadas ou clique em "Concluir Agendamento".</p>
            <FinancialManager financials={financials} onChangeFinancials={setFinancials} />
        </motion.div>
    );
}
