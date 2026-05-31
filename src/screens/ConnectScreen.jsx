import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store.js';
import { buildAuthURL } from '../lib/auth.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useToast } from '../contexts/ToastContext.jsx';
import Notice from '../components/ui/Notice.jsx';
import WizardStepper from '../components/ui/WizardStepper.jsx';

export default function ConnectScreen() {
  usePageTitle('Connect to Xero');
  const [loading,  setLoading]  = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const navigate   = useNavigate();
  const toast      = useToast();
  const clientId   = useAuthStore(s => s.clientId);
  const clearAll   = useAuthStore(s => s.clearAll);

  const onOpen = async () => {
    setLoading(true);
    setPopupBlocked(false);
    try {
      const url = await buildAuthURL(clientId);
      const win = window.open(url, '_blank', 'noopener');
      if (!win) setPopupBlocked(true);
    } catch (e) {
      toast('Could not build the Xero login URL. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => { clearAll(); navigate('/setup'); };

  return (
    <div className="screen active">
      <div className="card">
        <div className="card-glow" aria-hidden="true" />
        <WizardStepper step={2} />
        <h2>Connect to Xero</h2>
        <p>Click below to open Xero's secure login. You'll authorise this app, then be redirected back to complete the connection.</p>

        <Notice type="success">
          Your credentials are saved. OAuth2 PKCE is used — your Xero password is <strong>never</strong> stored or transmitted through this app.
        </Notice>

        <button type="button" className={`btn btn-primary${loading ? ' btn-loading' : ''}`} onClick={onOpen} disabled={loading} style={{ marginBottom: 10 }}>
          {loading ? 'Opening Xero…' : 'Open Xero Login →'}
        </button>
        {popupBlocked && (
          <Notice type="warn">
            Pop-up blocked — your browser prevented Xero from opening. Allow pop-ups for this site, or click &ldquo;I've authorised&rdquo; below to paste the callback URL manually.
          </Notice>
        )}
        <button type="button" className="btn btn-secondary" style={{ width: '100%' }} onClick={() => navigate('/callback')}>
          I've authorised — enter callback URL
        </button>
        <div style={{ marginTop: 12 }}>
          <button type="button" className="btn btn-ghost" onClick={onReset}>Change credentials</button>
        </div>
      </div>
    </div>
  );
}
