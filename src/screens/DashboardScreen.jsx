import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '../lib/store.js';
import { useReconciliation, useForceRefresh } from '../hooks/useReconciliation.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { parseXeroDate, translateError } from '../lib/utils.js';
import StatGrid from '../components/dashboard/StatGrid.jsx';
import AccountsTable from '../components/dashboard/AccountsTable.jsx';
import HelpFaq from '../components/dashboard/HelpFaq.jsx';
import SkeletonDashboard from '../components/ui/SkeletonDashboard.jsx';
import Notice from '../components/ui/Notice.jsx';

function exportCSV(data) {
  const rows = [['Account', 'Code', 'Currency', 'Pending Transactions', 'Outstanding Amount']];
  data.accounts.forEach(acc => rows.push([acc.name, acc.code, acc.currency, acc.count, acc.total.toFixed(2)]));
  rows.push([]);
  rows.push(['', 'Transaction Detail']);
  rows.push(['Account', 'Type', 'Contact', 'Reference', 'Date', 'Amount']);
  data.accounts.forEach(acc =>
    (acc.transactions ?? []).forEach(tx => {
      rows.push([acc.name, tx.Type, tx.Contact?.Name ?? '', tx.Reference ?? '', parseXeroDate(tx.Date), (tx.Total ?? 0).toFixed(2)]);
    })
  );
  rows.push([]);
  rows.push(['Export date', new Date().toISOString(), '', 'Organisation', data.tenantName]);

  // UTF-8 BOM ensures Excel on Windows reads accented characters correctly
  const csv  = '﻿' + rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: `xero-reconciliation-${new Date().toISOString().slice(0,10)}.csv` });
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function DashboardScreen() {
  const navigate      = useNavigate();
  const toast         = useToast();
  const forceRefresh  = useForceRefresh();
  const { tenantName, clearTokens, allConnections } = useAuthStore(useShallow(s => ({
    tenantName: s.tenantName, clearTokens: s.clearTokens, allConnections: s.allConnections,
  })));

  const { data, isLoading, isError, error, dataUpdatedAt } = useReconciliation();
  usePageTitle(data?.tenantName ?? tenantName ?? 'Dashboard');

  // Handle auth errors
  useEffect(() => {
    if (isError && error?.message === 'NOT_AUTHENTICATED') {
      clearTokens();
      navigate('/connect');
      toast('Your session expired — please reconnect.', 'error');
    }
    if (isError && error?.message === 'NO_TENANT') {
      navigate('/org-select');
    }
  }, [isError, error, clearTokens, navigate, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey) return;
      if ((e.key === 'r' || e.key === 'R') && !isLoading) { e.preventDefault(); forceRefresh(); toast('Refreshing…', 'info', 1500); }
      if ((e.key === 'e' || e.key === 'E') && data)       { e.preventDefault(); exportCSV(data); toast('CSV exported', 'success'); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [data, isLoading, forceRefresh, toast]);

  const [disconnectConfirm, setDisconnectConfirm] = useState(false);
  const disconnectTimerRef = useRef(null);
  useEffect(() => () => clearTimeout(disconnectTimerRef.current), []);
  const onDisconnect = () => {
    if (!disconnectConfirm) {
      setDisconnectConfirm(true);
      disconnectTimerRef.current = setTimeout(() => setDisconnectConfirm(false), 4000);
    } else {
      useAuthStore.getState().clearAll();
      navigate('/connect');
      toast('Disconnected from Xero', 'info');
    }
  };

  const [, tick] = useState(0);
  useEffect(() => {
    if (!dataUpdatedAt) return;
    const id = setInterval(() => tick(n => n + 1), 30_000);
    return () => clearInterval(id);
  }, [dataUpdatedAt]);

  let lastUpdated = '—';
  if (dataUpdatedAt) {
    const secs = Math.floor((Date.now() - dataUpdatedAt) / 1000);
    lastUpdated = secs < 60 ? `Updated ${secs}s ago` : `Updated ${Math.floor(secs / 60)}m ago`;
  }

  return (
    <div className="screen active">
      <div id="dashContent" aria-live="polite">
        {isLoading && <SkeletonDashboard />}

        {isError && error?.message !== 'NOT_AUTHENTICATED' && error?.message !== 'NO_TENANT' && (
          <>
            <Notice type="warn">{translateError(error?.message)}</Notice>
            <div style={{ marginTop: 12 }}>
              <button type="button" className="btn btn-secondary" onClick={() => forceRefresh()} style={{ width: 'auto', padding: '10px 20px' }}>
                Try again
              </button>
            </div>
          </>
        )}

        {data && (
          <>
            <StatGrid data={data} />
            <AccountsTable accounts={data.accounts} currency={data.currency} />
            {data.totalUnreconciled === 0
              ? <Notice type="success">All bank accounts are fully reconciled — nothing outstanding.</Notice>
              : <Notice type="info">
                  To reconcile in Xero: go to <strong>Accounting → Bank Accounts</strong> and click <strong>Reconcile</strong> next to each pending account. Expand any row above to view and deep-link directly into Xero.
                </Notice>
            }
          </>
        )}
      </div>

      <HelpFaq />

      {/* Footer bar */}
      <div className="dash-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className="last-sync" aria-live="polite">{lastUpdated}</span>
          {allConnections.length > 1 && (
            <button
              type="button"
              className="org-badge"
              onClick={() => navigate('/org-select')}
              aria-label={`Current org: ${tenantName ?? ''}. Click to switch.`}
            >
              {tenantName} ▾
            </button>
          )}
          <span className="kbd-hint" aria-hidden="true">
            <kbd>R</kbd> refresh · <kbd>E</kbd> export
          </span>
        </div>
        <div className="btn-row">
          <button
            type="button"
            className={`btn btn-secondary${isLoading ? ' btn-loading' : ''}`}
            style={{ padding: '8px 14px', fontSize: 11 }}
            onClick={() => { forceRefresh(); toast('Refreshing…', 'info', 1500); }}
            disabled={isLoading}
            aria-label="Refresh data"
          >
            {isLoading ? 'Refreshing…' : '↺ Refresh'}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ fontSize: 11, padding: '8px 14px' }}
            onClick={() => { if (data) { exportCSV(data); toast('CSV exported', 'success'); } else toast('No data to export yet — refresh first.', 'info'); }}
            aria-label="Export reconciliation data as CSV"
          >
            Export CSV
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ color: disconnectConfirm ? 'var(--warn)' : undefined, borderColor: disconnectConfirm ? 'rgba(255,112,67,0.4)' : undefined }}
            onClick={onDisconnect}
            aria-label="Disconnect from Xero"
          >
            {disconnectConfirm ? 'Confirm disconnect' : 'Disconnect'}
          </button>
        </div>
      </div>
    </div>
  );
}


