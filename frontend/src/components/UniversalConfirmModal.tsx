import { motion, AnimatePresence } from 'framer-motion';
import { ERP_THEME } from '../theme/presets.ts';

interface UniversalConfirmDialogProps {
    isOpen: boolean;
    title: string;
    description: string;
    onClose: () => void;
    onConfirm: () => void;
}

export function UniversalConfirmDialog({ isOpen, title, description, onClose, onConfirm }: UniversalConfirmDialogProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className={ERP_THEME.modal.overlay}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className={ERP_THEME.modal.container}
                    >
                        <h3 className="text-base font-black text-slate-800">{title}</h3>
                        <p className="text-xs text-slate-400 font-bold leading-normal">{description}</p>
                        <div className="flex gap-2 pt-2">
                            <button type="button" onClick={onClose} className={ERP_THEME.modal.btnCancel}>
                                Desistir
                            </button>
                            <button type="button" onClick={onConfirm} className={ERP_THEME.modal.btnConfirm}>
                                Confirmar
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
