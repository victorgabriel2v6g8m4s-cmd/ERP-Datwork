import { Component, type ErrorInfo, type ReactNode } from 'react';
import { TEXTS } from '../i18n/index.ts';
import { ERP_THEME } from '../theme/presets.ts';
import { UI_KEYS } from '../ui/keys.ts';
import { CustomLogger } from '../utils/CustomLogger.ts';

interface PageErrorBoundaryProps {
  children: ReactNode;
}

interface PageErrorBoundaryState {
  hasError: boolean;
}

export class PageErrorBoundary extends Component<PageErrorBoundaryProps, PageErrorBoundaryState> {
  public state: PageErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): PageErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    CustomLogger.error('[App] Failed to load or render the current page', {
      error,
      componentStack: errorInfo.componentStack
    });
  }

  private readonly retryPageLoad = (): void => {
    window.location.reload();
  };

  public render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className={ERP_THEME.app.routeError.shell} data-ui-key={UI_KEYS.app.routeError}>
        <section className={ERP_THEME.app.routeError.card} role="alert">
          <h1 className={ERP_THEME.app.routeError.title} data-ui-key={UI_KEYS.app.routeErrorTitle}>
            {TEXTS.common.pageLoadError.title}
          </h1>
          <p className={ERP_THEME.app.routeError.description} data-ui-key={UI_KEYS.app.routeErrorDescription}>
            {TEXTS.common.pageLoadError.description}
          </p>
          <button
            className={ERP_THEME.app.routeError.retry}
            data-ui-key={UI_KEYS.app.routeErrorRetry}
            onClick={this.retryPageLoad}
            type="button"
          >
            {TEXTS.common.pageLoadError.retry}
          </button>
        </section>
      </main>
    );
  }
}
