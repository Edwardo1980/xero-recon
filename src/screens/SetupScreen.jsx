import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store.js';
import { REDIRECT_URI } from '../lib/constants.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { Card } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import Notice from '../components/ui/Notice.jsx';
import WizardStepper from '../components/ui/WizardStepper.jsx';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function SetupScreen() {
  const [clientId,     setClientId]     = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [error,        setError]        = useState('');
  const navigate       = useNavigate();
  const setCredentials = useAuthStore(s => s.setCredentials);
  const toast          = useToast();

  usePageTitle('Setup');
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef(null);
  useEffect(() => () => clearTimeout(copiedTimerRef.current), []);
  const copyUri = async () => {
    try { await navigator.clipboard.writeText(REDIRECT_URI); setCopied(true); copiedTimerRef.current = setTimeout(() => setCopied(false), 2000); }
    catch { toast('Copy failed — please select and copy the URI manually.', 'error'); }
  };

  const onSave = () => {
    const id = clientId.trim();
    if (!id) { setError('Please enter your Client ID.'); return; }
    if (!UUID_RE.test(id)) { setError('Client ID doesn\'t look right — it should be a UUID like xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx. Double-check the Xero developer portal.'); return; }
    setCredentials(id, clientSecret.trim());
    setError('');
    toast('Credentials saved', 'success');
    navigate('/connect');
  };

  return (
    <div className="screen active flex justify-center">
      <div className="w-full max-w-lg">
        <Card className="relative overflow-hidden">
          <div className="card-glow" aria-hidden="true" />
          <WizardStepper step={1} />
          <h2 className="text-xl font-bold mb-2">Welcome — one-time setup</h2>
          <p className="text-sm text-[var(--color-muted)] mb-6 leading-relaxed">This tool connects to Xero using their official API. You need a free Xero developer app to get started. Takes about 3 minutes.</p>

          <div className="steps" role="list" aria-label="Setup steps">
            <div className="step" role="listitem">
              <div className="step-n" aria-hidden="true">1</div>
              <div className="step-body">Go to <a href="https://developer.xero.com/app/manage" target="_blank" rel="noopener noreferrer" aria-label="Xero Developer Portal (opens in new tab)">developer.xero.com/app/manage</a> and sign in. Click <strong>New App</strong>.</div>
            </div>
            <div className="step" role="listitem">
              <div className="step-n" aria-hidden="true">2</div>
              <div className="step-body">
                Set <strong>Integration type</strong> to <strong>Web app</strong>. For <strong>Redirect URI</strong>, enter:
                <code id="redirectUriDisplay">{REDIRECT_URI}</code>
                <Button type="button" variant="ghost" size="sm" onClick={copyUri} className="mt-2" aria-label="Copy redirect URI to clipboard">
                  {copied ? '✓ Copied!' : 'Copy URI'}
                </Button>
              </div>
            </div>
            <div className="step" role="listitem">
              <div className="step-n" aria-hidden="true">3</div>
              <div className="step-body">After creating the app, copy your <strong>Client ID</strong> and <strong>Client Secret</strong> from the app dashboard.</div>
            </div>
            <div className="step" role="listitem">
              <div className="step-n" aria-hidden="true">4</div>
              <div className="step-body">Paste them below and click <strong>Save &amp; Connect</strong>.</div>
            </div>
          </div>

          <form onSubmit={e => { e.preventDefault(); onSave(); }} className="mt-6 space-y-5">
            <div>
              <Label htmlFor="inputClientId">Client ID</Label>
              <Input id="inputClientId" type="text" value={clientId} onChange={e => setClientId(e.target.value)} placeholder="Paste your Xero Client ID…" autoComplete="off" spellCheck={false} aria-invalid={!!error} aria-describedby={error ? 'setup-error' : undefined} />
            </div>
            <div>
              <Label htmlFor="inputClientSecret">
                Client Secret <span className="font-normal text-[var(--color-dim)] normal-case tracking-normal">(optional)</span>
              </Label>
              <Input id="inputClientSecret" type="password" value={clientSecret} onChange={e => setClientSecret(e.target.value)} placeholder="Leave blank for PKCE-only (recommended)…" autoComplete="off" />
              <p className="text-xs text-[var(--color-dim)] mt-1.5">PKCE works without a secret. If you enter one, it will be stored in your browser&apos;s local storage.</p>
            </div>
            {error && <Notice id="setup-error" type="warn">{error}</Notice>}
            <Button type="submit" className="w-full">Save &amp; Connect to Xero →</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
