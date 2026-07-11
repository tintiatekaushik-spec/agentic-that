# Deployment

The React website is deployed on Netlify. The Telegram console is a separate Node.js service and must be deployed as a web service.

## Netlify Website

Netlify uses `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

## Telegram Backend

Deploy the Telegram backend as a long-running web service from `integrations/telegram`.

The repo includes `render.yaml` for Render:

1. Open Render and create a new Blueprint from this GitHub repo.
2. Render will use `integrations/telegram/Dockerfile`.
3. Add the prompted secret values:
   - `TELEGRAM_API_ID`
   - `TELEGRAM_API_HASH`
   - `SESSION_ENCRYPTION_KEY`
   - `USER_PROVISIONING_KEY`
4. After the Render service is live, copy its public URL.
5. In Netlify, add this environment variable:

```text
VITE_TELEGRAM_DASHBOARD_URL=https://your-render-service.onrender.com
```

6. Redeploy the Netlify site.

The Telegram service uses a persistent disk at `/app/data` so encrypted Telegram sessions survive redeploys.
