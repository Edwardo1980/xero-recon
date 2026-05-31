import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '../lib/store.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { Card } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { cn } from '@/lib/utils';

export default function OrgPickerScreen() {
  usePageTitle('Select Organisation');
  const navigate = useNavigate();
  const { allConnections, setTenant } = useAuthStore(useShallow(s => ({ allConnections: s.allConnections, setTenant: s.setTenant })));
  const toast    = useToast();
  const [selected, setSelected] = useState(allConnections[0]?.tenantId ?? null);

  if (!allConnections.length) return <Navigate to="/connect" replace />;

  const onSelect = () => {
    const conn = allConnections.find(c => c.tenantId === selected);
    if (!conn) return;
    setTenant(conn.tenantId, conn.tenantName);
    toast(`Switched to ${conn.tenantName}`, 'success');
    navigate('/dashboard');
  };

  return (
    <div className="screen active flex justify-center">
      <div className="w-full max-w-lg">
        <Card className="relative overflow-hidden">
          <div className="card-glow" aria-hidden="true" />
          <h2 className="text-xl font-bold mb-2">Select Organisation</h2>
          <p className="text-sm text-[var(--color-muted)] mb-2 leading-relaxed">Your Xero account has access to multiple organisations. Select the one you want to reconcile.</p>

          <div className="org-list" role="listbox" aria-label="Xero organisations" aria-activedescendant={selected ? `org-${selected}` : undefined}>
            {allConnections.map(conn => (
              <div
                key={conn.tenantId}
                id={`org-${conn.tenantId}`}
                className={cn('org-item', selected === conn.tenantId && 'selected')}
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

          <Button type="button" className="w-full mt-4" onClick={onSelect} disabled={!selected}>Continue →</Button>
        </Card>
      </div>
    </div>
  );
}
