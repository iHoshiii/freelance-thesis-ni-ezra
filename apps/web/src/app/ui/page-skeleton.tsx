import type { CSSProperties } from "react";

function Bone({ width = "100%", tall = false }: { width?: string; tall?: boolean }) {
  return <span className={`skeleton-bone${tall ? " skeleton-value" : ""}`} style={{ "--bone-width": width } as CSSProperties} />;
}
function Metrics({ count = 3 }: { count?: number }) {
  return <div className="skeleton-metrics">{Array.from({ length: count }, (_, index) => <div key={index}><Bone width="75px" /><Bone width="50px" tall /></div>)}</div>;
}
function Card({ rows = 3 }: { rows?: number }) {
  return <div className="panel skeleton-card"><Bone width="38%" />{Array.from({ length: rows }, (_, index) => <Bone key={index} width={index % 2 ? "75%" : "90%"} />)}</div>;
}
function Device({ sensors = false }: { sensors?: boolean }) {
  return <div className="skeleton-section"><Bone width="120px" /><Metrics />{sensors && <div className="skeleton-sensors">{[0, 1, 2, 3].map((key) => <div key={key}><Bone width="40%" /><Bone width="12%" /></div>)}</div>}</div>;
}

export function PageSkeleton({ title = "Overview" }: { title?: string }) {
  return <div className={`page-skeleton skeleton-${title.toLowerCase()}`} role="status" aria-label={`Loading ${title}`}>
    <span className="sr-only">Loading {title}. Please wait.</span>
    <div className="skeleton-layout" aria-hidden="true">
      {title === "Overview" ? <><div className="skeleton-summary">{[0, 1, 2].map((key) => <div className="skeleton-card" key={key}><Bone width="70px" /><Bone width="42px" tall /></div>)}</div><div className="overview-workspace"><div className="overview-device-card"><Device /><div className="skeleton-latest"><Bone width="65px" /><Bone width="110px" /><Bone width="65px" /></div></div></div></>
        : title === "Scans" ? <><div className="panel skeleton-card"><Bone width="20%" /><Metrics count={4} /></div><div className="skeleton-chips"><Bone width="90px" /><Bone width="90px" /><Bone width="70px" /></div><div className="panel skeleton-table"><Bone width="25%" /><div className="skeleton-table-head"><Bone /></div>{[0, 1, 2, 3, 4].map((key) => <div className="skeleton-table-row" key={key}><Bone width="42%" /><Bone width="25%" /><Bone width="15%" /></div>)}</div></>
        : title === "Recommendations" ? <div className="guidance-grid recommendations skeleton-recommendations">{[0, 1, 2, 3].map((key) => <div className="recommendation-row" key={key}><Bone width="95px" /><Bone width="55px" tall /><Bone width="65%" /></div>)}</div>
        : title === "Statistics" ? <><div className="skeleton-chips"><Bone width="170px" /><Bone width="170px" /><Bone width="60px" /></div><div className="skeleton-section skeleton-statistics"><div className="skeleton-chips"><Bone width="50px" /><Bone width="65px" /><Bone width="80px" /></div><Metrics />{[0, 1, 2, 3, 4].map((key) => <div className="skeleton-chart-row" key={key}><Bone width="80px" /><Bone width={`${90 - key * 12}%`} /></div>)}</div></>
        : title === "Status" ? <><div className="skeleton-section"><Bone width="100px" /><div className="skeleton-connections">{[0, 1, 2].map((key) => <div key={key}><Bone width="40%" /><Bone width="25%" /></div>)}</div></div><div className="panel skeleton-status-device"><div className="skeleton-status-model"><Bone width="60%" tall /></div><Device sensors /></div></>
        : <><Card /><Card rows={5} /></>}
    </div>
  </div>;
}
