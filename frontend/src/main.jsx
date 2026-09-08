import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import '@ant-design/v5-patch-for-react-19';

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
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
