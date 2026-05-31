/**
 * ATLAS Error Boundary
 *
 * React class component error boundary wrapping major sections.
 * Catches render errors and shows a graceful fallback UI instead of a blank screen.
 *
 * Usage:
 *   <ErrorBoundary section="Employment Chart">
 *     <EmploymentChart />
 *   </ErrorBoundary>
 */

import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  /** Label for the section — shown in fallback UI */
  section?: string;
  /** Optional fallback render */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(
      `[ATLAS ErrorBoundary] ${this.props.section ?? 'Unknown section'}:`,
      error,
      errorInfo.componentStack,
    );
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="bg-bg-card border border-border rounded-[16px] p-6"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="7" stroke="#EF4444" strokeWidth="1.5" />
                <path d="M8 4.5v4" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="8" cy="11" r="0.75" fill="#EF4444" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-critical">
                {this.props.section
                  ? `Error in ${this.props.section}`
                  : 'Something went wrong'}
              </h3>
              <p className="text-text-muted text-[11px] mt-1.5 font-mono break-all">
                {this.state.error?.message ?? 'An unexpected error occurred.'}
              </p>
              <button
                onClick={this.handleRetry}
                className="mt-3 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-gold border border-gold/30 rounded-md hover:bg-gold/10 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
