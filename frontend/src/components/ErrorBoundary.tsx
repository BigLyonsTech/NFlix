import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled error in app render tree:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen bg-black flex flex-col items-center justify-center gap-4 text-center px-6">
          <h1 className="text-white text-2xl font-bold">Something went wrong</h1>
          <p className="text-zinc-400 text-sm max-w-md">
            The app hit an unexpected error. Try reloading the page - if it keeps happening, please report it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 transition text-white font-bold px-6 py-2.5 rounded-full text-sm"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
