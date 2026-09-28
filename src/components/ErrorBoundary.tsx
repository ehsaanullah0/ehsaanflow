import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-sm my-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
            <AlertTriangle size={22} />
          </div>
          <h3 className="text-base font-extrabold text-[#281b18]">
            {this.props.fallbackTitle || 'Analytics Diagnostics Notice'}
          </h3>
          <p className="text-xs text-[#823b28]/80 max-w-sm mt-1.5 leading-relaxed">
            The analytics engine recovered gracefully from a data inconsistency. You can refresh the view or continue using your meters.
          </p>
          {this.state.error && (
            <div className="mt-3 p-2 bg-[#f6e9d7] rounded-xl text-[10px] font-mono text-[#823b28] max-w-md overflow-x-auto text-left border border-[#281b18]/10 w-full">
              {this.state.error.message}
            </div>
          )}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-1.5 bg-[#823b28] hover:bg-[#6f2f1f] text-[#f6e9d7] px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Retry Analytics</span>
            </button>
            {this.props.onReset && (
              <button
                onClick={this.props.onReset}
                className="flex items-center gap-1 bg-[#edd8c2] hover:bg-[#e3c4a7] text-[#823b28] px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer"
              >
                <X size={13} />
                <span>Dismiss</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
