"use client";

import { useState } from "react";
import { Icon } from "./dashboard-icon";

const steps = [
  { title: "Database", text: "Add your PostgreSQL connection strings to .env.", code: "DATABASE_URL=…\nDIRECT_URL=…" },
  { title: "Prepare tables", text: "Run these commands from apps/web.", code: "npm run db:setup\nnpm run db:generate\nnpm run db:check" },
  { title: "Register device", text: "Save the token file. Give your device this ID and token.", code: 'npm run device:provision -- soil-001 "Field unit" "$env:TEMP/soil-001.token"' },
  { title: "Choose devices", text: "Add the device ID to .env, then restart the app. Separate multiple IDs with commas.", code: "WORKSPACE_DEVICE_IDS=soil-001" },
  { title: "First upload", text: "The device sends scans to POST /api/readings with its token. To send a prepared scan:", code: 'npm run device:upload -- "$env:TEMP/soil-001.token" ./scan.json' },
];

export function SetupGuide({ checks }: { checks: { label: string; done: boolean }[] }) {
  const [step, setStep] = useState(0);
  return <div className="setup-workspace">
    <section className="panel setup-checks"><div className="panel-heading"><h2>Checklist</h2><span className="subtle-tag">{checks.filter((check) => check.done).length} / {checks.length}</span></div>{checks.map((check, index) => <div className="setup-check" key={check.label}><span className={`check-symbol ${check.done ? "complete" : ""}`}>{check.done ? <Icon name="check" /> : index + 1}</span><h3>{check.label}</h3></div>)}</section>
    <section className="panel setup-guide"><div className="step-tabs" role="group" aria-label="Setup steps">{steps.map((item, index) => <button key={item.title} aria-label={`Step ${index + 1}: ${item.title}`} aria-pressed={step === index} onClick={() => setStep(index)}>{index + 1}<span>{item.title}</span></button>)}</div>
      <div className="step-content" aria-live="polite"><span className="muted">Step {step + 1} of {steps.length}</span><h2>{steps[step].title}</h2><p>{steps[step].text}</p><pre><code>{steps[step].code}</code></pre></div>
      <div className="step-footer"><button className="button button-secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>Previous</button><button className="button button-primary" disabled={step === steps.length - 1} onClick={() => setStep(step + 1)}>Next</button></div>
    </section>
  </div>;
}
