# Booking status history migration

Add the new booking history column to existing databases:

```sql
alter table bookings
  add column if not exists status_history jsonb not null default '[]'::jsonb;
```

Optional backfill for existing rows:

```sql
update bookings
set status_history = jsonb_build_array(
  jsonb_build_object(
    'status', 'created',
    'timestamp', created_at,
    'actorRole', 'customer',
    'actorId', customer_id
  )
)
where status_history = '[]'::jsonb;
```

The app still renders bookings that do not have history rows yet. They will show a synthetic created entry in the UI until the backfill is applied.
