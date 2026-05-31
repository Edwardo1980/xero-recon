import { useState } from 'react';
import { fmt } from '../../lib/utils.js';
import TransactionList from './TransactionList.jsx';

export default function AccountRow({ acc }) {
  const [open, setOpen] = useState(false);
  const hasTxs = acc.count > 0;

  const Tag = hasTxs ? 'button' : 'div';
  return (
    <>
      <Tag
        type={hasTxs ? 'button' : undefined}
        className={`table-row${hasTxs ? ' acc-row-toggle' : ''}`}
        aria-expanded={hasTxs ? open : undefined}
        aria-label={hasTxs ? `Toggle transactions for ${acc.name}` : undefined}
        onClick={hasTxs ? () => setOpen(o => !o) : undefined}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={`acc-chevron${open ? ' open' : ''}`} aria-hidden="true">
            {hasTxs ? '▶' : ''}
          </span>
          <div>
            <div className="acc-name">{acc.name}</div>
            <div className="acc-code">{acc.code}</div>
          </div>
        </div>
        <div className="col-code" style={{ fontSize: 11, color: 'var(--text-dim)' }}>{acc.currency}</div>
        <div>
          <span
            className={`tag ${acc.count === 0 ? 'clear' : 'pending'}`}
            aria-label={acc.count === 0 ? 'Reconciled' : `${acc.count} pending`}
          >
            {acc.count === 0 ? '✓' : acc.count}
          </span>
        </div>
        <div className="amount" style={{ color: acc.count > 0 ? 'var(--warn)' : 'var(--accent)' }}>
          {fmt(acc.total, acc.currency)}
        </div>
      </Tag>
      {hasTxs && open && <TransactionList acc={acc} />}
    </>
  );
}
