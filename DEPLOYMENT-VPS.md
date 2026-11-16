# Asra3.com (أسرع) — Production Deployment & EasyKash Go-Live Guide

**Repository:** `https://github.com/drjimmy1990/asra3-wazayef.git` (Branch: `main`)  
**VPS Directory:** `/www/wwwroot/asra3-wazayef`  
**Docker Binding:** `127.0.0.1:3645 -> Container 3000` (Isolated behind aaPanel Nginx)  
**Persistent Storage:** `/www/wwwroot/asra3-wazayef/.data` (`store.json`, `smtp-accounts.json`, `uploads/`)

---

## 1. Fresh Installation on Ubuntu VPS + aaPanel

Open **aaPanel → Terminal** (or SSH as `root`) and run:

```bash
# 1. Confirm Docker & Docker Compose v2
docker --version && docker compose version

# 2. Clone repository into isolated workspace
mkdir -p /www/wwwroot
cd /www/wwwroot
git clone -b main https://github.com/drjimmy1990/asra3-wazayef.git asra3-wazayef
cd /www/wwwroot/asra3-wazayef

# 3. Configure production environment variables
cp .env.example .env
sed -i 's/^APP_PORT=.*/APP_PORT=3645/' .env
nano .env
```

---

## 2. Production `.env` & EasyKash Payment Gateway Setup

Edit `/www/wwwroot/asra3-wazayef/.env`:

```env
APP_PORT=3645
NEXT_PUBLIC_APP_URL=https://asra3.com
NEXT_PUBLIC_SITE_URL=https://asra3.com

# Strong Admin Password (also signs HttpOnly admin cookies & private CV links)
ADMIN_PASSCODE=CHANGE_THIS_TO_A_STRONG_PASSWORD

# EasyKash DirectPayV1 Production Credentials
EASYKASH_API_KEY=your-live-easykash-directpay-api-key
EASYKASH_HMAC_SECRET=your-live-easykash-hmac-sha512-secret
EASYKASH_API_URL=https://back.easykash.net/api/directpayv1/pay
EASYKASH_INQUIRE_URL=https://back.easykash.net/api/cash-api/inquire
EASYKASH_CASH_EXPIRY_HOURS=24
# Leave blank to display ALL payment methods enabled on your EasyKash merchant account
EASYKASH_PAYMENT_OPTIONS=

# Currency Mode:
# Leave blank to bill each Gulf market in local currency (AED / SAR / QAR / KWD).
# If your EasyKash merchant profile only settles in EGP or USD right now, set EGP or USD here:
EASYKASH_CURRENCY_OVERRIDE=
```

### Required Settings Inside EasyKash Merchant Dashboard

1. Log into your **EasyKash Merchant Dashboard → Settings → Integration Settings**.
2. Copy your **DirectPay API Key** into `EASYKASH_API_KEY`.
3. Copy your **Secret Key (HMAC-SHA512)** into `EASYKASH_HMAC_SECRET`.
4. Set your **Callback / Webhook URL** to:
   ```text
   https://asra3.com/api/webhooks/easykash
   ```
5. Verify multi-currency collection (`AED`, `SAR`, `QAR`, `KWD`) is active on your EasyKash merchant profile—or temporarily set `EASYKASH_CURRENCY_OVERRIDE=EGP` until Gulf currencies are enabled on your EasyKash account.

> **Important Security Note:** Because [`markCampaignPaidAndStart`](file:///d:/WAZAYEF/src/lib/store.ts) and [`verifyEasyKashWebhook`](file:///d:/WAZAYEF/src/lib/easykash.ts) enforce HMAC-SHA512 verification in production, never leave `ENABLE_PAYMENT_SANDBOX=true` on your live site once `EASYKASH_API_KEY` and `EASYKASH_HMAC_SECRET` are set.

---

## 3. Build & Start the Production Container

```bash
cd /www/wwwroot/asra3-wazayef
docker compose up -d --build

# Check container status and health endpoint
docker compose ps
curl -s http://127.0.0.1:3645/api/health
```

Expected health JSON output:
```json
{"status":"ok","service":"asra3-platform", ...}
```

---

## 4. aaPanel Nginx Reverse Proxy & Let's Encrypt SSL

1. In **aaPanel → Website → PHP Project → Add site**:
   - **Domain:** `asra3.com` and `www.asra3.com`
   - **PHP Version:** `Pure Static`
2. Open site settings → **SSL → Let's Encrypt**, apply certificate for both `asra3.com` and `www.asra3.com`, and turn **Force HTTPS** ON.
3. Open site settings → **Reverse proxy → Add reverse proxy**:
   - **Proxy name:** `asra3-docker`
   - **Target URL:** `http://127.0.0.1:3645`
   - **Sent Domain:** `$host`
4. Open the proxy **Config** tab and verify `client_max_body_size 15M;` is set inside the `location /` block (see [`nginx/aapanel-reverse-proxy.conf`](file:///d:/WAZAYEF/nginx/aapanel-reverse-proxy.conf)) so 10 MB PDF/DOCX CVs upload cleanly.

---

## 5. Multi-SMTP Email Setup & Deliverability

1. Visit `https://asra3.com/admin` and unlock with your `ADMIN_PASSCODE`.
2. Open the **SMTP & Email** tab:
   - Click a 1-click preset (`Hostinger`, `Brevo SMTP`, `Amazon SES`, `Google Workspace`, `Zoho Mail`, or `aaPanel Mail`).
   - Add one or multiple SMTP accounts (stored persistently in `/www/wwwroot/asra3-wazayef/.data/smtp-accounts.json`).
   - Use **Send Test Email** to confirm instant inbox delivery before running campaigns.
3. Open the **Pricing & Go-Live** tab to inspect the live **Production Readiness Checklist**:
   - `EasyKash Live Gateway`: should read **LIVE**
   - `EasyKash HMAC-SHA512`: should read **ACTIVE**
   - `Multi-SMTP Rotation Pool`: should show at least **1 Active Mailer**
   - `Admin Passcode`: should confirm default demo passcode was changed
4. **Recommended DNS Records for `asra3.com` Inbox Placement:**
   - **SPF (`TXT` `@`):** Include your SMTP relay (e.g., Hostinger / Brevo / SES)
   - **DKIM (`TXT` / `CNAME`):** Paste keys from your email provider
   - **DMARC (`TXT` `_dmarc`):** `v=DMARC1; p=quarantine; rua=mailto:postmaster@asra3.com`

---

## 6. Day-to-Day Server Operations & Safe Updates

### Deploy Latest GitHub Updates
```bash
cd /www/wwwroot/asra3-wazayef
git pull origin main
docker compose up -d --build
curl -s http://127.0.0.1:3645/api/health
```

### Live Container Logs
```bash
cd /www/wwwroot/asra3-wazayef
docker compose logs -f --tail=100 asra3-web
```

### Backup Persistent Data (`.data/`)
```bash
tar -czf /root/asra3-data-backup-$(date +%F).tar.gz -C /www/wwwroot/asra3-wazayef .data .env
```

All customer campaigns, company directory edits, uploaded CVs, and SMTP configurations inside `/www/wwwroot/asra3-wazayef/.data` persist automatically across `docker compose up -d --build` restarts.
