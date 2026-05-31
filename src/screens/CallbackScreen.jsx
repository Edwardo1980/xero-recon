import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeCode } from '../lib/auth.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { translateError } from '../lib/utils.js';
import { loadConnections } from '../lib/xero.js';
import { useAuthStore } from '../lib/store.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { Card } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import Notice from '../components/ui/Notice.jsx';
import WizardStepper from '../components/ui/WizardStepper.jsx';

export default function CallbackScreen({ code, state }) {
  usePageTitle('Connecting…');
  const [url,     setUrl]     = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(Boolean(code));
  const navigate  = useNavigate();
  const toast     = useToast();
  const { setTenant } = useAuthStore.getState();

  const finish = async (authCode, authState) => {
    setLoading(true); setError('');
    try {
      await exchangeCode(authCode, authState);
      const conns = await loadConnections();
      if (conns.length > 1) { navigate('/org-select'); }
      else { setTenant(conns[0].tenantId, conns[0].tenantName); toast('Connected to Xero', 'success'); navigate('/dashboard'); }
    } catch (e) {
      const msg = translateError(e.message);
      setError(msg); toast(msg, 'error', 6000); setLoading(false);
    }
  };

  useEffect(() => {
    if (code && state) finish(code, state);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onManual = async () => {
    try {
      const u = new URL(url.trim());
      const c = u.searchParams.get('code');
      const s = u.searchParams.get('state');
      if (!c) throw new Error('No authorisation code found in the URL.');
      await finish(c, s);
    } catch (e) {
      const msg = e instanceof TypeError ? 'Invalid URL — please paste the full redirect URL from your browser.' : translateError(e.message);
      setError(msg); toast(msg, 'error', 6000);
    }
  };

  return (
    <div className="screen active flex justify-center">
      <div className="w-full max-w-lg">
        <Card className="relative overflow-hidden">
          <div className="card-glow" aria-hidden="true" />
          <WizardStepper step={2} />
          <h2 className="text-xl font-bold mb-2">Complete Connection</h2>
          <p className="text-sm text-[var(--color-muted)] mb-6 leading-relaxed">Xero has redirected you back. Paste the full URL from your browser address bar below to complete the connection.</p>

          <Notice type="info" className="mb-6">
            After authorising, copy the full URL from your browser address bar and paste it below.
          </Notice>

          {loading && (
            <div className="loader" role="status">
              <div className="spinner" aria-hidden="true" /> Completing connection…
            </div>
          )}

          {!loading && (
            <form onSubmit={e => { e.preventDefault(); onManual(); }} className="space-y-4">
              <div>
                <Label htmlFor="inputCallbackUrl">Full Redirect URL from browser</Label>
                <Input id="inputCallbackUrl" type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://yoursite.com/callback?code=…&state=…" autoComplete="off" spellCheck={false} />
              </div>
              {error && <Notice type="warn">{error}</Notice>}
              <Button type="submit" className="w-full">Complete Connection →</Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
