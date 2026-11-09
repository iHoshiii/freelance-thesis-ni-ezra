const paths = {
  location: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z" /><circle cx="12" cy="10" r="2" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  download: <><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" /></>,
  compare: <><path d="M8 3v18M16 3v18M4 7l4-4 4 4M12 17l4 4 4-4" /></>,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6 6a8 8 0 0 1 13 2M5 16a8 8 0 0 0 13 2" /></>,
  trend: <><path d="M3 3v18h18M7 15l4-5 4 2 6-8" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  history: <><path d="M3 11a9 9 0 1 1 2.6 7M3 4v7h7" /><path d="M12 7v5l3 2" /></>,
  sprout: <><path d="M12 21v-9M12 16C6 16 3 13 3 8c6 0 9 3 9 8ZM12 12c0-6 3-9 9-9 0 6-3 9-9 9Z" /><path d="M6 21h12" /></>,
  device: <><rect x="6" y="3" width="12" height="18" rx="3" /><path d="M10 7h4M10 11h4M11 17h2M9 1v2m6-2v2" /></>,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  chevron: <path d="m8 10 4 4 4-4" />,
  ph: <><path d="M9 3h6M10 3v7L4 19a1.3 1.3 0 0 0 1 2h14a1.3 1.3 0 0 0 1-2l-6-9V3M7 15h10" /><path d="M10 18h.01M14 17h.01" /></>,
  droplet: <path d="M12 3s-7 8-7 12a7 7 0 0 0 14 0c0-4-7-12-7-12ZM8 15a4 4 0 0 0 4 4" />,
  temperature: <><path d="M9 14.5V5a3 3 0 0 1 6 0v9.5a5 5 0 1 1-6 0ZM12 8v10M17 6h3M17 10h2" /><circle cx="12" cy="18" r="1" /></>,
  layers: <><path d="m3 7 9-4 9 4-9 4-9-4Zm0 5 9 4 9-4M3 17l9 4 9-4" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></>,
  sample: <><path d="M5 5h14M7 5v13a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V5M7 13c3-2 7 2 10 0M10 2h4M10 17h.01M14 18h.01" /></>,
};

export type IconName = keyof typeof paths;

export function Icon({ name }: { name: IconName }) {
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
