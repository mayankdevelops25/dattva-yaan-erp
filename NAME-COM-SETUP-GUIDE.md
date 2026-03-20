# Name.com Domain Setup Guide for dattvayaan.live

This guide provides step-by-step instructions for configuring your `dattvayaan.live` domain purchased from Name.com to work with the Dattva Yaan ERP application.

## Table of Contents

1. [Access Name.com DNS Settings](#access-namecom-dns-settings)
2. [Option A: Use Name.com DNS (Recommended for Simplicity)](#option-a-use-namecom-dns-recommended-for-simplicity)
3. [Option B: Use Cloudflare DNS (Recommended for Performance)](#option-b-use-cloudflare-dns-recommended-for-performance)
4. [Configure URL Forwarding](#configure-url-forwarding)
5. [Verification](#verification)
6. [Next Steps](#next-steps)

---

## Access Name.com DNS Settings

1. **Log into Name.com**
   - Go to https://www.name.com
   - Click "Sign In" in the top right
   - Enter your credentials

2. **Navigate to Domain Management**
   - After logging in, click on "My Account" or "Account"
   - Click on "Domains" or "Domain Manager"
   - Find `dattvayaan.live` in your domain list
   - Click on the domain name to access its settings

---

## Option A: Use Name.com DNS (Recommended for Simplicity)

This is the easiest option - use Name.com's built-in DNS management.

### Step 1: Verify Nameservers

1. Click on your domain `dattvayaan.live`
2. Look for "Nameservers" section
3. Default Name.com nameservers should be:
   ```
   ns1.name.com
   ns2.name.com
   ns3.name.com
   ns4.name.com
   ```
4. If they're different, click "Use Name.com Nameservers" or similar option

### Step 2: Add DNS Records

1. **Navigate to DNS Records**
   - In your domain settings, find "DNS Records" or "Manage DNS"
   - Click to access the DNS record management

2. **Add A Record for Root Domain (@)**
   ```
   Type: A
   Host: @ (or leave blank for root domain)
   Answer: YOUR_SERVER_IPv4_ADDRESS
   TTL: 300 (5 minutes for testing) or 3600 (1 hour)
   ```

   **Example:**
   ```
   Type: A
   Host: @
   Answer: 123.45.67.89
   TTL: 3600
   ```

3. **Add A Record for www Subdomain**
   ```
   Type: A
   Host: www
   Answer: YOUR_SERVER_IPv4_ADDRESS
   TTL: 3600
   ```

   **Example:**
   ```
   Type: A
   Host: www
   Answer: 123.45.67.89
   TTL: 3600
   ```

4. **Alternative: Use CNAME for www (instead of A record)**
   ```
   Type: CNAME
   Host: www
   Answer: dattvayaan.live
   TTL: 3600
   ```

5. **Click "Add Record" or "Save" for each record**

### Step 3: Optional Email Records

If you plan to send emails from your domain:

**SPF Record (TXT):**
```
Type: TXT
Host: @
Answer: "v=spf1 a mx ip4:YOUR_SERVER_IP ~all"
TTL: 3600
```

**DMARC Record (TXT):**
```
Type: TXT
Host: _dmarc
Answer: "v=DMARC1; p=none; rua=mailto:admin@dattvayaan.live"
TTL: 3600
```

### Step 4: Save Changes

- Click "Save Changes" or "Update DNS" at the bottom of the page
- DNS propagation can take 5 minutes to 48 hours (typically 1-2 hours)

---

## Option B: Use Cloudflare DNS (Recommended for Performance)

Using Cloudflare provides free CDN, DDoS protection, and SSL management.

### Step 1: Create Cloudflare Account

1. Go to https://cloudflare.com
2. Sign up for a free account
3. Verify your email address

### Step 2: Add Domain to Cloudflare

1. **Add Site**
   - After logging in, click "Add a Site"
   - Enter `dattvayaan.live`
   - Click "Add Site"

2. **Select Plan**
   - Choose "Free" plan
   - Click "Continue"

3. **Import DNS Records**
   - Cloudflare will scan your existing DNS records
   - Review and verify the records
   - Click "Continue"

### Step 3: Update Nameservers at Name.com

1. **Get Cloudflare Nameservers**
   - Cloudflare will show you 2 nameservers (example):
   ```
   alice.ns.cloudflare.com
   bob.ns.cloudflare.com
   ```
   - Keep this tab open or copy these nameservers

2. **Update at Name.com**
   - Go back to Name.com domain settings
   - Find "Nameservers" section
   - Select "Use Custom Nameservers"
   - Enter the 2 Cloudflare nameservers:
     - Nameserver 1: `alice.ns.cloudflare.com` (use your actual nameserver)
     - Nameserver 2: `bob.ns.cloudflare.com` (use your actual nameserver)
   - Click "Save Nameservers" or "Update"

3. **Verify in Cloudflare**
   - Go back to Cloudflare
   - Click "Done, check nameservers"
   - Cloudflare will verify the change (can take up to 24 hours)

### Step 4: Configure DNS Records in Cloudflare

Once nameservers are active:

1. **Go to DNS Settings**
   - In Cloudflare dashboard, click on your domain
   - Go to "DNS" section

2. **Add/Verify A Records**
   ```
   Type: A
   Name: @
   IPv4 address: YOUR_SERVER_IP
   Proxy status: Proxied (orange cloud)
   TTL: Auto
   ```

   ```
   Type: A
   Name: www
   IPv4 address: YOUR_SERVER_IP
   Proxy status: Proxied (orange cloud)
   TTL: Auto
   ```

3. **Configure SSL/TLS**
   - Go to "SSL/TLS" section
   - Set encryption mode to "Full (strict)"
   - This ensures end-to-end encryption

4. **Generate Origin Certificate**
   - Go to "SSL/TLS" → "Origin Server"
   - Click "Create Certificate"
   - Keep default settings (15-year validity)
   - Click "Create"
   - **Save both the certificate and private key** - you'll need these on your server

### Step 5: Cloudflare Additional Settings

**Page Rules for www Redirect (Optional):**
1. Go to "Rules" → "Page Rules"
2. Click "Create Page Rule"
3. URL pattern: `www.dattvayaan.live/*`
4. Setting: "Forwarding URL"
5. Status code: 301 (Permanent Redirect)
6. Destination URL: `https://dattvayaan.live/$1`
7. Click "Save and Deploy"

---

## Configure URL Forwarding

### Name.com URL Forwarding Feature

If you want to redirect www to non-www (or vice versa) at the DNS level:

1. **Navigate to URL Forwarding**
   - In Name.com domain settings
   - Find "URL Forwarding" section
   - Click "Manage Forwarding"

2. **Add Forwarding Rule**
   ```
   Source: www.dattvayaan.live
   Destination: https://dattvayaan.live
   Type: 301 (Permanent)
   ```

3. **Save the Rule**

**Note:** This is optional if you're configuring redirects in your web server (Nginx/Apache) as described in the main deployment guide.

---

## Verification

### Check DNS Propagation

**Using Command Line:**
```bash
# Check root domain
dig dattvayaan.live +short

# Check www subdomain
dig www.dattvayaan.live +short

# Check nameservers
dig dattvayaan.live NS +short
```

**Using Online Tools:**
- https://www.whatsmydns.net - Check global DNS propagation
- https://dnschecker.org - Verify DNS records worldwide
- https://mxtoolbox.com/SuperTool.aspx - Comprehensive DNS testing

### Expected Results

For **Option A (Name.com DNS):**
```bash
$ dig dattvayaan.live NS +short
ns1.name.com.
ns2.name.com.
ns3.name.com.
ns4.name.com.

$ dig dattvayaan.live +short
123.45.67.89  # Your server IP
```

For **Option B (Cloudflare DNS):**
```bash
$ dig dattvayaan.live NS +short
alice.ns.cloudflare.com.
bob.ns.cloudflare.com.

$ dig dattvayaan.live +short
104.x.x.x  # Cloudflare proxy IP
```

### Test Domain in Browser

1. Open browser
2. Go to `http://dattvayaan.live` (before SSL is configured)
3. You should see your server (might be error if server isn't configured yet)

---

## Next Steps

After your DNS is configured and propagated, proceed with server setup:

### 1. Install SSL Certificate

Follow the guide in [DEPLOYMENT-DNS-CONFIGURATION.md](./DEPLOYMENT-DNS-CONFIGURATION.md#ssltls-certificate-setup)

**For Cloudflare (Option B):**
- Install the Origin Certificate on your server
- Copy the certificate content to: `/etc/ssl/certs/dattvayaan-origin.pem`
- Copy the private key to: `/etc/ssl/private/dattvayaan-origin.key`
- Update Nginx configuration to use these certificates

**For Name.com DNS (Option A):**
```bash
# Install Let's Encrypt
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d dattvayaan.live -d www.dattvayaan.live
```

### 2. Configure Web Server

Follow the Nginx or Apache configuration in:
- [DEPLOYMENT-DNS-CONFIGURATION.md](./DEPLOYMENT-DNS-CONFIGURATION.md#web-server-configuration)

### 3. Configure Application

1. **Backend Environment** (`/backend/.env`):
   ```env
   NODE_ENV=production
   PORT=8888
   DATABASE=mongodb+srv://username:password@cluster.mongodb.net/dattva-yaan
   APP_BASE_URL=https://dattvayaan.live/
   JWT_SECRET=your_secure_secret_here
   APP_EMAIL=noreply@dattvayaan.live
   ```

2. **Frontend Environment** (`/frontend/.env.production`):
   ```env
   VITE_BACKEND_SERVER=https://dattvayaan.live/
   VITE_WEBSITE_URL=https://dattvayaan.live/
   ```

### 4. Deploy Application

Follow the complete deployment guide:
- **Quick Reference:** [DNS-QUICK-START.md](./DNS-QUICK-START.md)
- **Complete Guide:** [DEPLOYMENT-DNS-CONFIGURATION.md](./DEPLOYMENT-DNS-CONFIGURATION.md)

---

## Name.com Specific Tips

### DNS Record Management

- **Editing Records:** Click the pencil icon next to any record to edit
- **Deleting Records:** Click the trash icon to delete
- **TTL Values:** Lower TTL (300-600) during initial setup for faster updates, then increase to 3600 after everything works

### Common Name.com Settings Locations

- **Domain Dashboard:** Account → Domains → Click domain name
- **DNS Records:** Domain Dashboard → Manage → DNS Records
- **Nameservers:** Domain Dashboard → Manage → Nameservers
- **URL Forwarding:** Domain Dashboard → Manage → URL Forwarding
- **WHOIS Privacy:** Included free with most Name.com domains
- **Auto-Renew:** Domain Dashboard → Settings → Auto-Renew

### Name.com Support Resources

- **Knowledge Base:** https://www.name.com/support
- **DNS Documentation:** https://www.name.com/support/articles/205188538-Managing-DNS-records
- **Support Ticket:** Account → Support → Create Ticket
- **Live Chat:** Available during business hours

---

## Troubleshooting

### Issue: DNS Not Resolving

**Check 1: Wait for Propagation**
- DNS changes can take 5 minutes to 48 hours
- Use https://www.whatsmydns.net to check global propagation

**Check 2: Verify Records in Name.com**
- Log into Name.com
- Check DNS records are correctly entered
- Verify no typos in IP address or hostnames

**Check 3: Clear Local DNS Cache**
```bash
# Linux
sudo systemd-resolve --flush-caches

# macOS
sudo dscacheutil -flushcache

# Windows
ipconfig /flushdns
```

### Issue: Nameserver Changes Not Taking Effect

- Nameserver changes at Name.com typically take 1-24 hours
- Check current nameservers: `dig dattvayaan.live NS +short`
- If old nameservers still show, wait longer or contact Name.com support

### Issue: SSL Certificate Errors

**If using Cloudflare:**
- Ensure SSL/TLS mode is "Full (strict)"
- Install Origin Certificate on your server
- Check certificate paths in web server configuration

**If using Let's Encrypt:**
- Ensure DNS is fully propagated before running certbot
- Check that port 80 is open and accessible
- Verify domain resolves to correct server IP

### Issue: Website Not Loading

1. **Check DNS:** `dig dattvayaan.live +short`
2. **Check Server:** `curl -I http://YOUR_SERVER_IP`
3. **Check Web Server:** `sudo systemctl status nginx`
4. **Check Application:** `pm2 status` or check backend logs
5. **Check Firewall:** `sudo ufw status`

---

## Quick Command Reference

```bash
# Check DNS records
dig dattvayaan.live +short
dig www.dattvayaan.live +short
dig dattvayaan.live NS +short

# Check nameservers globally
nslookup -type=NS dattvayaan.live 8.8.8.8

# Test HTTP response
curl -I http://dattvayaan.live
curl -I https://dattvayaan.live

# Check SSL certificate
openssl s_client -connect dattvayaan.live:443 -servername dattvayaan.live

# Monitor DNS propagation
watch -n 5 'dig dattvayaan.live +short'
```

---

## Checklist

Use this checklist to track your Name.com setup progress:

- [ ] Logged into Name.com account
- [ ] Located `dattvayaan.live` domain in domain manager
- [ ] Decided on DNS option (Name.com DNS or Cloudflare)
- [ ] Configured nameservers (if using Cloudflare)
- [ ] Added A record for @ (root domain)
- [ ] Added A record for www subdomain
- [ ] Added optional email records (SPF, DMARC)
- [ ] Verified DNS records in Name.com dashboard
- [ ] Checked DNS propagation with dig or online tools
- [ ] Waited for DNS propagation (15 mins - 24 hours)
- [ ] Verified domain resolves to correct IP
- [ ] Proceeded with SSL certificate installation
- [ ] Configured web server (Nginx/Apache)
- [ ] Configured application environment variables
- [ ] Tested website loads in browser
- [ ] Tested API endpoints working
- [ ] Configured URL forwarding/redirects (if needed)

---

## Additional Resources

- **Name.com Documentation:** https://www.name.com/support
- **Complete Deployment Guide:** [DEPLOYMENT-DNS-CONFIGURATION.md](./DEPLOYMENT-DNS-CONFIGURATION.md)
- **Quick Start Guide:** [DNS-QUICK-START.md](./DNS-QUICK-START.md)
- **Installation Instructions:** [INSTALLATION-INSTRUCTIONS.md](./INSTALLATION-INSTRUCTIONS.md)

---

## Getting Help

If you need assistance:

1. **Name.com Support:**
   - Email: support@name.com
   - Phone: Available on support page
   - Live Chat: During business hours
   - Ticket System: https://www.name.com/support

2. **Repository Issues:**
   - GitHub Issues: https://github.com/mayankdevelops25/dattva-yaan-erp/issues

3. **Community:**
   - Check GitHub discussions and issues for similar problems
   - Review the complete deployment documentation

---

**Last Updated:** 2026-03-20
**Domain Registrar:** Name.com
**Application:** Dattva Yaan ERP
