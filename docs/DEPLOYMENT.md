# Deployment

## Cloudflare Pages

1. Connect the repository to Cloudflare Pages.
2. Set the build command to `npm run build`.
3. Set the output according to your Cloudflare/Next deployment adapter.
4. Configure the environment variables listed in `.env.example`.

## Cloudflare Workers via OpenNext

1. Add the OpenNext deployment adapter when you are ready to deploy server-side rendering.
2. Build locally with `npm run build`.
3. Publish through the Cloudflare adapter pipeline.

## Notes

- The project is structured to avoid Node-only assumptions in the UI layer.
- External integrations are isolated in `lib/` so they can be swapped later without touching route pages.
