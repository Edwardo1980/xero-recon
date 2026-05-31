import { useMemo, useState } from 'react';
import { fmt } from '../../lib/utils.js';
import AccountRow from './AccountRow.jsx';

function sortAccounts(accounts, col, dir) {
  return [...accounts].sort((a, b) => {
    const va = col === 'name' ? a.name.toLowerCase() : col === 'pending' ? a.count : Math.abs(a.total);
    const vb = col === 'name' ? b.name.toLowerCase() : col === 'pending' ? b.count : Math.abs(b.total);
    if (va < vb) return dir === 'asc' ? -1 : 1;
    if (va > vb) return dir === 'asc' ?  1 : -1;
    return 0;
  });
}

function SortTh({ col, label, sortCol, sortDir, onSort, style }) {
  const active = sortCol === col;
  const arrow  = active ? (sortDir === 'asc' ? '↑' : '↓') : '⇅';
  const ariaSort = active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none';
  return (
    <div role="columnheader" style={style} aria-sort={ariaSort}>
      <button
        type="button"
        className="sort-th"
        onClick={() => onSort(col)}
        aria-label={`Sort by ${label}${active ? `, currently ${ariaSort}` : ''}`}
      >
        {label} <span className={`sort-arrow${active ? ' active' : ''}`} aria-hidden="true">{arrow}</span>
      </button>
    </div>
  );
}

export default function AccountsTable({ accounts, currency }) {
  const [sortCol,       setSortCol]       = useState('pending');
  const [sortDir,       setSortDir]       = useState('desc');
  const [filterPending, setFilterPending] = useState(false);

  const onSort = col => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir(col === 'name' ? 'asc' : 'desc'); }
  };

  const pendingCnt = useMemo(() => accounts.filter(a => a.count > 0).length, [accounts]);

  const displayed = useMemo(() => sortAccounts(
    filterPending ? accounts.filter(a => a.count > 0) : accounts,
    sortCol, sortDir
  ), [accounts, filterPending, sortCol, sortDir]);

  const { totalPending, totalAmt } = useMemo(() => ({
    totalPending: displayed.reduce((s, a) => s + a.count,  0),
    totalAmt:     displayed.reduce((s, a) => s + a.total, 0),
  }), [displayed]);

  return (
    <>
      <div className="section-title">Bank Accounts</div>

      {/* Filter controls */}
      <div className="table-controls">
        <button
          type="button"
          className={`filter-pill${filterPending ? ' active' : ''}`}
          onClick={() => setFilterPending(f => !f)}
          aria-pressed={filterPending}
        >
          {filterPending ? '● Pending only' : '○ All accounts'}
        </button>
        {pendingCnt > 0 && (
          <span className="filter-count">
            {pendingCnt} account{pendingCnt !== 1 ? 's' : ''} with pending items
          </span>
        )}
      </div>

      <div className="table-wrap" role="table" aria-label="Bank account reconciliation status">
        <div className="table-head" role="row">
          <SortTh col="name"    label="Account"  sortCol={sortCol} sortDir={sortDir} onSort={onSort} />
          <div role="columnheader" className="col-code">Currency</div>
          <SortTh col="pending" label="Pending"  sortCol={sortCol} sortDir={sortDir} onSort={onSort} />
          <SortTh col="amount"  label="Amount"   sortCol={sortCol} sortDir={sortDir} onSort={onSort} style={{ textAlign: 'right' }} />
        </div>

        {displayed.length === 0 ? (
          <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
            {filterPending
              ? <>All accounts reconciled — nothing pending.{' '}
                  <button type="button" className="filter-pill" style={{ display: 'inline-flex', marginTop: 8 }} onClick={() => setFilterPending(false)}>Show all</button>
                </>
              : 'No bank accounts found. Make sure your Xero organisation has active bank accounts.'}
          </div>
        ) : (
          <>
            {displayed.map(acc => <AccountRow key={acc.id} acc={acc} />)}
            {displayed.length > 1 && (
              <div className="table-total">
                <div style={{ color: 'var(--text-dim)', fontSize: 11 }}>Total ({displayed.length} accounts)</div>
                <div className="col-code" />
                <div>
                  <span
                    className={`tag ${totalPending === 0 ? 'clear' : 'pending'}`}
                    aria-label={totalPending === 0 ? 'All reconciled' : `${totalPending} pending`}
                  >
                    {totalPending === 0 ? '✓' : totalPending}
                  </span>
                </div>
                <div className="amount" style={{ color: totalPending > 0 ? 'var(--warn)' : 'var(--accent)' }}>
                  {fmt(totalAmt, currency)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
