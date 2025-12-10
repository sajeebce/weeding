# LLCPad Demo Credentials



## Login URLs

| Portal | URL |
|--------|-----|
| **Login Page** | http://localhost:3000/login |
| **Admin Dashboard** | http://localhost:3000/admin |
| **Customer Dashboard** | http://localhost:3000/dashboard |

## Demo Users

All demo users have the same password: `Demo@123`

| Role | Email | Password | Login URL |
|------|-------|----------|-----------|
| **Admin** | admin@llcpad.com | Demo@123 | /login → /admin |
| **Customer** | customer@llcpad.com | Demo@123 | /login → /dashboard |
| **Content Manager** | content@llcpad.com | Demo@123 | /login → /admin |
| **Sales Agent** | sales@llcpad.com | Demo@123 | /login → /admin |
| **Support Agent** | support@llcpad.com | Demo@123 | /login → /admin |

## Role Permissions

### Admin (admin@llcpad.com)
- Full dashboard access
- User management (create, edit, delete users)
- All order management
- Service & package configuration
- System settings
- Financial reports
- Content management

### Customer (customer@llcpad.com)
- Browse services
- Place orders
- Track order status
- View/download documents
- Create support tickets
- Manage profile

### Content Manager (content@llcpad.com)
- Blog post management
- FAQ management
- Testimonial management
- Service descriptions
- SEO settings

### Sales Agent (sales@llcpad.com)
- View and manage orders
- Customer communication
- Lead tracking
- Sales reports

### Support Agent (support@llcpad.com)
- Support ticket management
- Customer communication
- Order status updates
- Document requests

## Database Connection

```
Host: 127.0.0.1  # Use 127.0.0.1 instead of localhost for consistent IPv4 connection
Port: 5432
Database: llcpad
User: postgres
Password: llcpad123
```

## URLs

- **Frontend:** http://localhost:3000
- **Prisma Studio:** `npm run db:studio`

## Quick Start

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed demo data
cat prisma/seed.sql | npx prisma db execute --stdin

# Start development server
npm run dev
```

---

> **Note:** These are demo credentials for development only. Change all passwords before deploying to production.
