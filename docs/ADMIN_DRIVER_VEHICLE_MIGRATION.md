# Admin Driver & Vehicle Migration Notes

Apply these changes if your database already has the earlier driver profile schema:

```sql
alter table drivers
  add column if not exists approval_status text not null default 'pending',
  add column if not exists rejected_reason text,
  add column if not exists archived_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'drivers_approval_status_check'
  ) then
    alter table drivers
      add constraint drivers_approval_status_check
      check (approval_status in ('pending', 'approved', 'rejected'));
  end if;
end $$;

update drivers
set approval_status = case
  when active then 'approved'
  else 'pending'
end
where approval_status is null;

update drivers
set active = false
where approval_status = 'pending';
```

Notes:
- Existing approved demo drivers should be updated to `approval_status = 'approved'` and `active = true`.
- Rejected drivers should stay hidden from customer vehicle browsing.
- Archived drivers remain in the admin list but should not be shown to customers.
