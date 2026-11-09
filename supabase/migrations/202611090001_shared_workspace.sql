alter table public.devices alter column owner_id drop not null;
alter table public.readings add column if not exists location text;
do $$ begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.readings'::regclass and conname = 'readings_location_length') then
    alter table public.readings add constraint readings_location_length
      check (location is null or char_length(location) between 1 and 120);
  end if;
end $$;
create index if not exists readings_location_acquired_idx on public.readings (device_id, location, acquired_at desc);

create or replace function public.ingest_reading(p_device_id text, p_payload jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare saved public.readings%rowtype;
begin
  insert into public.readings (
    device_id, record_id, sample_id, location, acquired_at, time_quality,
    ph, moisture_percent, temperature_c, npk_raw, payload
  ) values (
    p_device_id, (p_payload->>'recordId')::uuid, p_payload->>'sampleId',
    p_payload->>'location', (p_payload->>'acquiredAt')::timestamptz, p_payload->>'timeQuality',
    (p_payload->>'ph')::double precision, (p_payload->>'moisturePercent')::double precision,
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
