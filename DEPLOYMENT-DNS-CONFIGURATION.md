# DNS and Deployment Configuration Guide

This guide provides comprehensive instructions for configuring nameservers, DNS records, URL forwarding, and deployment settings for the Dattva Yaan ERP application at `dattvayaan.live`.

## Table of Contents

1. [Nameserver Configuration](#nameserver-configuration)
2. [DNS Records Configuration](#dns-records-configuration)
3. [SSL/TLS Certificate Setup](#ssltls-certificate-setup)
4. [Web Server Configuration](#web-server-configuration)
5. [URL Forwarding and Redirects](#url-forwarding-and-redirects)
6. [Application Configuration](#application-configuration)
7. [Verification Steps](#verification-steps)

---

## Nameserver Configuration

### Option 1: Using Your Domain Registrar's Nameservers

If your domain is registered with a provider like GoDaddy, Namecheap, Google Domains, etc., you can use their nameservers:

1. **Keep Default Nameservers**: Most domain registrars provide default nameservers (e.g., `ns1.example.com`, `ns2.example.com`)
2. **Manage DNS Records**: Configure DNS records directly in your registrar's DNS management panel

### Option 2: Using Cloud Provider Nameservers

If hosting on cloud providers (AWS, DigitalOcean, Cloudflare, etc.):

#### Cloudflare Nameservers (Recommended for CDN + DDoS Protection)
```
ns1.cloudflare.com
ns2.cloudflare.com
```

**Steps:**
1. Create a Cloudflare account at https://cloudflare.com
2. Add your domain `dattvayaan.live`
3. Cloudflare will provide specific nameservers (e.g., `alice.ns.cloudflare.com`, `bob.ns.cloudflare.com`)
4. Update nameservers at your domain registrar
5. Wait 24-48 hours for DNS propagation

#### DigitalOcean Nameservers
```
ns1.digitalocean.com
ns2.digitalocean.com
ns3.digitalocean.com
```

**Steps:**
1. Log into DigitalOcean
2. Go to Networking → Domains
3. Add domain `dattvayaan.live`
4. Update nameservers at your domain registrar

#### AWS Route 53 Nameservers
1. Create a hosted zone in Route 53
2. AWS will provide 4 nameservers (e.g., `ns-123.awsdns-12.com`)
3. Update these at your domain registrar

---

## DNS Records Configuration

### Required DNS Records

Configure the following DNS records in your DNS management panel:

#### A Records (IPv4 Address)
Point your domain to your server's IPv4 address:

```
Type: A
Name: @
Value: YOUR_SERVER_IPv4_ADDRESS
TTL: 3600 (1 hour) or 300 (5 minutes for testing)
```

```
Type: A
Name: www
Value: YOUR_SERVER_IPv4_ADDRESS
TTL: 3600
```

**Example:**
```
A     @       123.45.67.89     3600
A     www     123.45.67.89     3600
```

#### AAAA Records (IPv6 Address) - Optional but Recommended
If your server has IPv6:

```
Type: AAAA
Name: @
Value: YOUR_SERVER_IPv6_ADDRESS
TTL: 3600
```

```
Type: AAAA
Name: www
Value: YOUR_SERVER_IPv6_ADDRESS
TTL: 3600
```

#### CNAME Records - Alternative for www
Instead of an A record for www, you can use CNAME:

```
Type: CNAME
Name: www
Value: dattvayaan.live
TTL: 3600
```

**Note:** Use either A record OR CNAME for www, not both.

#### Additional Subdomains (if needed)

For API subdomain (if you want separate API endpoint):
```
Type: A or CNAME
Name: api
Value: YOUR_SERVER_IP or dattvayaan.live
TTL: 3600
```

For CDN/static files (if using separate CDN):
```
Type: CNAME
Name: cdn
Value: your-cdn-url.cloudfront.net
TTL: 3600
```

#### Email Records (Optional but Recommended)

**MX Records** (for email):
```
Type: MX
Name: @
Priority: 10
Value: mail.dattvayaan.live
TTL: 3600
```

**SPF Record** (prevent email spoofing):
```
Type: TXT
Name: @
Value: "v=spf1 a mx ip4:YOUR_SERVER_IP ~all"
TTL: 3600
```

**DMARC Record** (email authentication):
```
Type: TXT
Name: _dmarc
Value: "v=DMARC1; p=quarantine; rua=mailto:your@email.com"
TTL: 3600
```

---

## SSL/TLS Certificate Setup

### Option 1: Let's Encrypt (Recommended - Free)

Use Certbot to obtain free SSL certificates:

```bash
# Install Certbot (Ubuntu/Debian)
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain certificate for Nginx
sudo certbot --nginx -d dattvayaan.live -d www.dattvayaan.live

# Or for Apache
sudo certbot --apache -d dattvayaan.live -d www.dattvayaan.live

# Test auto-renewal
sudo certbot renew --dry-run
```

**Certificate Files Location:**
- Certificate: `/etc/letsencrypt/live/dattvayaan.live/fullchain.pem`
- Private Key: `/etc/letsencrypt/live/dattvayaan.live/privkey.pem`

### Option 2: Cloudflare SSL (Automatic)

If using Cloudflare:
1. Go to SSL/TLS section in Cloudflare dashboard
2. Select "Full (strict)" encryption mode
3. Cloudflare automatically provides SSL certificate
4. Generate Origin Certificate for your server (valid for 15 years)

### Option 3: Commercial SSL Certificate

Purchase from providers like:
- DigiCert
- Sectigo
- GoDaddy

---

## Web Server Configuration

### Nginx Configuration (Recommended)

Create a configuration file at `/etc/nginx/sites-available/dattvayaan.live`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name dattvayaan.live www.dattvayaan.live;

    # Redirect all HTTP traffic to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS Server Configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name dattvayaan.live www.dattvayaan.live;

    # SSL Certificate Configuration
    ssl_certificate /etc/letsencrypt/live/dattvayaan.live/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dattvayaan.live/privkey.pem;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Serve Frontend Static Files
    root /var/www/dattvayaan-erp/frontend/dist;
    index index.html index.htm;

    # Frontend - SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Backend
    location /api {
        proxy_pass http://localhost:8888;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files and assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Public files
    location /public {
        alias /var/www/dattvayaan-erp/backend/public;
        expires 1y;
        add_header Cache-Control "public";
        access_log off;
    }

    # Logging
    access_log /var/log/nginx/dattvayaan-access.log;
    error_log /var/log/nginx/dattvayaan-error.log;
}
```

**Enable the site:**
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/dattvayaan.live /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Apache Configuration (Alternative)

Create a configuration file at `/etc/apache2/sites-available/dattvayaan.live.conf`:

```apache
<VirtualHost *:80>
    ServerName dattvayaan.live
    ServerAlias www.dattvayaan.live

    # Redirect to HTTPS
    Redirect permanent / https://dattvayaan.live/
</VirtualHost>

<VirtualHost *:443>
    ServerName dattvayaan.live
    ServerAlias www.dattvayaan.live

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/dattvayaan.live/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/dattvayaan.live/privkey.pem

    # Frontend
    DocumentRoot /var/www/dattvayaan-erp/frontend/dist

    <Directory /var/www/dattvayaan-erp/frontend/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # SPA routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Proxy API to Backend
    ProxyPreserveHost On
    ProxyPass /api http://localhost:8888/api
    ProxyPassReverse /api http://localhost:8888/api

    # Logging
    ErrorLog ${APACHE_LOG_DIR}/dattvayaan-error.log
    CustomLog ${APACHE_LOG_DIR}/dattvayaan-access.log combined
</VirtualHost>
```

**Enable the site:**
```bash
# Enable required modules
sudo a2enmod ssl rewrite proxy proxy_http

# Enable site
sudo a2ensite dattvayaan.live.conf

# Test configuration
sudo apache2ctl configtest

# Restart Apache
sudo systemctl restart apache2
```

---

## URL Forwarding and Redirects

### WWW to Non-WWW Redirect (or vice versa)

#### Option 1: Redirect www to non-www (Recommended)

**In Nginx** (add before SSL server block):
```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.dattvayaan.live;

    ssl_certificate /etc/letsencrypt/live/dattvayaan.live/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dattvayaan.live/privkey.pem;

    return 301 https://dattvayaan.live$request_uri;
}
```

#### Option 2: Redirect non-www to www

**In Nginx:**
```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name dattvayaan.live;

    ssl_certificate /etc/letsencrypt/live/dattvayaan.live/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dattvayaan.live/privkey.pem;

    return 301 https://www.dattvayaan.live$request_uri;
}
```

### DNS-Level URL Forwarding

If using Cloudflare or your domain registrar:

1. **Cloudflare Page Rules:**
   - URL: `www.dattvayaan.live/*`
   - Forward to: `https://dattvayaan.live/$1`
   - Status Code: 301 (Permanent Redirect)

2. **Domain Registrar Forwarding:**
   - Most registrars offer URL forwarding in their control panel
   - Configure www → non-www (or vice versa)
   - Enable "301 Permanent Redirect"

---

## Application Configuration

### Backend Environment Variables

Update `/backend/.env`:

```env
# Production Configuration
NODE_ENV=production
PORT=8888

# Database
DATABASE=mongodb+srv://username:password@cluster.mongodb.net/dattva-yaan?retryWrites=true&w=majority

# Application URL (must match your domain)
APP_BASE_URL=https://dattvayaan.live/
BASE_URL=https://dattvayaan.live/
WEBSITE_URL=https://dattvayaan.live/

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Email Configuration
APP_EMAIL=noreply@dattvayaan.live
RESEND_API=re_your_resend_api_key

# File Storage (if using CDN)
PUBLIC_SERVER_FILE=https://dattvayaan.live/public/
# Or if using separate CDN:
# PUBLIC_SERVER_FILE=https://cdn.dattvayaan.live/public/

# Optional: DigitalOcean Spaces / S3
# DO_SPACES_KEY=your_spaces_key
# DO_SPACES_SECRET=your_spaces_secret
# DO_SPACES_NAME=your_bucket_name
# DO_SPACES_URL=https://your_bucket.nyc3.digitaloceanspaces.com
# REGION=nyc3
```

### Frontend Environment Variables

Update `/frontend/.env.production`:

```env
# Backend API URL
VITE_BACKEND_SERVER=https://dattvayaan.live/

# Website URL
VITE_WEBSITE_URL=https://dattvayaan.live/

# Optional: CDN for static files
# VITE_FILE_BASE_URL=https://cdn.dattvayaan.live/
```

### Allowed Origins Configuration

In `/backend/src/app.js`, the CORS configuration already includes:

```javascript
const ALLOWED_ORIGINS = [
  'https://dattvayaan.live',
  'https://www.dattvayaan.live'
];
```

This is already correctly configured for production.

---

## Verification Steps

### 1. DNS Propagation Check

Use these tools to verify DNS records:

```bash
# Check A record
dig dattvayaan.live A +short
dig www.dattvayaan.live A +short

# Check nameservers
dig dattvayaan.live NS

# Check all records
dig dattvayaan.live ANY
```

**Online Tools:**
- https://www.whatsmydns.net
- https://dnschecker.org
- https://mxtoolbox.com

### 2. SSL Certificate Verification

```bash
# Check SSL certificate
openssl s_client -connect dattvayaan.live:443 -servername dattvayaan.live

# Or use online tools:
# https://www.ssllabs.com/ssltest/
```

### 3. Application Connectivity Test

```bash
# Test HTTP to HTTPS redirect
curl -I http://dattvayaan.live

# Test HTTPS response
curl -I https://dattvayaan.live

# Test API endpoint
curl https://dattvayaan.live/api/ping
```

### 4. Frontend Loading

1. Open browser: https://dattvayaan.live
2. Check browser console for errors
3. Verify API calls are going to correct backend
4. Test login/signup functionality

### 5. Backend Health Check

```bash
# Check if backend is running
curl http://localhost:8888/api/ping

# Check from external
curl https://dattvayaan.live/api/ping
```

---

## Deployment Checklist

- [ ] Domain registered and active
- [ ] Nameservers configured (if using cloud DNS)
- [ ] DNS A records pointing to server IP
- [ ] DNS CNAME/A record for www subdomain
- [ ] DNS propagated (check with dig/online tools)
- [ ] SSL certificate obtained and installed
- [ ] Web server (Nginx/Apache) configured
- [ ] Web server reloaded with new configuration
- [ ] Backend .env configured with production URLs
- [ ] Frontend .env.production configured
- [ ] Backend running on port 8888
- [ ] Frontend built for production (`npm run build`)
- [ ] Frontend static files served by web server
- [ ] API proxy configured in web server
- [ ] CORS origins include production domain
- [ ] HTTP to HTTPS redirect working
- [ ] www redirect working (to non-www or vice versa)
- [ ] SSL certificate auto-renewal configured
- [ ] Application loads in browser
- [ ] API calls working from frontend
- [ ] Login/authentication working
- [ ] Static assets (images, CSS, JS) loading
- [ ] MongoDB connection working
- [ ] Email functionality working (if configured)

---

## Troubleshooting

### Issue: DNS not resolving

**Solution:**
- Wait 24-48 hours for full DNS propagation
- Clear local DNS cache: `sudo systemd-resolve --flush-caches` (Linux) or `ipconfig /flushdns` (Windows)
- Check nameservers at registrar match DNS provider

### Issue: SSL certificate errors

**Solution:**
- Ensure certificate covers both `dattvayaan.live` and `www.dattvayaan.live`
- Check certificate hasn't expired
- Verify certificate paths in web server config
- Run `sudo certbot renew` to renew Let's Encrypt certificates

### Issue: 502 Bad Gateway

**Solution:**
- Check backend is running: `pm2 status` or `systemctl status dattva-yaan-backend`
- Verify backend port in web server proxy configuration (should be 8888)
- Check backend logs for errors

### Issue: CORS errors

**Solution:**
- Verify `ALLOWED_ORIGINS` in `/backend/src/app.js` includes your domain
- Check protocol matches (http vs https)
- Ensure trailing slashes are consistent

### Issue: Frontend shows blank page

**Solution:**
- Check browser console for errors
- Verify frontend built correctly: `cd frontend && npm run build`
- Check web server is serving from correct directory
- Verify SPA routing configuration in web server

---

## Process Manager (Keeping Backend Running)

### Using PM2 (Recommended)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start backend with PM2
cd /var/www/dattvayaan-erp/backend
pm2 start npm --name "dattva-yaan-backend" -- run production

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup

# Useful PM2 commands
pm2 status
pm2 logs dattva-yaan-backend
pm2 restart dattva-yaan-backend
pm2 stop dattva-yaan-backend
```

### Using systemd service

Create `/etc/systemd/system/dattva-yaan-backend.service`:

```ini
[Unit]
Description=Dattva Yaan ERP Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/dattvayaan-erp/backend
ExecStart=/usr/bin/npm run production
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=dattva-yaan

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable dattva-yaan-backend
sudo systemctl start dattva-yaan-backend
sudo systemctl status dattva-yaan-backend
```

---

## Security Recommendations

1. **Firewall Configuration:**
   ```bash
   # Allow only necessary ports
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp  # SSH
   sudo ufw enable
   ```

2. **Keep Software Updated:**
   ```bash
   sudo apt update && sudo apt upgrade
   ```

3. **MongoDB Security:**
   - Use strong passwords
   - Restrict IP whitelist to your server IP only
   - Enable MongoDB authentication
   - Use connection string with SSL/TLS

4. **Environment Variables:**
   - Never commit `.env` files to git
   - Use strong JWT secrets (64+ characters)
   - Rotate secrets periodically

5. **Rate Limiting:**
   - Configure rate limiting in Nginx or application level
   - Protect against brute force attacks

6. **Backup:**
   - Regular MongoDB backups
   - Backup application files
   - Test restore procedures

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/mayankdevelops25/dattva-yaan-erp/issues
- Email: support@dattvayaan.live

---

**Last Updated:** 2026-03-20
**Version:** 1.0
