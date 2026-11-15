-- Latest authenticated heartbeat only. Scan records remain in readings.
create table if not exists public.device_telemetry (
  device_id text primary key references public.devices(id) on delete cascade,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  received_at timestamptz not null default now()
);
alter table public.device_telemetry enable row level security;
revoke all on public.device_telemetry from public, anon, authenticated;
grant select, insert, update, delete on public.device_telemetry to service_role;
