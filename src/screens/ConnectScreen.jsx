import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store.js';
import { buildAuthURL } from '../lib/auth.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import Notice from '../components/ui/Notice.jsx';
import WizardStepper from '../components/ui/WizardStepper.jsx';

export default function ConnectScreen() {
  usePageTitle('Connect to Xero');
  const [loading,  setLoading]  = useState(false);
  const navigate   = useNavigate();
  const clientId   = useAuthStore(s => s.clientId);
  const clearAll   = useAuthStore(s => s.clearAll);

  const onOpen = async () => {
    setLoading(true);
    try {
      const url = await buildAuthURL(clientId);
      window.open(url, '_blank', 'noopener');
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

        <button className={`btn btn-primary${loading ? ' btn-loading' : ''}`} onClick={onOpen} disabled={loading} style={{ marginBottom: 10 }}>
          {loading ? 'Opening Xero…' : 'Open Xero Login →'}
        </button>
        <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => navigate('/callback')}>
          I've authorised — enter callback URL
        </button>
        <div style={{ marginTop: 12 }}>
          <button className="btn btn-ghost" onClick={onReset}>Change credentials</button>
        </div>
      </div>
    </div>
  );
}
