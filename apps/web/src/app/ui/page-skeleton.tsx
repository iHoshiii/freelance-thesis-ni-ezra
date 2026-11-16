import type { CSSProperties } from "react";

function Bone({ width = "100%", tall = false }: { width?: string; tall?: boolean }) {
  return <span className={`skeleton-bone${tall ? " skeleton-value" : ""}`} style={{ "--bone-width": width } as CSSProperties} />;
}
function Metrics({ count = 3 }: { count?: number }) {
  return <div className="skeleton-metrics">{Array.from({ length: count }, (_, index) => <div key={index}><Bone width="65%" /><Bone width="45%" tall /></div>)}</div>;
}
function Card({ rows = 3 }: { rows?: number }) {
  return <div className="panel skeleton-card"><Bone width="38%" />{Array.from({ length: rows }, (_, index) => <Bone key={index} width={index % 2 ? "75%" : "90%"} />)}</div>;
}

export function PageSkeleton({ title = "Overview" }: { title?: string }) {
  return <div className={`page-skeleton skeleton-${title.toLowerCase()}`} role="status" aria-label={`Loading ${title}`}>
    <span className="sr-only">Loading {title}. Please wait.</span>
    <div className="skeleton-layout" aria-hidden="true">
      {title === "Overview" ? <><div className="skeleton-summary">{[0, 1, 2].map((key) => <div className="skeleton-card" key={key}><Bone width="60%" /><Bone width="35%" tall /></div>)}</div><div className="panel skeleton-card"><Bone width="28%" /><Metrics /></div><Card rows={1} /></>
        : title === "Scans" ? <><div className="panel skeleton-card"><Bone width="20%" /><Metrics count={4} /></div><div className="skeleton-chips"><Bone width="90px" /><Bone width="90px" /><Bone width="70px" /></div><div className="panel skeleton-table"><Bone width="25%" /><div className="skeleton-table-head"><Bone /></div>{[0, 1, 2, 3, 4].map((key) => <div className="skeleton-table-row" key={key}><Bone width="42%" /><Bone width="25%" /><Bone width="15%" /></div>)}</div></>
        : title === "Recommendations" ? <div className="skeleton-guidance">{[0, 1, 2, 3].map((key) => <Card key={key} rows={1} />)}</div>
        : title === "Statistics" ? <><div className="skeleton-chips"><Bone width="170px" /><Bone width="170px" /></div><div className="panel skeleton-card skeleton-statistics"><div className="skeleton-chips"><Bone width="50px" /><Bone width="65px" /><Bone width="80px" /></div><Metrics />{[0, 1, 2, 3, 4].map((key) => <div className="skeleton-chart-row" key={key}><Bone width="80px" /><Bone width={`${90 - key * 12}%`} /></div>)}</div></>
        : title === "Status" ? <><div className="panel skeleton-card"><Bone width="25%" /><Metrics /></div><div className="panel skeleton-card"><Bone width="35%" /><Metrics /><div className="skeleton-sensors">{[0, 1, 2, 3].map((key) => <Bone key={key} width="85%" />)}</div><Bone width="60%" /></div></>
        : <><Card /><Card rows={5} /></>}
    </div>
  </div>;
}
