# Mathify

Mathify is a React + Vite app with Supabase auth, student labs, and an admin dashboard.

## One-time Supabase Setup
1. Create a Supabase project.
2. In the Supabase SQL editor, run these migrations in order:
   - `supabase/migrations/20260208_0001_lab_progress.sql`
   - `supabase/migrations/20260208_0002_profiles_security_patch.sql`
   - `supabase/migrations/20260208_0003_admin_dashboard_rls.sql`
3. Local development:
   - Run `npm install`.
   - Copy `.env.example` to `.env.local`.
   - Fill in:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
   - Start the app with `npm run dev`.
4. For Vercel, set the same environment variables in the project settings and redeploy.

## How to add an admin
1. Have the user sign up so a profile row is created.
2. In Supabase Table Editor, open `public.profiles`.
3. Find the user by email and set `role` to `admin`.
4. The user can now visit `/admin`.

## Admin daily workflow
1. Approve new students on the Students page (pending -> student).
2. Create assignments and copy the share links.
3. Students submit from the lab problem screen.
4. Review submissions and save feedback.
5. Check Grades for a final summary.

## Troubleshooting
- "Supabase env vars missing" or auth errors: check `.env.local` and restart `npm run dev`.
- Permission errors or empty data: confirm your role in `public.profiles` and re-run migrations.
- Schema changes not visible: run `notify pgrst, 'reload schema';` in the SQL editor.
- Students cannot see assignments: ensure the assignment is set to "all" or includes their user ID.
- If a student can change role, re-apply `20260208_0002_profiles_security_patch.sql`.
