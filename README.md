# Forma Studio

A responsive interior-design studio website with a real inquiry workflow and a protected admin dashboard. Built with Next.js, TypeScript, Tailwind CSS, shadcn-style components, Radix UI, Zod, and Supabase.

## Start locally

Requires Node.js 20.9+ and npm.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. Public website: `/`. Dashboard: `/studio`. Admin sign-in: `/login`.

Without Supabase environment values, the app runs in clearly labelled **demo mode**. Inquiries and status changes persist in localStorage in the same browser and origin. The demo dashboard is intentionally public and contains fictional sample data. It does not write to a backend. Use sample details, not personal customer information. Demo data is not copied into Supabase when you connect it. Clearing this site's browser storage resets the demo.

## Appearance

The site opens in dark mode, using oxblood, warm clay, and muted brass. The Light/Dark control is available on the website, login page, and portal. The light palette uses clay-colored surfaces instead of white. A preference is saved in localStorage and applied before rendering the page; if browser storage is blocked, switching themes still works for the current page. The portal includes status-summary filters, inquiry search, a refresh action, and CSV export.

## Connect the live backend

1. Create a Supabase project named `forma-studio`, in a region close to you. Keep the database password private.
2. Copy `.env.example` to `.env.local`. In Supabase's **Connect** dialog (or Project Settings > API), find the Project URL and publishable key. Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. A legacy `anon` key also works. Never use a secret or `service_role` key here.
3. Open Supabase **SQL Editor**, paste `supabase/schema.sql`, and run it.
4. Under **Authentication > Users > Add user**, create your admin with an email and strong password. Enable **Auto Confirm User**. This is your studio login; it is separate from your Supabase dashboard account.
5. In SQL Editor, run the statement below, replacing the email. Verify the result returns the user ID. If it returns no row, check that the admin user exists and the email is correct.

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'YOUR_ADMIN_EMAIL'
on conflict (user_id) do update set user_id = excluded.user_id
returning user_id;
```

6. Restart `npm run dev`. Submit a real test inquiry, sign in at `/login`, open it, update its status, and refresh to confirm it persisted. Sign out, then verify `/studio` redirects to `/login` and `GET /api/inquiries` returns 401.
7. Disable public signups in Supabase Auth settings if you only need manually created admin accounts. New authenticated users are never admins automatically.

The public form validates on both client and server. The server uses the publishable key to insert as an anonymous visitor. Database grants allow anonymous users to insert only form fields, never read inquiries or set their status. Authenticated users can only read or update a status if they are present in `public.admins`. No service-role key is required.

## Deploy to Vercel

1. Push this folder to your GitHub repository, excluding `.env.local`.
2. Import the repository into Vercel. The Next.js preset uses `npm run build`.
3. Add both environment variables to the Vercel project. If omitted, the deployed app runs in browser-only demo mode.
4. Deploy. Environment variable changes require a new deployment.
5. Update Supabase **Authentication > URL Configuration > Site URL** to your deployed URL. This app currently uses password sign-in, with no email-link callback flow.
6. Repeat the inquiry and admin checks on the deployed URL before sending it to an employer.

Vercel Hobby is restricted to personal, non-commercial use; review the current plan terms for client/commercial hosting: https://vercel.com/docs/plans/hobby.

## Checks

```sh
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser tests start an isolated demo server on port 3100 with a separate `.next-test` build directory. `FORMA_DEMO_MODE=1` ensures tests never write to the configured Supabase database. They cover submission-to-dashboard persistence, status changes, summary filters, search, CSV export, mobile navigation, theme preference across pages/reloads, and the unconfigured API. Live database and authentication checks require your Supabase project and must be completed after setup. For screenshots, start a demo server with `FORMA_DEMO_MODE=1` and `NEXT_DIST_DIR=.next-test` on port 3100, then run `node scripts/capture-preview.mjs`.

With `.env.local` configured, run `node --env-file=.env.local scripts/check-backend.mjs` for read-only connection and anonymous-access checks. With the local app running in live mode, `node scripts/verify-live.mjs` submits one clearly labelled sample inquiry and checks server validation, request-origin handling, and signed-out access. This leaves the sample inquiry in the database for you to inspect from your admin account. Admin sign-in and status persistence must also be checked with your account.

## Demo scope and launch notes

- Portfolio concept: fictional business, sample project descriptions, and stock interiors from Unsplash. No real client testimonials or projects are claimed.
- No payment handling, notification emails, scheduling, or password recovery flow is included. Inquiries are managed in the dashboard.
- Live dashboard displays the latest 1,000 inquiries, with client-side search, status filtering, and eight rows per page. CSV exports the filtered loaded set.
- The form has a honeypot and bounded payloads. Add a verified CAPTCHA and durable rate limiting before opening a real business inquiry form to significant public traffic. The Supabase anonymous insert policy is public, so a server-only honeypot cannot protect direct database API submissions.
- Photography from Unsplash is stored in `public/images` and served locally with Next.js image optimization. Source photo IDs: `1600210492486-724fe5c67fb0`, `1600607687920-4e2a09cf159d`, `1600566753190-17f0baa2a6c3`. Choose client-approved photography for a final handoff.
- Search indexing is disabled for this fictional demo. Remove the `robots` restriction in `src/app/layout.tsx` when adapting it for a real business.
- Fonts use system sans-serif and Georgia, avoiding a third-party font service or build-time font download.

Official setup references: [Supabase Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs), [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [Vercel deployments](https://vercel.com/docs/deployments).
