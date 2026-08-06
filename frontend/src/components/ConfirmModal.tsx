import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ isOpen, title, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-slate-100"
          >
            <div className="flex items-center gap-3 text-amber-600 mb-4">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-slate-900">Confirmar Cancelamento</h3>
            </div>
            
            <p className="text-slate-600 mb-6">
              Tem certeza que deseja desmarcar o atendimento do cliente <span className="font-semibold text-slate-800">"{title}"</span>? Esta ação removerá o agendamento da fila.
            </p>

            <div className="flex justify-end gap-3">
              <button 
                onClick={onCancel}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Voltar
              </button>
              <button 
                onClick={onConfirm}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer shadow-sm shadow-red-200"
              >
                Desmarcar Cliente
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
