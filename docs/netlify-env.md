# Netlify Environment Variables

Add these values to the main AgenticThat Netlify site:

```env
NEXT_PUBLIC_WHATSAPP_DASHBOARD_URL=/dashboard

WA_PROVIDER=meta
META_API_VERSION=v25.0
META_ACCESS_TOKEN=
META_PHONE_NUMBER_ID=
META_WABA_ID=
META_APP_ID=
META_APP_SECRET=
META_WEBHOOK_VERIFY_TOKEN=

DB_CONNECTOR=postgres
DATABASE_URL=

ADMIN_EMAIL=
ADMIN_PASSWORD=
BUSINESS_NAME=AgenticThat
WA_FROM=
CURRENCY=INR
```

Optional only if switching to WATI:

```env
WATI_API_URL=
WATI_ACCESS_TOKEN=
```

Do not add these old standalone-service values unless another feature starts using them:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Meta webhook callback URL:

```text
https://<your-netlify-site>.netlify.app/api/webhooks/meta
```

Use the same value from `META_WEBHOOK_VERIFY_TOKEN` when Meta asks for the verify token.
