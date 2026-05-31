import { useEffect, useRef } from 'react';
import { fmt } from '../../lib/utils.js';

const REDUCED_MOTION_MQ = window.matchMedia('(prefers-reduced-motion: reduce)');

function AnimatedCount({ value }) {
  const ref    = useRef(null);
  const prevRef = useRef(0);

  useEffect(() => {
    const to   = value;
    const from = prevRef.current;
    prevRef.current = to;
    if (from === to || !ref.current) return;

    if (REDUCED_MOTION_MQ.matches) { ref.current.textContent = to; return; }

    const dur    = 550;
    let start    = null;
    let rafId;
    let active   = true;
    const step   = ts => {
      if (!active || !ref.current) return;
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const v = from + (to - from) * (1 - Math.pow(1 - p, 3));
      ref.current.textContent = Math.round(v);
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
        <div className={`stat ${allClear ? 'green' : 'warn'}`} role="listitem" aria-label={`${data.totalUnreconciled} unreconciled transaction${data.totalUnreconciled !== 1 ? 's' : ''}`}>
          <div className="stat-val" aria-hidden="true"><AnimatedCount value={data.totalUnreconciled} /></div>
          <div className="stat-lbl" aria-hidden="true">Unreconciled</div>
        </div>
        <div className="stat blue" role="listitem" aria-label={`Outstanding value: ${fmt(data.totalValue, data.currency)}`}>
          <div className="stat-val" style={{ fontSize: 20 }} aria-hidden="true">{fmt(data.totalValue, data.currency)}</div>
          <div className="stat-lbl" aria-hidden="true">Outstanding</div>
        </div>
        <div className={`stat ${pendingAccs > 0 ? 'warn' : 'green'}`} role="listitem" aria-label={`${pendingAccs} account${pendingAccs !== 1 ? 's' : ''} needing attention`}>
          <div className="stat-val" aria-hidden="true"><AnimatedCount value={pendingAccs} /></div>
          <div className="stat-lbl" aria-hidden="true">Needs attention</div>
        </div>
      </div>
    </>
  );
}
