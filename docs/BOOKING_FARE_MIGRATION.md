# Booking fare migration

Add the fare estimate columns to existing databases:

```sql
alter table bookings
  add column if not exists estimated_distance_km numeric(10, 2);

alter table bookings
  add column if not exists fare_base numeric(12, 0);

alter table bookings
  add column if not exists fare_per_km numeric(12, 0);

alter table bookings
  add column if not exists fare_multiplier numeric(6, 2);

alter table bookings
  add column if not exists estimated_fare numeric(12, 0);
```

Existing bookings can stay null in these columns. New bookings will save the estimate at creation time.
