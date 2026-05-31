import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="screen active" role="alert" aria-live="assertive">
        <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }} aria-hidden="true">⚠️</div>
          <h2 style={{ marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            {error.message || 'An unexpected error occurred.'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              style={{ width: 'auto', padding: '10px 24px' }}
              onClick={() => this.setState({ error: null })}
            >
              Try again
            </button>
            <button
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '10px 24px' }}
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
          {import.meta.env.DEV && (
            <details style={{ marginTop: 24, textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)' }}>
                Stack trace (dev only)
              </summary>
              <pre style={{ marginTop: 8, overflow: 'auto', fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}
