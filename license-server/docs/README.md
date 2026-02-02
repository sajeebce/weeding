# License Server Documentation

## Documents

| Document | Description |
|----------|-------------|
| [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) | Complete implementation checklist with all features |
| [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md) | VPS deployment guide without Docker |

## Quick Start (Development)

```bash
cd license-server
npm install
cp .env.example .env.local
npm run keys:generate  # Copy output to .env.local
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Access: http://localhost:3001
- Email: admin@llcpad.com
- Password: admin123

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL 16 + Prisma 6
- **Auth:** NextAuth.js v5
- **UI:** Tailwind CSS + shadcn/ui
- **Email:** Resend
- **Port:** 3001
