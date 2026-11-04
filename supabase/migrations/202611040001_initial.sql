-- Apply to your own Supabase project. No database is provisioned automatically.
create table public.devices (
  id text primary key,
  owner_id uuid not null references auth.users(id),
  label text not null,
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  last_contact_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.readings (
  device_id text not null references public.devices(id),
  record_id uuid not null,
  sample_id text not null,
  acquired_at timestamptz,
  time_quality text not null check (time_quality in ('synced', 'unknown')),
  received_at timestamptz not null default now(),
  ph double precision check (ph between 0 and 14),
  moisture_percent double precision check (moisture_percent between 0 and 100),
  temperature_c double precision check (temperature_c between -55 and 125),
  npk_raw jsonb,
  payload jsonb not null,
  primary key (device_id, record_id),
  check ((time_quality = 'synced' and acquired_at is not null)
    or (time_quality = 'unknown' and acquired_at is null))
);
create index readings_received_at_idx on public.readings (device_id, received_at desc);
alter table public.devices enable row level security;
alter table public.readings enable row level security;
revoke all on public.devices, public.readings from anon, authenticated;
grant select (id, owner_id, label, last_contact_at, created_at) on public.devices to authenticated;
grant select on public.readings to authenticated;
grant all on public.devices, public.readings to service_role;
create policy device_owner_read on public.devices for select to authenticated
  using ((select auth.uid()) = owner_id);
create policy reading_owner_read on public.readings for select to authenticated
  using (exists (select 1 from public.devices d
    where d.id = device_id and d.owner_id = (select auth.uid())));

-- API checks the per-device token first; only service_role may call this function.
-- All writes and the acknowledgement happen in one database transaction.
create function public.ingest_reading(p_device_id text, p_payload jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare saved public.readings%rowtype;
begin
  insert into public.readings (
    device_id, record_id, sample_id, acquired_at, time_quality,
    ph, moisture_percent, temperature_c, npk_raw, payload
  ) values (
    p_device_id, (p_payload->>'recordId')::uuid, p_payload->>'sampleId',
    (p_payload->>'acquiredAt')::timestamptz, p_payload->>'timeQuality',
    (p_payload->>'ph')::double precision,
    (p_payload->>'moisturePercent')::double precision,
    (p_payload->>'temperatureC')::double precision,
    nullif(p_payload->'npkRaw', 'null'::jsonb), p_payload
  ) on conflict (device_id, record_id) do nothing;
  select * into strict saved from public.readings
    where device_id = p_device_id and record_id = (p_payload->>'recordId')::uuid;
  if saved.payload <> p_payload then
    return jsonb_build_object('conflict', true);
  end if;
  update public.devices set last_contact_at = now() where id = p_device_id;
  return jsonb_build_object('acknowledgedRecordId', saved.record_id, 'receivedAt', saved.received_at);
end;
$$;
revoke all on function public.ingest_reading(text, jsonb) from public, anon, authenticated;
grant execute on function public.ingest_reading(text, jsonb) to service_role;
