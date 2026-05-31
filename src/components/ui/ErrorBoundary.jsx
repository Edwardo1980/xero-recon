import { Component } from 'react';
import { Card } from './card.jsx';
import { Button } from './button.jsx';

export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('[ErrorBoundary]', error, info.componentStack); }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="screen active" role="alert" aria-live="assertive">
        <Card className="text-center py-12 px-8">
          <div className="text-5xl mb-4" aria-hidden="true">⚠️</div>
          <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
          <p className="text-[var(--color-muted)] text-sm mb-8">{error.message || 'An unexpected error occurred.'}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button type="button" onClick={() => this.setState({ error: null })}>Try again</Button>
            <Button type="button" variant="secondary" onClick={() => window.location.reload()}>Reload page</Button>
          </div>
          {import.meta.env.DEV && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-xs text-[var(--color-dim)]">Stack trace (dev only)</summary>
              <pre className="mt-2 overflow-auto text-xs text-[var(--color-dim)] whitespace-pre-wrap">{error.stack}</pre>
            </details>
          )}
        </Card>
      </div>
    );
  }
}
