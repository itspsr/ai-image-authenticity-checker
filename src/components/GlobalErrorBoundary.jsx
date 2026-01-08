
import React from 'react';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Global Crash Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // FIX 2: GLOBAL CRASH LISTENER - Show Fallback
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'white',
          background: '#0f172a',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ef4444' }}>Something went wrong</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
            We encountered an unexpected error, but your session is safe.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
