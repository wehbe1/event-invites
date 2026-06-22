# Production setup: Vercel + Supabase

## Supabase environment variables

Supabase showed these Prisma connection strings for project `arlovvnixidszlzixifm`.
Replace `YOUR_PASSWORD` with the database password inside Vercel or your local
`.env`; do not paste the password into chat.

Use the transaction pooler for Vercel runtime:

```env
DATABASE_URL="postgresql://postgres.arlovvnixidszlzixifm:YOUR_PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

Use the session pooler for Prisma schema setup and migrations:

```env
DIRECT_URL="postgresql://postgres.arlovvnixidszlzixifm:YOUR_PASSWORD@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
```

The old direct host `db.arlovvnixidszlzixifm.supabase.co:5432` can fail from
Vercel in some environments, so avoid using it as `DATABASE_URL`.

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

Firebase variables:

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
- The Supabase pooler connection string is required for the Vercel runtime.
- `npx skills add supabase/agent-skills` is optional and not required for this codebase to run.
