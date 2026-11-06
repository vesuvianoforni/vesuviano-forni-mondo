import React from 'react';

interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: any, errorInfo: any) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <div style={{ padding: 16 }}>Questa sezione non è disponibile al momento.</div>;
    }
    return this.props.children;
  }
}
