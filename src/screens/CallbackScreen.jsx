import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeCode } from '../lib/auth.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { translateError } from '../lib/utils.js';
import { loadConnections } from '../lib/xero.js';
import { useAuthStore } from '../lib/store.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
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
    setLoading(true);
    setError('');
    try {
      await exchangeCode(authCode, authState);
      const conns = await loadConnections();
      if (conns.length > 1) {
        navigate('/org-select');
      } else {
        setTenant(conns[0].tenantId, conns[0].tenantName);
        toast('Connected to Xero', 'success');
        navigate('/dashboard');
      }
    } catch (e) {
      const msg = translateError(e.message);
      setError(msg);
      toast(msg, 'error', 6000);
      setLoading(false);
    }
  };

  // Auto-exchange if code was passed directly (from OAuth redirect)
  useEffect(() => {
    if (code && state) finish(code, state);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onManual = async () => {
    try {
      const u = new URL(url.trim());
      const c = u.searchParams.get('code');
      const s = u.searchParams.get('state');
      if (!c) throw new Error('No authorisation code found in the URL. Make sure you pasted the full redirect URL.');
      await finish(c, s);
    } catch (e) {
      const msg = e instanceof TypeError ? 'Invalid URL — please paste the full redirect URL from your browser.' : translateError(e.message);
      setError(msg);
      toast(msg, 'error', 6000);
    }
  };

  return (
    <div className="screen active">
      <div className="card">
        <div className="card-glow" aria-hidden="true" />
        <WizardStepper step={2} />
        <h2>Complete Connection</h2>
        <p>Xero has redirected you back. Paste the full URL from your browser address bar below to complete the connection.</p>

        <Notice type="info">
          After clicking "Connect with Xero", your browser will redirect to a Xero login page. After authorising, you'll be redirected back here with a code in the URL. Copy that full URL and paste it below.
        </Notice>

        {loading && (
          <div className="loader" role="status">
            <div className="spinner" aria-hidden="true" /> Completing connection…
          </div>
        )}

        {!loading && (
          <>
            <div className="field">
              <label htmlFor="inputCallbackUrl">Full Redirect URL from browser</label>
              <input id="inputCallbackUrl" type="text" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && onManual()} placeholder="https://yoursite.com/callback?code=…&state=…" autoComplete="off" spellCheck={false} />
            </div>
            {error && <Notice type="warn">{error}</Notice>}
            <button className="btn btn-primary" onClick={onManual}>Complete Connection →</button>
          </>
        )}
      </div>
    </div>
  );
}
