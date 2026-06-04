# Seat Management Migration

Apply this to existing databases before rolling out shared seat management:

```sql
alter table drivers
  add column if not exists available_seats integer not null default 0;

update drivers
set available_seats = seat_count
where available_seats = 0;

alter table drivers
  add constraint drivers_available_seats_within_capacity check (available_seats >= 0 and available_seats <= seat_count);
```

Notes:
- `available_seats` is the live seat counter.
- `seat_count` stays the total vehicle capacity.
- The app clamps availability to the vehicle capacity when driver profiles are saved.
