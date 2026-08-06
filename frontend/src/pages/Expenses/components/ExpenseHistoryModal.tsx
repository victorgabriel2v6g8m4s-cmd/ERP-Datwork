import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, ChevronRight, History } from 'lucide-react';
import { api } from '../../../api/client.ts';

interface ExpenseHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRevertVersion: (items: any[]) => void;
}

export function ExpenseHistoryModal({ isOpen, onClose, onRevertVersion }: ExpenseHistoryModalProps) {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) { fetchVersions(); }
  }, [isOpen]);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/expenses/versions');
      setVersions(response.data);
    } catch { setVersions([]); }
    finally { setLoading(false); }
  };

  const handleApplySnapshot = (snapshotJson: string) => {
    const restored = JSON.parse(snapshotJson);
    onRevertVersion(restored);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-black/40 backdrop-blur-xs font-sans text-xs">
        <motion.div
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-sm bg-white h-screen shadow-2xl p-5 border-l border-slate-100 flex flex-col space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
            <div className="flex items-center gap-2 text-indigo-600">
              <History className="w-4 h-4" />
              <h3 className="font-black text-slate-800 text-sm">Versões da Planilha</h3>
            </div>
            <button onClick={onClose} className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full cursor-pointer"><X className="w-4 h-4" /></button>
          </div>

          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block shrink-0">Logs Cronológicos Retroativos</p>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[80vh]">
            {loading ? (
              <div className="text-center py-12 text-slate-400 animate-pulse font-bold">Carregando logs de auditoria...</div>
            ) : (
              versions.map((v, index) => (
                <button
                  key={v.id || `exp-v-${index}`}
                  type="button"
                  onClick={() => handleApplySnapshot(v.snapshotData)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-300 text-slate-600 block cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="text-[10px] font-black tracking-wide uppercase text-indigo-600 opacity-80">Backup V{versions.length - index}</div>
                    <div className="font-bold text-slate-800 font-sans mt-0.5">
                      {new Date(v.versionDate).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </button>
              ))
            )}

            {!loading && versions.length === 0 && (
              <div className="text-center py-12 text-slate-400 font-bold uppercase text-[10px]">Nenhum histórico gerado ainda.</div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
