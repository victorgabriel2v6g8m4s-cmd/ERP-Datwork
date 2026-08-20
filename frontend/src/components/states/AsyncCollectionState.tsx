import { Inbox, RefreshCw, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { SYSTEM_TEXTS } from '../../i18n/system.ts';
import { SYSTEM_THEME } from '../../theme/system.ts';

interface AsyncCollectionStateProps {
  isLoading: boolean;
  errorMessage: string | null;
  isEmpty: boolean;
  onRetry: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  children: ReactNode;
}

export function AsyncCollectionState({
  isLoading,
  errorMessage,
  isEmpty,
  onRetry,
  emptyTitle = SYSTEM_TEXTS.feedback.emptyTitle,
  emptyDescription = SYSTEM_TEXTS.feedback.emptyDescription,
  children
}: AsyncCollectionStateProps) {
  if (isLoading) {
    return (
      <div className={SYSTEM_THEME.feedback.shell} role="status" aria-live="polite">
        <div className={SYSTEM_THEME.feedback.content}>
          <div className={SYSTEM_THEME.feedback.spinner} aria-hidden="true" />
          <p className={SYSTEM_THEME.feedback.description}>{SYSTEM_TEXTS.feedback.loading}</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className={SYSTEM_THEME.feedback.shell} role="alert">
        <div className={SYSTEM_THEME.feedback.content}>
          <TriangleAlert className={`${SYSTEM_THEME.feedback.icon} text-rose-500`} aria-hidden="true" />
          <h2 className={SYSTEM_THEME.feedback.title}>{SYSTEM_TEXTS.feedback.errorTitle}</h2>
          <p className={SYSTEM_THEME.feedback.description}>{errorMessage}</p>
          <button type="button" className={SYSTEM_THEME.feedback.retry} onClick={onRetry}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {SYSTEM_TEXTS.feedback.retry}
          </button>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={SYSTEM_THEME.feedback.shell}>
        <div className={SYSTEM_THEME.feedback.content}>
          <Inbox className={SYSTEM_THEME.feedback.icon} aria-hidden="true" />
          <h2 className={SYSTEM_THEME.feedback.title}>{emptyTitle}</h2>
          <p className={SYSTEM_THEME.feedback.description}>{emptyDescription}</p>
        </div>
      </div>
    );
  }

  return children;
}
