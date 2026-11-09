import { DashboardNav } from "./ui/dashboard-nav";
import { Icon } from "./ui/dashboard-icon";

const sensors = [
  { title: "Soil pH", icon: "ph", unit: "pH", scale: ["0", "14"] },
  { title: "Moisture", icon: "droplet", unit: "%", scale: ["0%", "100%"] },
  { title: "Temperature", icon: "temperature", unit: "°C" },
] as const;

export default function Home() {
  return (
    <div className="shell">
      <a className="skip-link" href="#overview">Skip to dashboard</a>
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="SoilSense home">
          <span className="brand-mark"><Icon name="sprout" /></span>
          <span>SoilSense<span className="brand-caption">FIELD WORKSPACE</span></span>
        </a>
        <div className="nav-label">Workspace</div>
        <DashboardNav />
        <div className="sidebar-bottom">
          <div className="field-unit">
            <span className="unit-icon"><Icon name="device" /></span>
            <div><strong>Field unit</strong><span>Awaiting setup</span></div>
            <span className="status-dot" />
          </div>
          <p>SoilSense <span>Research prototype</span></p>
        </div>
      </aside>
      <main id="overview" tabIndex={-1}>
        <header className="topbar">
          <div><Icon name="grid" /><span>Workspace</span><span className="breadcrumb-divider">/</span><strong>Overview</strong></div>
          <span className="prototype-label"><span />Prototype</span>
        </header>
        <div className="dashboard-content">
          <section className="page-heading" aria-labelledby="page-title">
            <div><p className="eyebrow">SOIL MONITORING</p><h1 id="page-title">Soil overview</h1><p>Your latest readings, all in one place.</p></div>
            <a className="text-link" href="#history">View samples <Icon name="arrow" /></a>
          </section>
          <section className="connection" aria-label="Device connection">
            <div className="connection-status"><span className="status-dot" /><span>No device connected</span></div>
            <details className="connection-details">
              <summary>Setup pending <Icon name="chevron" /></summary>
              <p>Device monitoring is not set up yet. Readings will appear here when monitoring is enabled.</p>
            </details>
          </section>
          <section className="measurements" aria-labelledby="measurements-title">
            <div className="section-heading"><h2 id="measurements-title">Latest readings</h2><span>Awaiting a sample</span></div>
            <div className="sensor-grid">
              {sensors.map((sensor) => (
                <article className="sensor-card" key={sensor.title}>
                  <div className="sensor-heading"><h3>{sensor.title}</h3><span className={`sensor-icon ${sensor.icon}`}><Icon name={sensor.icon} /></span></div>
                  <div className="sensor-value"><span aria-label="No reading">--</span><small>{sensor.unit}</small></div>
                  {"scale" in sensor ? <div className="sensor-scale" aria-label={`${sensor.title} scale: ${sensor.scale[0]} to ${sensor.scale[1]}. No reading.`}><div className="scale-track" /><div className="scale-labels"><span>{sensor.scale[0]}</span><span>{sensor.scale[1]}</span></div></div> : <p className="sensor-footnote">Probe temperature</p>}
                </article>
              ))}
              <article className="sensor-card nutrient-card">
                <div className="sensor-heading"><h3>Nutrients</h3><span className="sensor-icon nutrients"><Icon name="layers" /></span></div>
                <div className="nutrient-values" aria-label="Nitrogen, phosphorus, and potassium: no readings">
                  {["N", "P", "K"].map((nutrient) => <div key={nutrient}><span>{nutrient}</span><strong>--</strong></div>)}
                </div>
                <p className="sensor-footnote">Pending reference validation</p>
              </article>
            </div>
            <details className="reading-notes"><summary><Icon name="info" />About these readings<Icon name="chevron" /></summary><p>pH uses a prepared soil-water suspension. Moisture requires soil-specific calibration. NPK readings are provisional until validated against reference measurements.</p></details>
          </section>
          <div className="detail-grid">
            <section className="history-panel panel" id="history" aria-labelledby="history-title">
              <div className="panel-heading"><div><h2 id="history-title">Recent samples <span className="count">0</span></h2><p>Your measurement history.</p></div><Icon name="history" /></div>
              <div className="table-scroll">
                <table>
                  <caption className="sr-only">Recent soil measurements</caption>
                  <thead><tr><th scope="col">Sample</th><th scope="col">Recorded</th><th scope="col">pH</th><th scope="col">Moisture</th></tr></thead>
                  <tbody><tr><td colSpan={4}><div className="empty-state"><div className="sample-illustration" aria-hidden="true"><Icon name="sample" /></div><h3>No samples yet</h3><p>Uploaded readings will appear here.</p></div></td></tr></tbody>
                </table>
              </div>
              <div className="panel-footer"><span className="status-dot" />Waiting for the first upload</div>
            </section>
            <section className="advisor-panel panel" id="advisory" aria-labelledby="advisor-title">
              <div className="advisor-top"><span className="eyebrow">NEXT STEP</span><Icon name="sprout" /></div>
              <div className="soil-illustration" aria-hidden="true">
                <svg viewBox="0 0 240 130" fill="none"><path d="M28 77c27-7 48 7 79 1s58-8 105-1" stroke="currentColor" strokeWidth="1.5"/><path d="M28 94c30-7 51 7 82 1s57-7 102-1M28 111c30-7 52 7 83 1s57-7 101-1" stroke="currentColor" strokeOpacity=".22" strokeWidth="1.5"/><path d="M120 78V46m0 16c-23 0-34-11-34-28 22-1 34 10 34 28Zm0-11c0-21 12-33 33-33 1 21-11 33-33 33Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="m120 78-9 11m9-11 11 13m-11-13v20" stroke="currentColor" strokeOpacity=".5" strokeWidth="1.5" strokeLinecap="round"/><circle cx="51" cy="88" r="1.5" fill="currentColor" opacity=".35"/><circle cx="179" cy="106" r="1.5" fill="currentColor" opacity=".35"/><circle cx="158" cy="88" r="1" fill="currentColor" opacity=".35"/></svg>
              </div>
              <h2 id="advisor-title">Fertilizer advisor</h2>
              <p>Recommendations will be available after model validation.</p>
              <span className="unavailable-label"><span className="status-dot" />Not available yet</span>
            </section>
          </div>
          <footer><span><Icon name="layers" />SoilSense workspace</span><span>Offline samples appear after upload.</span></footer>
        </div>
      </main>
    </div>
  );
}
