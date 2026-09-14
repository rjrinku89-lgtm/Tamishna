import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-lg border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              !
            </div>
            <h1 className="text-xl font-bold text-slate-900">Application Initialization Notice</h1>
            <p className="text-sm text-slate-600">
              An unexpected error prevented the application interface from loading smoothly.
            </p>
            {this.state.error && (
              <div className="text-left bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono text-red-700 overflow-x-auto max-h-36">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2.5 bg-[#123b5d] hover:bg-[#0e2f4a] text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                Reload Application
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition"
              >
                Reset Stored Data & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
