import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn(`[Planora ErrorBoundary] Caught error in ${this.props.name || 'component'}:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 rounded-2xl bg-[#FFFCF6] border border-[#EDE2D3] text-center space-y-3 shadow-sm my-4">
          <div className="w-10 h-10 rounded-xl bg-[#FDE8E6] text-[#C5221F] flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-[#171412]">
              Component Temporarily Unavailable
            </h4>
            <p className="text-xs text-[#6D6A66] mt-1 max-w-md mx-auto">
              {this.state.error?.message?.includes('reading \'get\'') || this.state.error?.message?.includes('google')
                ? 'The interactive map encountered an API key authorization notice. All vendor listings and planning features remain fully active below.'
                : 'An unexpected issue occurred while rendering this section.'}
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7A3D19] text-white text-xs font-semibold hover:bg-[#5D2E12] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
