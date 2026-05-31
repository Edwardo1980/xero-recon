import { useState } from 'react';
import { fmt, parseXeroDate } from '../../lib/utils.js';

const MAX_SHOW = 30;

export default function TransactionList({ acc }) {
  const [search, setSearch] = useState('');

  const q    = search.toLowerCase();
  const txs  = acc.transactions ?? [];
  // Filter all transactions first, then cap; searching only a slice would miss results
  const base     = q ? txs.filter(tx =>
    (tx.Contact?.Name ?? '').toLowerCase().includes(q) ||
    (tx.Reference ?? '').toLowerCase().includes(q) ||
    parseXeroDate(tx.Date).toLowerCase().includes(q)
  ) : txs;
  const filtered = base.slice(0, MAX_SHOW);

  const xeroUrl = `https://go.xero.com/Bank/Reconcile.aspx?accountID=${encodeURIComponent(acc.id)}`;

  return (
    <div className="tx-list">
      {/* Toolbar: search + Xero deep link */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            className="tx-search"
            type="search"
            placeholder="Search these transactions…"
            aria-label={`Search transactions for ${acc.name}`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%' }}
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px 4px', fontSize: 14, lineHeight: 1 }}
            >
              ×
            </button>
          )}
        </div>
        <a
          href={xeroUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: 10, whiteSpace: 'nowrap', width: 'auto' }}
          aria-label={`Open ${acc.name} in Xero to reconcile`}
        >
          Open in Xero →
        </a>
      </div>

      {/* Column headers */}
      <div className="tx-header">
        <div />
        <div>Contact</div>
        <div>Reference</div>
        <div>Date</div>
        <div style={{ textAlign: 'right' }}>Amount</div>
      </div>

      {/* Rows */}
      {filtered.length === 0 && (
        <div className="tx-more">
          {q
            ? <>No transactions matching &ldquo;{search}&rdquo; — <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)', padding: 0, font: 'inherit', fontSize: 'inherit' }}>clear search</button></>
            : 'No transactions found.'}
        </div>
      )}
      {filtered.map((tx, i) => {
        const isIn = tx.Type === 'RECEIVE' || tx.Type === 'RECEIVECREDIT';
        return (
          <div key={tx.BankTransactionID ?? i} className="tx-item">
            <span className={`tx-badge ${isIn ? 'in' : 'out'}`} aria-label={isIn ? 'Money in' : 'Money out'}>
              {isIn ? 'IN' : 'OUT'}
            </span>
            <span className="tx-contact">{tx.Contact?.Name || '—'}</span>
            <span className="tx-ref">{tx.Reference || tx.LineItems?.[0]?.Description || '—'}</span>
            <span className="tx-date">{parseXeroDate(tx.Date)}</span>
            <span className="tx-amount" style={{ color: isIn ? 'var(--accent)' : 'var(--warn)' }}>
              {isIn ? '+' : '-'}{fmt(Math.abs(tx.Total || 0), acc.currency)}
            </span>
          </div>
        );
      })}

      {/* "More" note */}
      {base.length > MAX_SHOW && (
        <div className="tx-more">
          Showing {MAX_SHOW} of {base.length}{q ? ' matching' : ''} —{' '}
          <a href={xeroUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)' }}>
            open Xero to see all
          </a>
        </div>
      )}
    </div>
  );
}
