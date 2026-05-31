import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store.js';
import { buildAuthURL } from '../lib/auth.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { Card } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import Notice from '../components/ui/Notice.jsx';
import WizardStepper from '../components/ui/WizardStepper.jsx';

export default function ConnectScreen() {
  usePageTitle('Connect to Xero');
  const [loading,      setLoading]      = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const navigate   = useNavigate();
  const toast      = useToast();
  const clientId   = useAuthStore(s => s.clientId);
  const clearAll   = useAuthStore(s => s.clearAll);

  const onOpen = async () => {
    setLoading(true); setPopupBlocked(false);
    try {
      const url = await buildAuthURL(clientId);
      const win = window.open(url, '_blank', 'noopener');
      if (!win) setPopupBlocked(true);
    } catch { toast('Could not build the Xero login URL. Please try again.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="screen active flex justify-center">
      <div className="w-full max-w-lg">
        <Card className="relative overflow-hidden">
          <div className="card-glow" aria-hidden="true" />
          <WizardStepper step={2} />
          <h2 className="text-xl font-bold mb-2">Connect to Xero</h2>
          <p className="text-sm text-[var(--color-muted)] mb-6 leading-relaxed">Click below to open Xero&apos;s secure login. You&apos;ll authorise this app, then be redirected back to complete the connection.</p>

          <Notice type="success" className="mb-6">
            Your credentials are saved. OAuth2 PKCE is used — your Xero password is <strong>never</strong> stored or transmitted through this app.
          </Notice>

          <div className="space-y-3">
            <Button type="button" loading={loading} onClick={onOpen} disabled={loading} className="w-full">
              {loading ? 'Opening Xero…' : 'Open Xero Login →'}
            </Button>
            {popupBlocked && <Notice type="warn">Pop-up blocked. Allow pop-ups for this site, or click &quot;I&apos;ve authorised&quot; below to paste the callback URL manually.</Notice>}
            <Button type="button" variant="secondary" className="w-full" onClick={() => navigate('/callback')}>
              I&apos;ve authorised — enter callback URL
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => { clearAll(); navigate('/setup'); }}>
              Change credentials
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
