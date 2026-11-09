"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="error-page"><h1>Unable to load this page</h1><p>Your stored scans have not been changed.</p><div><button className="button button-primary" onClick={reset}>Try again</button><Link className="button button-secondary" href="/setup">Open setup</Link></div></main>;
}
