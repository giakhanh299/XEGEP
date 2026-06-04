# Notification inbox migration

Add the new inbox columns to existing databases:

```sql
alter table notifications
  add column if not exists role text;

alter table notifications
  add column if not exists title text;

alter table notifications
  add column if not exists message text;

alter table notifications
  add column if not exists type text;

alter table notifications
  add column if not exists is_read boolean not null default false;

alter table notifications
  add column if not exists related_booking_id uuid;
```

If the legacy columns are still present, keep them for compatibility. The app reads and writes the new inbox columns first, and ignores the legacy fields.
