import { useEffect, useRef } from 'react';
import { fmt } from '../../lib/utils.js';
import { Card } from '../ui/card.jsx';

const REDUCED_MOTION_MQ = window.matchMedia('(prefers-reduced-motion: reduce)');

function AnimatedCount({ value }) {
  const ref     = useRef(null);
  const prevRef = useRef(0);
  useEffect(() => {
    const to = value, from = prevRef.current;
    prevRef.current = to;
    if (from === to || !ref.current) return;
    if (REDUCED_MOTION_MQ.matches) { ref.current.textContent = to; return; }
    const dur = 550; let start = null, rafId, active = true;
    const step = ts => {
      if (!active || !ref.current) return;
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      ref.current.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) { rafId = requestAnimationFrame(step); }
      else { ref.current.textContent = to; }
    };
    rafId = requestAnimationFrame(step);
    return () => { active = false; cancelAnimationFrame(rafId); };
  }, [value]);
  return <span ref={ref}>{value}</span>;
}

export default function StatGrid({ data }) {
  const allClear    = data.totalUnreconciled === 0;
  const pendingAccs = data.accounts.filter(a => a.count > 0).length;

  return (
    <>
      <div className="section-header">
        <div className="section-title">{data.tenantName}</div>
      </div>
      <div className="stats-row" role="list" aria-label="Summary statistics">
        <Card role="listitem" className={['text-center', allClear ? 'border-[rgba(0,229,160,0.2)] bg-[rgba(0,229,160,0.04)]' : 'border-[rgba(255,112,67,0.2)] bg-[rgba(255,112,67,0.04)]'].join(' ')} aria-label={`${data.totalUnreconciled} unreconciled`}>
          <div className={['font-mono text-4xl font-bold mb-1 tabular-nums', allClear ? 'text-[var(--color-primary)]' : 'text-[var(--color-warn)]'].join(' ')} aria-hidden="true">
            <AnimatedCount value={data.totalUnreconciled} />
          </div>
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--color-dim)]">Unreconciled</div>
        </Card>

        <Card role="listitem" className="text-center border-[rgba(56,189,248,0.15)] bg-[rgba(56,189,248,0.03)]" aria-label={`Outstanding: ${fmt(data.totalValue, data.currency)}`}>
          <div className="font-mono text-2xl font-bold mb-1 text-[var(--color-info)]" aria-hidden="true">{fmt(data.totalValue, data.currency)}</div>
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--color-dim)]">Outstanding</div>
        </Card>

        <Card role="listitem" className={['text-center', pendingAccs > 0 ? 'border-[rgba(255,112,67,0.2)] bg-[rgba(255,112,67,0.04)]' : 'border-[rgba(0,229,160,0.2)] bg-[rgba(0,229,160,0.04)]'].join(' ')} aria-label={`${pendingAccs} accounts needing attention`}>
          <div className={['font-mono text-4xl font-bold mb-1 tabular-nums', pendingAccs > 0 ? 'text-[var(--color-warn)]' : 'text-[var(--color-primary)]'].join(' ')} aria-hidden="true">
            <AnimatedCount value={pendingAccs} />
          </div>
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--color-dim)]">Accounts pending</div>
        </Card>
      </div>
    </>
  );
}
