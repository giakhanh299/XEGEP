# Database

The schema is defined in `database/schema.sql`.

## Tables

- `users`
- `drivers`
- `vehicles`
- `bookings`
- `trips`
- `trip_bookings`
- `route_points`
- `notifications`

## Booking Flow

- Customers create bookings with pickup and dropoff details.
- Bookings start as `pending`.
- Admin can move bookings into matching, confirmed, or driver assignment states.
- Trips track passenger totals, capacity, revenue, and trip status.
