const sensors = [
  { title: "Soil pH", unit: "pH", note: "Prepared soil-water suspension" },
  { title: "Soil moisture", unit: "%", note: "Requires soil-specific calibration" },
  { title: "Soil temperature", unit: "°C", note: "DS18B20 probe" },
  { title: "NPK-related readings", unit: "Provisional", note: "Pending reference validation" },
];

export default function Home() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <a className="brand" href="#overview"><span className="brand-icon" aria-hidden="true">↗</span> SoilSense<span className="brand-sub">RESEARCH PROTOTYPE</span></a>
        <nav aria-label="Dashboard sections">
          <a href="#overview">Overview <span>01</span></a>
          <a href="#history">Measurement history <span>02</span></a>
          <a href="#advisory">Compatibility advisor <span>03</span></a>
        </nav>
        <div className="sidebar-note">FIELD TO INSIGHT<p>A browser interface for your multi-sensor soil analyzer.</p></div>
      </aside>
      <main id="overview">
        <header className="topbar"><span>Workspace / Soil monitoring</span><span className="badge">Development starter</span></header>
        <section className="intro"><p className="eyebrow">SOIL MONITORING</p><h1>Know your soil.<br /><span>Start with the measurements.</span></h1><p>Track uploaded samples, review measurement history, and prepare for informed fertilizer decisions.</p></section>
        <section className="connection" aria-label="Device connection"><div><span className="status-dot" /> Device integration pending<p>Readings will appear after account and database integration.</p></div><span className="badge">Awaiting setup</span></section>
        <div className="section-label"><h2>Latest measurements</h2><span>Acquisition time: unavailable</span></div>
        <section className="sensor-grid" aria-label="Latest sensor readings">{sensors.map((sensor, index) => <article className="sensor-card" key={sensor.title}><div className="sensor-heading"><h3>{sensor.title}</h3><span>0{index + 1}</span></div><div className="sensor-value">— <small>{sensor.unit}</small></div><p>{sensor.note}</p></article>)}</section>
        <div className="detail-grid">
          <section className="panel" id="history"><p className="eyebrow">MEASUREMENT HISTORY</p><h2>Your samples will appear here.</h2><div className="empty-lines" aria-hidden="true"><span /><span /><span /></div><p>Historical records will show sample identifiers, acquisition time quality, and server receipt time after database and account integration.</p></section>
          <section className="panel advisory" id="advisory"><p className="eyebrow">FERTILIZER COMPATIBILITY</p><h2>Good advice starts<br />with validated data.</h2><p>The advisor is awaiting study data, a trained model, and evaluation. No fertilizer recommendation is available yet.</p><span className="badge">Model not configured</span></section>
        </div>
        <footer>Offline device recordings become visible after upload. <span>Prototype · No physical device screen</span></footer>
      </main>
    </div>
  );
}
