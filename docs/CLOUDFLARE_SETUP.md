# Cloudflare Pages Deployment Guide — BOM Manager

## Prerequisites

- GitHub repo `abeypa/bep-bom-manager` must be **Public**
- Cloudflare account (free tier works)
- Supabase project configured with tables and auth

---

## Step 1: Connect GitHub to Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **Workers & Pages** (left sidebar)
3. Click **Create** → **Pages** tab → **Connect to Git**
4. Select **GitHub** as provider
5. Authorize Cloudflare to access your GitHub
6. Select repository: `abeypa/bep-bom-manager`
7. Click **Begin setup**

---

## Step 2: Configure Build Settings

| Setting | Value |
|---------|-------|
| **Project name** | `bom-manager` |
| **Production branch** | `main` |
| **Framework preset** | `Vite` (or leave as None) |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (leave empty) |
| **Node.js version** | `20` (or leave default) |

---

## Step 3: Environment Variables

Click **Add variable** and add these:

| Variable Name | Value |
|---------------|-------|
| `VITE_SUPABASE_URL` | `https://jomsfmlhfutmibhbavdg.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_bz7toL6_jDrWIR55Re-NhQ_oKoHrT_d` |

---

## Step 4: Deploy

1. Click **Save and Deploy**
2. Wait 1-3 minutes for build to complete
3. Cloudflare will provide a URL like: `https://bom-manager.pages.dev`

---

## Verification Checklist

### Build Settings
- [ ] Repository: `abeypa/bep-bom-manager`
- [ ] Branch: `main`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

### Environment Variables
- [ ] `VITE_SUPABASE_URL` is set
- [ ] `VITE_SUPABASE_ANON_KEY` is set

### Post-Deploy
- [ ] Build completed without errors
- [ ] URL loads the login page
- [ ] Login with Supabase credentials works
- [ ] Dashboard redirects after login

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Failed to fetch repository` | Repo is private | Make repo public or grant Cloudflare access |
| `Build failed: npm error` | Missing dependency | Check `package.json`, run `npm install` locally |
| `Module not found` | Missing file | Ensure all source files are committed |
| `env undefined` | Missing env vars | Add Supabase env vars in Cloudflare settings |
| `404 on refresh` | SPA routing | Add `_redirects` file (see below) |

### Fix: SPA Routing (404 on page refresh)

Create file `public/_redirects`:
```
/*    /index.html   200
```

---

## Custom Domain (Optional)

1. Go to **Pages** → **bom-manager** → **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `bom.yourcompany.com`)
4. Follow DNS setup instructions

---

## Auto-Deploy on Push

Every push to `main` branch triggers automatic deployment.

To disable: Go to **Pages** → **Settings** → **Builds** → **Disable automatic build**

---

## Last Updated

- Date: April 2, 2026
- Repo: https://github.com/abeypa/bep-bom-manager
- Supabase: https://jomsfmlhfutmibhbavdg.supabase.co
