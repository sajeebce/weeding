# VPS Deployment Guide (Without Docker)

Direct deployment on VPS (Hetzner/Contabo) without Docker.

## Prerequisites

- Ubuntu 22.04 LTS or newer
- Node.js 22 LTS
- PostgreSQL 16+
- Nginx
- PM2 (process manager)

## 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node -v  # v22.x.x
npm -v   # 10.x.x

# Install PM2 globally
sudo npm install -g pm2
```

## 2. PostgreSQL Setup

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql

# In PostgreSQL shell:
CREATE USER license_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE license_server OWNER license_user;
GRANT ALL PRIVILEGES ON DATABASE license_server TO license_user;
\q
```

## 3. Application Setup

```bash
# Create app directory
sudo mkdir -p /var/www/license-server
sudo chown $USER:$USER /var/www/license-server

# Clone or upload your code
cd /var/www/license-server

# Install dependencies
npm ci --production

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (first time only)
npx prisma db seed
```

## 4. Environment Configuration

```bash
# Create .env file
nano /var/www/license-server/.env
```

Add the following:

```env
# Database
DATABASE_URL="postgresql://license_user:your_secure_password@localhost:5432/license_server"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://license.yourdomain.com"

# RSA Keys (generate with: npm run keys:generate)
LICENSE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----"

LICENSE_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
...
-----END PUBLIC KEY-----"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxx"
EMAIL_FROM="LLCPad Licenses <licenses@yourdomain.com>"

# Webhooks
ENVATO_WEBHOOK_SECRET="your-envato-webhook-secret"
```

## 5. Build Application

```bash
cd /var/www/license-server

# Build for production
npm run build
```

## 6. PM2 Process Management

Create PM2 ecosystem file:

```bash
nano /var/www/license-server/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'license-server',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/license-server',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

Start with PM2:

```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Monitor
pm2 status
pm2 logs license-server
```

## 7. Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/license.yourdomain.com
```

```nginx
server {
    listen 80;
    server_name license.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name license.yourdomain.com;

    # SSL (will be configured by Certbot)
    ssl_certificate /etc/letsencrypt/live/license.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/license.yourdomain.com/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

Enable site and get SSL:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/license.yourdomain.com /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d license.yourdomain.com

# Restart Nginx
sudo systemctl restart nginx
```

## 8. Firewall Setup

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 9. Maintenance Commands

```bash
# View logs
pm2 logs license-server

# Restart application
pm2 restart license-server

# Update application
cd /var/www/license-server
git pull  # or upload new files
npm ci --production
npm run build
pm2 restart license-server

# Database backup
pg_dump -U license_user license_server > backup_$(date +%Y%m%d).sql
```

## 10. Health Check

Test your deployment:

```bash
# Local health check
curl http://localhost:3001/api/health

# External health check
curl https://license.yourdomain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "checks": {
    "database": true,
    "timestamp": "2026-02-02T..."
  }
}
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `pm2 start ecosystem.config.js` | Start app |
| `pm2 restart license-server` | Restart app |
| `pm2 stop license-server` | Stop app |
| `pm2 logs license-server` | View logs |
| `pm2 status` | Check status |
| `npx prisma studio` | Database GUI |
