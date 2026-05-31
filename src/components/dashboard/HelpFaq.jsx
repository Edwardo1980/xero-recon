import { useState } from 'react';

const FAQS = [
  {
    q: 'What are unreconciled transactions?',
    a: 'Unreconciled transactions are bank transactions in Xero that haven\'t been matched to an invoice, bill, or categorised yet. Until they\'re reconciled, your books aren\'t fully up to date.',
  },
  {
    q: 'How do I reconcile in Xero?',
    a: 'Click "Open in Xero →" on any account row to go directly to that account\'s reconciliation page. Alternatively, in Xero go to Accounting → Bank Accounts and click Reconcile next to the account.',
  },
  {
    q: 'The transaction count looks wrong',
    a: 'This app only fetches authorised, unreconciled bank transactions. Draft, deleted, and already-reconciled items are excluded by design. Press R or click ↺ Refresh to get the latest data.',
  },
  {
    q: 'My session expired — what do I do?',
    a: 'Xero access tokens expire after 30 minutes. The app refreshes automatically. If you see "session expired", disconnect then click "Open Xero Login" to reconnect — your credentials are saved.',
  },
  {
    q: 'Is my data safe?',
    a: 'Yes. This app uses Xero\'s official OAuth2 PKCE flow — your password is never seen or stored. OAuth tokens live only in sessionStorage (wiped when the tab closes). Your Client ID and Secret are stored locally in your browser only.',
  },
  {
    q: 'Can I use this with multiple Xero organisations?',
    a: 'Yes. If your Xero account has access to multiple organisations you\'ll be prompted to choose one after connecting. Switch at any time using the organisation badge in the dashboard footer.',
  },
];

function FaqItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <div
        className={`faq-q${open ? ' open' : ''}`}
        onClick={() => setOpen(o => !o)}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o); } }}
      >
        {faq.q} <span className="faq-chevron" aria-hidden="true">▶</span>
      </div>
      {open && <div className="faq-a open">{faq.a}</div>}
    </div>
  );
}

export default function HelpFaq() {
  const [open, setOpen] = useState(false);
  return (
    <div id="helpSection" style={{ marginTop: 8 }}>
      <div
        className="section-title"
        style={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setOpen(o => !o)}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls="helpContent"
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o); } }}
      >
        Help &amp; FAQ{' '}
        <span
          aria-hidden="true"
          style={{ fontSize: 10, color: 'var(--text-muted)', display: 'inline-block', transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'none' }}
        >▶</span>
      </div>
      {open && (
        <div id="helpContent" role="region" aria-label="Help and FAQ">
          <div className="card" style={{ padding: '20px 24px' }}>
            {FAQS.map(faq => <FaqItem key={faq.q} faq={faq} />)}
          </div>
        </div>
      )}
    </div>
  );
}
