# DNS Quick Start Guide - dattvayaan.live

This is a condensed quick-reference guide for setting up DNS and deployment. For detailed explanations, see [DEPLOYMENT-DNS-CONFIGURATION.md](./DEPLOYMENT-DNS-CONFIGURATION.md).

## Prerequisites
- Server with public IP address
- Domain `dattvayaan.live` registered
- SSH access to server

---

## Step 1: Configure Nameservers (at Domain Registrar)

Choose one option:

### Option A: Use Domain Registrar DNS (Simplest)
- Keep default nameservers from your registrar
- Configure DNS records in registrar's control panel

### Option B: Use Cloudflare (Recommended - Free CDN + DDoS Protection)
1. Create account at https://cloudflare.com
2. Add domain `dattvayaan.live`
3. Update nameservers at registrar to Cloudflare's nameservers
4. Wait 24-48 hours for propagation

---

## Step 2: Add DNS Records

In your DNS management panel (registrar or Cloudflare):

```
Type    Name    Value                       TTL
----    ----    -----                       ---
A       @       YOUR_SERVER_IPv4_ADDRESS    3600
A       www     YOUR_SERVER_IPv4_ADDRESS    3600
```

**Replace `YOUR_SERVER_IPv4_ADDRESS`** with your actual server IP (e.g., `123.45.67.89`)

**Example:**
```
A       @       123.45.67.89    3600
A       www     123.45.67.89    3600
```

---

## Step 3: Install SSL Certificate (on Server)

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d dattvayaan.live -d www.dattvayaan.live

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Step 4: Configure Nginx (on Server)

Create `/etc/nginx/sites-available/dattvayaan.live`:

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name dattvayaan.live www.dattvayaan.live;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name dattvayaan.live www.dattvayaan.live;

    ssl_certificate /etc/letsencrypt/live/dattvayaan.live/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dattvayaan.live/privkey.pem;

    # Frontend
    root /var/www/dattvayaan-erp/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8888;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Public files
    location /public {
        alias /var/www/dattvayaan-erp/backend/public;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/dattvayaan.live /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 5: Configure Application

### Backend `.env` file:
```env
NODE_ENV=production
PORT=8888
DATABASE=mongodb+srv://username:password@cluster.mongodb.net/dattva-yaan
APP_BASE_URL=https://dattvayaan.live/
JWT_SECRET=your_super_secret_key_here
APP_EMAIL=noreply@dattvayaan.live
```

### Frontend `.env.production` file:
```env
VITE_BACKEND_SERVER=https://dattvayaan.live/
VITE_WEBSITE_URL=https://dattvayaan.live/
```

---

## Step 6: Build and Deploy

```bash
# Build frontend
cd /var/www/dattvayaan-erp/frontend
npm install
npm run build

# Start backend with PM2
cd /var/www/dattvayaan-erp/backend
npm install
sudo npm install -g pm2
pm2 start npm --name "dattva-yaan-backend" -- run production
pm2 save
pm2 startup
```

---

## Step 7: Configure Firewall

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

---

## Verification Commands

```bash
# Check DNS
dig dattvayaan.live +short
dig www.dattvayaan.live +short

# Check SSL
curl -I https://dattvayaan.live

# Check backend
curl http://localhost:8888/api/ping
curl https://dattvayaan.live/api/ping

# Check PM2 status
pm2 status
pm2 logs dattva-yaan-backend
```

---

## Common Issues

### DNS not resolving
```bash
# Wait 24-48 hours for propagation
# Check with: https://www.whatsmydns.net

# Clear local DNS cache
sudo systemd-resolve --flush-caches  # Linux
```

### Backend not accessible
```bash
# Check if backend is running
pm2 status

# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### SSL errors
```bash
# Renew certificate
sudo certbot renew

# Check certificate
sudo certbot certificates
```

---

## Quick Reference URLs

After setup, your site will be accessible at:
- **Main Site:** https://dattvayaan.live
- **With www:** https://www.dattvayaan.live
- **API Endpoint:** https://dattvayaan.live/api

---

## File Locations Reference

```
Application:
  Frontend Build: /var/www/dattvayaan-erp/frontend/dist
  Backend: /var/www/dattvayaan-erp/backend
  Backend Env: /var/www/dattvayaan-erp/backend/.env
  Frontend Env: /var/www/dattvayaan-erp/frontend/.env.production

Nginx:
  Config: /etc/nginx/sites-available/dattvayaan.live
  Enabled: /etc/nginx/sites-enabled/dattvayaan.live
  Logs: /var/log/nginx/dattvayaan-*.log

SSL:
  Certificate: /etc/letsencrypt/live/dattvayaan.live/fullchain.pem
  Private Key: /etc/letsencrypt/live/dattvayaan.live/privkey.pem

PM2:
  Status: pm2 status
  Logs: pm2 logs dattva-yaan-backend
  Restart: pm2 restart dattva-yaan-backend
```

---

## Next Steps After Deployment

1. Set up MongoDB backups
2. Configure email service (Resend API)
3. Set up monitoring (Uptime Robot, etc.)
4. Configure CDN (optional - Cloudflare)
5. Set up automated backups
6. Configure rate limiting
7. Set up error tracking (Sentry, etc.)

---

For detailed information, see [DEPLOYMENT-DNS-CONFIGURATION.md](./DEPLOYMENT-DNS-CONFIGURATION.md)
