# Production setup: Vercel + Supabase

## Supabase environment variables

You currently have this direct Supabase host:

```text
db.arlovvnixidszlzixifm.supabase.co
```

Set this locally when running database setup against Supabase:

```env
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.arlovvnixidszlzixifm.supabase.co:5432/postgres?sslmode=require&schema=public"
```

For Vercel runtime, prefer the Supabase pooled/session connection string from:

```text
Supabase Dashboard -> Project Settings -> Database -> Connection string -> Pooler
```

It usually looks like this:

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:YOUR_PASSWORD@POOLER_HOST:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1&schema=public"
```

If you cannot find the pooler URL yet, you can temporarily use the direct URL as `DATABASE_URL`, but pooled is safer for Vercel serverless.

## Vercel environment variables

Add these in:

```text
Vercel Project -> Settings -> Environment Variables
```

```env
DATABASE_URL=
DIRECT_URL=
AUTH_SECRET=
NEXT_PUBLIC_APP_URL=
BIT_PAYMENT_URL=
```

Firebase variables will be added when Google login is implemented:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
FIREBASE_PROJECT_ID=
```

For the Firebase web app you shared, the public values are:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyAUxBjxfL1BQio2Yck77oak_G5KJuxotr0"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="event-invites-13a7b.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="event-invites-13a7b"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="event-invites-13a7b.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="462917641500"
NEXT_PUBLIC_FIREBASE_APP_ID="1:462917641500:web:e9a74f511762116f8806d9"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-B9TM8HY3T0"
FIREBASE_PROJECT_ID="event-invites-13a7b"
```

No Firebase Admin private key is required. The backend verifies Firebase ID tokens with Google's public JWKS.

## Initialize Supabase schema

After setting `DIRECT_URL` and `DATABASE_URL` locally:

```bash
npm run db:setup
```

This runs:

```bash
prisma db push
prisma db seed
```

## Current status

- Supabase project ref appears to be `arlovvnixidszlzixifm`.
- The database password is still needed.
- The Supabase pooler connection string is still recommended for Vercel.
- `npx skills add supabase/agent-skills` is optional and not required for this codebase to run.
