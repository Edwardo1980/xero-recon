import { Skeleton } from './skeleton.jsx';

export default function SkeletonDashboard() {
  return (
    <div aria-busy="true" aria-label="Loading reconciliation data" className="space-y-6">
      <div className="section-title">Overview</div>
      <div className="stats-row">
        {[0,1,2].map(i => <Skeleton key={i} className="h-28" />)}
      </div>
      <div className="section-title">Bank Accounts</div>
      <div className="table-wrap">
        {[0,1,2,3].map(i => <Skeleton key={i} className="h-14 m-2 rounded-lg" />)}
      </div>
    </div>
  );
}
