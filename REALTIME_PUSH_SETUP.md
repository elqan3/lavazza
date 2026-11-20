# Lavaza Realtime and Push Notifications

## What this change adds

- Live order refresh in the employee order queue.
- A short audio alert when a new order is inserted while the employee dashboard is open.
- Automatic customer order-tracking refresh when the order or payment status changes.
- Live refresh for product availability, category changes, branch availability, and sales statistics.
- A 15-second customer tracking fallback and 30–60-second management/catalog fallbacks when a WebSocket is temporarily unavailable.
- Employee Web Push subscriptions stored per authenticated staff account.
- Service-worker notification display and click-through to `/orders`.
- A per-order delivery record to prevent duplicate push sends.

## Vercel environment variables

The required variables are configured for Preview and Production:

- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — public browser key.
- `VAPID_PRIVATE_KEY` — sensitive server-only signing key.
- `VAPID_SUBJECT` — VAPID contact URI.
- `SUPABASE_SERVICE_ROLE_KEY` — sensitive server-only Supabase service-role key.

Never prefix a secret with `NEXT_PUBLIC_`, commit it to Git, or expose it to browser code. Redeploy after changing environment variables.

## Employee setup

1. Sign in with an account that has the `staff`, `manager`, or `owner` order role.
2. Open `/orders`.
3. Select **تفعيل إشعارات الطلبات**.
4. Allow notifications in the browser.
5. Keep the service worker registered; it is installed by the existing PWA registration component.

On iOS/iPadOS, Web Push requires a supported iOS/iPadOS version and the web app added to the Home Screen. Open the installed app before enabling notifications. Android Chrome and desktop browsers can subscribe from their supported browser context.

## Security model

- Employees receive Postgres Changes only after the new staff-only SELECT policies pass RLS.
- Customers do not receive direct SELECT access to the `orders` or `payments` tables.
- Customer tracking uses a public Realtime Broadcast topic containing the order UUID and SHA-256 tracking-token hash. The broadcast payload contains only the order UUID; the customer then reloads the order through the existing token-validated server action.
- Push subscriptions can be created and removed only by authenticated staff users, and each row is tied to `auth.uid()`.
- The service-role key is used only by the server-side push sender.
- The order checkout remains successful if push delivery is unavailable.
- A unique delivery row per order prevents duplicate push sends.

## Manual verification

The following end-to-end checks were completed on the Vercel Preview deployment:

- Employee dashboard refreshed immediately after a new order was created.
- Push subscription activation completed successfully.
- A system push notification arrived while the app was closed/backgrounded.
- Realtime and push behavior were verified without duplicate notifications.
- The user confirmed the full set of planned checks passed.

## Migration history warning

The connected Supabase project has older migration-history entries that are not all represented in this repository. The two new migrations in this branch are already applied to the connected project. Do not run `supabase db push` from this repository until the older remote migration history has been reconciled with the local `supabase/migrations` directory.

## Operational notes

Realtime is the primary update mechanism. The timed refreshes are recovery fallbacks, not the normal update path. Push notifications are separate from Realtime: they notify employees when their app is not in the foreground, while the open dashboard uses Realtime and the audio alert.
