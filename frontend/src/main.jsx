import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'

// Error tracking is optional: Vite inlines VITE_SENTRY_DSN at build time, so it
// must be passed as a build arg. Works with sentry.io or self-hosted GlitchTip.
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
    release: import.meta.env.VITE_SENTRY_RELEASE || undefined,
    tracesSampleRate: 0,
    sendDefaultPii: false,
  });
}

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
    console.error(
      '🔴 [ROOT BOUNDARY] Uncaught render error:',
      '\nMessage:', error.message,
      '\nComponent stack:', info.componentStack,
      '\nFull error:', error
    );
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, fontFamily: 'monospace', background: '#fff0f0', minHeight: '100vh' }}>
          <h2 style={{ color: 'red' }}>💥 Caught by Root Error Boundary</h2>
          <p><b>Error:</b> {this.state.error?.message}</p>
          <p style={{ fontSize: 12, color: '#555' }}>Check the browser console for the full component stack.</p>
          <button
            style={{ marginTop: 16, padding: '8px 16px', cursor: 'pointer' }}
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try to recover
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </RootErrorBoundary>
  </React.StrictMode>
)
