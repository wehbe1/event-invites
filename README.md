# ניהול הזמנות לאירועים

אפליקציית MVP מלאה ב־Next.js, TypeScript, Tailwind CSS, Prisma ו־PostgreSQL לניהול אירועים, מוזמנים, RSVP, קישורי SMS/WhatsApp ומתנות.

## הרצה מקומית

1. התקנת חבילות:

```bash
npm install
```

2. יצירת קובץ סביבה:

```bash
cp .env.example .env
```

3. הרצת PostgreSQL מקומי ועדכון `DATABASE_URL` בקובץ `.env`.

ללא Docker אפשר להריץ PostgreSQL מוטמע לפיתוח:

```bash
npm run db:pglite
```

במצב הזה ודאו ש־`DATABASE_URL` כולל `pgbouncer=true`, כמו בדוגמת `.env.example`.

אפשר להשתמש ב־Docker:

```bash
docker compose up -d
```

4. יצירת טבלאות ונתוני דמו:

```bash
npm run db:push
npm run db:seed
```

או בקיצור:

```bash
npm run db:setup
```

5. הרצת האפליקציה:

```bash
npm run dev
```

כניסה: `demo@example.com` / `password123`

אפשר גם להריץ DB ושרת Next יחד:

```bash
npm run dev:local
```

## עמודים

- `/login`
- `/dashboard`
- `/events/new`
- `/events/[id]`
- `/events/[id]/edit`
- `/events/[id]/guests`
- `/invite/[token]`

## מיקום אירוע

אירוע כולל את השדות:

- `locationName`
- `address`
- `latitude`
- `longitude`
- `googleMapsUrl`
- `wazeUrl`

ביצירה ובעריכה אפשר להקליד כתובת ידנית, להדביק קישור Google Maps, או ללחוץ על "השתמש במיקום הנוכחי". שימוש במיקום הנוכחי מבקש הרשאת דפדפן, שומר קואורדינטות, ומייצר קישורי Google Maps ו-Waze.

## API

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/events`
- `POST /api/events`
- `GET /api/events/[id]`
- `PATCH /api/events/[id]`
- `GET /api/events/[id]/guests`
- `POST /api/events/[id]/guests`
- `POST /api/events/[id]/guests/import`
- `GET /api/events/[id]/guests/export`
- `POST /api/events/[id]/invitations`
- `PATCH /api/guests/[id]`
- `GET /api/invite/[token]`
- `POST /api/invite/[token]/respond`

## CSV

הייבוא תומך בכותרות:

- `fullName`, `phoneNumber`, `notes`
- `שם מלא`, `טלפון`, `הערות`
- `שם`, `מספר טלפון`

## אינטגרציות עתידיות

הקובץ `src/lib/integrations.ts` כולל interfaces ו־placeholders עבור:

- Twilio SMS API
- WhatsApp Business API
- Bit Business payment link / webhook

כרגע SMS ו־WhatsApp יוצרים קישורי `sms:` ו־`https://wa.me/PHONE?text=...`, והמערכת רושמת `InvitationLog` עם `status=link_generated`.

## הערות אבטחה

- לא מתבצעת גישה לאנשי קשר ללא לחיצה מפורשת והרשאת דפדפן.
- עמודי Organizer מוגנים ב־cookie חתום.
- עמודי `/invite/[token]` ציבוריים לפי token אישי.
- לפני פרודקשן יש להגדיר `AUTH_SECRET` ארוך ואקראי.
