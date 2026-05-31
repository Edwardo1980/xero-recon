import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function OrgPickerScreen() {
  usePageTitle('Select Organisation');
  const navigate            = useNavigate();
  const { allConnections, setTenant } = useAuthStore(s => ({ allConnections: s.allConnections, setTenant: s.setTenant }));
  const toast               = useToast();
  const [selected, setSelected] = useState(allConnections[0]?.tenantId ?? null);

  const onSelect = () => {
    const conn = allConnections.find(c => c.tenantId === selected);
    if (!conn) return;
    setTenant(conn.tenantId, conn.tenantName);
    toast(`Switched to ${conn.tenantName}`, 'success');
    navigate('/dashboard');
  };

  return (
    <div className="screen active">
      <div className="card">
        <div className="card-glow" aria-hidden="true" />
        <h2>Select Organisation</h2>
        <p>Your Xero account has access to multiple organisations. Select the one you want to reconcile.</p>

        <div className="org-list" role="listbox" aria-label="Xero organisations">
          {allConnections.map(conn => (
            <div
              key={conn.tenantId}
              className={`org-item${selected === conn.tenantId ? ' selected' : ''}`}
              role="option"
              aria-selected={selected === conn.tenantId}
              onClick={() => setSelected(conn.tenantId)}
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(conn.tenantId); } }}
            >
              <div className="org-item-icon" aria-hidden="true">🏢</div>
              <div>
                <div className="org-item-name">{conn.tenantName}</div>
                <div className="org-item-id">{conn.tenantId}</div>
              </div>
              <span className="org-item-check" aria-hidden="true">✓</span>
            </div>
          ))}
        </div>

        <button type="button" className="btn btn-primary" onClick={onSelect} disabled={!selected}>
          Continue →
        </button>
      </div>
    </div>
  );
}
