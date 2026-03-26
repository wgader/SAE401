import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RenderErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.group('React Render Error');
    console.error(error);
    console.error(errorInfo);
    console.groupEnd();
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      
      return (
        <div className="p-8 text-center flex flex-col items-center justify-center gap-4 bg-surface/50 rounded-2xl border border-border m-4">
          <h2 className="text-xl font-bold text-text-primary">Oups ! Quelque chose s'est mal passé.</h2>
          <p className="text-text-secondary max-w-md">{this.state.error?.message || "Une erreur inattendue est survenue lors du rendu."}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-black font-bold rounded-full hover:opacity-90 transition-all font-sf-pro"
          >
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
