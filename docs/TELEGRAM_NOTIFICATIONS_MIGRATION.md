# Telegram Notifications Migration

Apply this to existing databases if you want per-user Telegram delivery:

```sql
alter table customers
  add column if not exists telegram_chat_id text;

alter table drivers
  add column if not exists telegram_chat_id text;
```

Notes:
- `TELEGRAM_BOT_TOKEN` and `TELEGRAM_ADMIN_CHAT_ID` are required for admin Telegram delivery.
- Customer and driver Telegram delivery uses the optional `telegram_chat_id` stored on their profile.
- If no chat ID is set, the booking inbox still receives the notification in-app.
