import { useEffect, useRef } from 'react';
import { fmt } from '../../lib/utils.js';

function AnimatedCount({ value }) {
  const ref    = useRef(null);
  const prevRef = useRef(0);

  useEffect(() => {
    const to   = value;
    const from = prevRef.current;
    prevRef.current = to;
    if (from === to || !ref.current) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) { ref.current.textContent = to; return; }

    const dur   = 550;
    let start   = null;
    const step  = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const v = from + (to - from) * (1 - Math.pow(1 - p, 3));
      ref.current.textContent = Math.round(v);
      if (p < 1) requestAnimationFrame(step);
      else ref.current.textContent = to;
    };
    requestAnimationFrame(step);
  }, [value]);

  return <span ref={ref}>{value}</span>;
}

export default function StatGrid({ data }) {
  const allClear    = data.totalUnreconciled === 0;
  const pendingAccs = data.accounts.filter(a => a.count > 0).length;

  return (
    <>
      <div className="section-title">Overview — {data.tenantName}</div>
      <div className="stats-row" role="list" aria-label="Summary statistics">
        <div className={`stat ${allClear ? 'green' : 'warn'}`} role="listitem">
          <div className="stat-val"><AnimatedCount value={data.totalUnreconciled} /></div>
          <div className="stat-lbl">Unreconciled txns</div>
        </div>
        <div className="stat blue" role="listitem">
          <div className="stat-val" style={{ fontSize: 20 }}>{fmt(data.totalValue, data.currency)}</div>
          <div className="stat-lbl">Outstanding value</div>
        </div>
        <div className={`stat ${pendingAccs > 0 ? 'warn' : 'green'}`} role="listitem">
          <div className="stat-val"><AnimatedCount value={pendingAccs} /></div>
          <div className="stat-lbl">Accounts pending</div>
        </div>
      </div>
    </>
  );
}
