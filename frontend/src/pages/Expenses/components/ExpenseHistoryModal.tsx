import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, History, X } from 'lucide-react';
import { APP_CONFIG } from '../../../config/app.config.ts';
import { TEXTS } from '../../../i18n/index.ts';
import { ERP_THEME } from '../../../theme/presets.ts';
import { UI_KEYS } from '../../../ui/keys.ts';
import { useExpenseHistory } from '../hooks/useExpenseHistory.ts';

interface ExpenseHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreVersion: (versionId: string) => Promise<void>;
}

export function ExpenseHistoryModal({ isOpen, onClose, onRestoreVersion }: ExpenseHistoryModalProps) {
  const history = useExpenseHistory(isOpen);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const handleRestore = async (versionId: string) => {
    setRestoringId(versionId);
    try {
      await onRestoreVersion(versionId);
      onClose();
    } catch {
      // The ledger hook owns error reporting and keeps the modal open for retry.
    } finally {
      setRestoringId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className={ERP_THEME.expenses.history.overlay} data-ui-key={UI_KEYS.expenses.historyModal}>
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={ERP_THEME.expenses.history.panel}
        >
          <div className={ERP_THEME.expenses.history.header}>
            <div className="flex items-center gap-2 text-indigo-600">
              <History className="w-4 h-4" />
              <h3 className="font-black text-slate-800 text-sm" data-ui-key={UI_KEYS.expenses.historyTitle}>
                {TEXTS.expenses.history.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={ERP_THEME.expenses.history.closeButton}
              data-ui-key={UI_KEYS.expenses.historyClose}
              aria-label={TEXTS.common.actions.close}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block shrink-0">
            {TEXTS.expenses.history.subtitle}
          </p>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[80vh]">
            {history.loading && (
              <div className="text-center py-12 text-slate-400 animate-pulse font-bold">
                {TEXTS.expenses.history.loading}
              </div>
            )}

            {!history.loading && history.errorMessage && (
              <div className={ERP_THEME.expenses.history.empty}>{history.errorMessage}</div>
            )}

            {!history.loading && !history.errorMessage && history.versions.map((version, index) => (
              <button
                key={version.id}
                type="button"
                onClick={() => void handleRestore(version.id)}
                disabled={restoringId !== null}
                className={ERP_THEME.expenses.history.versionButton}
                data-ui-key={UI_KEYS.expenses.historyVersion}
                title={TEXTS.expenses.history.restoreTitle}
              >
                <div>
                  <div className="text-[10px] font-black tracking-wide uppercase text-indigo-600 opacity-80">
                    {TEXTS.expenses.history.versionLabel(history.versions.length - index)}
                  </div>
                  <div className="font-bold text-slate-800 font-sans mt-0.5">
                    {new Date(version.versionDate).toLocaleString(APP_CONFIG.locale, {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </button>
            ))}

            {!history.loading && !history.errorMessage && history.versions.length === 0 && (
              <div className={ERP_THEME.expenses.history.empty}>{TEXTS.expenses.history.empty}</div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
