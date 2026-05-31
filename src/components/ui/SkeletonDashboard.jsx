export default function SkeletonDashboard() {
  return (
    <div aria-busy="true" aria-label="Loading reconciliation data">
      <div className="section-title">Overview</div>
      <div className="stats-row">
        {[0,1,2].map(i => <div key={i} className="skeleton-box skeleton-stat" />)}
      </div>
      <div className="section-title">Bank Accounts</div>
      <div className="table-wrap" style={{ padding: 4 }}>
        {[0,1,2,3].map(i => (
          <div key={i} className="table-row skeleton-row">
            <div className="skeleton-box" style={{ width: '100%', height: '100%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
