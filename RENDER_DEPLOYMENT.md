# Free Deployment on Render

Render.com offers free tier hosting perfect for LOBA:
- ✅ Free backend (auto-scales to zero when idle)
- ✅ Free PostgreSQL database
- ✅ Free frontend hosting
- ✅ Free SSL/HTTPS
- ✅ GitHub integration (auto-deploy on push)

**Limitation:** Services spin down after 15 mins of inactivity (wake-up takes ~30 seconds). Perfect for development/testing!

---

## **Phase 1: Prepare GitHub Repository**

### 1.1 Create GitHub Repo (if not already)
```bash
cd /path/to/LOBA_WebApp
git init
git add .
git commit -m "Initial commit: LOBA WebApp production ready"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/loba-webapp.git
git push -u origin main
```

### 1.2 Create `.gitignore` (prevent uploading secrets)
```bash
# In root of repo
echo "
.env*.local
.env.production
__pycache__/
*.pyc
node_modules/
dist/
.DS_Store
*.db
uploads/*
" > .gitignore

git add .gitignore
git commit -m "Add gitignore"
git push
```

---

## **Phase 2: Configure Backend for Render**

### 2.1 Create `render.yaml` (Infrastructure as Code)
This file tells Render how to deploy everything automatically.

Create at root: `/LOBA_WebApp/render.yaml`

```yaml
services:
  - type: web
    name: loba-backend
    runtime: python
    pythonVersion: 3.11
    region: oregon
    plan: free
    
    buildCommand: >
      cd loba-backend &&
      pip install -r requirements.txt
    
    startCommand: >
      cd loba-backend &&
      gunicorn -c gunicorn_config.py main:app
    
    envVars:
      - key: ENVIRONMENT
        value: production
      - key: DEBUG
        value: false
      - key: DATABASE_URL
        fromDatabase:
          name: loba-db
          property: connectionString
      - key: SECRET_KEY
        generateValue: true
      - key: CORS_ORIGINS
        value: https://loba-frontend.onrender.com
  
  - type: web
    name: loba-frontend
    runtime: node
    nodeVersion: 20
    region: oregon
    plan: free
    
    buildCommand: cd loba-frontend && npm install && npm run build
    staticPublishPath: loba-frontend/dist
    
    envVars:
      - key: VITE_API_BASE_URL
        value: https://loba-backend.onrender.com/api

databases:
  - name: loba-db
    engine: postgresql
    plan: free
    region: oregon
```

---

## **Phase 3: Deploy to Render**

### 3.1 Sign Up on Render
1. Go to https://render.com
2. Click "Get Started"
3. Sign in with GitHub

### 3.2 Connect GitHub Repository
1. In Render dashboard → "New +" → "Blueprint"
2. Select your GitHub repository (LOBA_WebApp)
3. Render automatically detects `render.yaml`
4. Click "Create New Blueprint Instance"

### 3.3 Configure Environment (takes ~2 mins)
Render automatically:
- ✅ Reads `render.yaml`
- ✅ Creates PostgreSQL database
- ✅ Builds backend & frontend
- ✅ Deploys both services
- ✅ Assigns URLs

### 3.4 Monitor Deployment
- Backend URL: `https://loba-backend.onrender.com`
- Frontend URL: `https://loba-frontend.onrender.com`
- Database: PostgreSQL (auto-configured)

View logs: Dashboard → Service → "Logs"

---

## **Phase 4: Update Database Driver**

Since Render uses PostgreSQL (not MySQL), update the backend:

Edit `loba-backend/requirements.txt`, replace:
```
pymysql==1.1.0
```
With:
```
psycopg2-binary==2.9.9
```

Commit and push:
```bash
git add loba-backend/requirements.txt
git commit -m "Switch to PostgreSQL for Render deployment"
git push
```

Render automatically redeploys on push! ✅

---

## **Phase 5: Initialize Database**

### 5.1 Add SSH Access (optional, for advanced setup)
Or use Render's built-in "Shell" in dashboard:

Dashboard → loba-backend → "Shell"

```bash
cd loba-backend
python -c "
from database import engine, Base
import models
Base.metadata.create_all(bind=engine)
print('✅ Database tables created!')
"
```

### 5.2 Create Admin User
```bash
python -c "
from database import SessionLocal
from models import Member
import bcrypt

db = SessionLocal()
hashed = bcrypt.hashpw(b'temppassword123', bcrypt.gensalt()).decode()

admin = Member(
    email='admin@youremail.com',
    full_name='Admin',
    phone='+1234567890',
    hashed_password=hashed,
    role='super_admin',
    is_active=True
)

db.add(admin)
db.commit()
print('✅ Admin user created!')
"
```

---

## **Phase 6: Test Deployment**

### 6.1 Check Services Running
```bash
# Backend health check
curl https://loba-backend.onrender.com/api/health
# Should return: {"status":"ok"}

# Frontend
Visit: https://loba-frontend.onrender.com
# Should see login page
```

### 6.2 Test Full Flow
1. Visit frontend URL
2. Click "Register" → create account
3. Login with new account
4. Access dashboard
5. Check network tab (DevTools) - API calls should go to backend URL

---

## **Phase 7: Custom Domain (Optional)**

Go to Frontend Service → Settings → Custom Domain
- Add your domain (e.g., loba.example.com)
- Update DNS records on your domain registrar
- Render auto-renews SSL ✅

---

## **Important Gotchas & Solutions**

### Gotcha 1: Backend Spins Down
Render's free tier spins down inactive services after 15 mins (no cost). First request takes ~30 seconds to wake.

**Solution for Production:** Upgrade to Paid ($7/month) to keep running 24/7.

### Gotcha 2: Database Size Limit
Free PostgreSQL: 256MB limit.

**Solution:** Monitor usage, or upgrade database ($15/month).

### Gotcha 3: Can't See Logs
**Solution:** In Render dashboard → Service → "Logs" tab (live, auto-updates)

### Gotcha 4: Environment Variables Not Updating
**Solution:** After changing `.env`, redeploy:
- Dashboard → Service → "Manual Deploy" → "Deploy Latest Commit"
- Or: `git commit --allow-empty -m "Redeploy" && git push`

---

## **Troubleshooting**

### Backend deployment fails
1. Check "Logs" tab in Render dashboard
2. Common issues:
   - Missing `requirements.txt`
   - Database string format wrong (use `postgresql://` not `mysql://`)
   - Build command has typo

### Frontend not loading
1. Check if `npm run build` succeeds in logs
2. Verify `staticPublishPath` in `render.yaml` is correct
3. Check Network tab - API calls should go to backend URL

### Can't connect to database
1. Check `DATABASE_URL` env var is set
2. Database must be in same region (oregon)
3. Use Render's Shell to test connection:
   ```bash
   psql $DATABASE_URL -c "SELECT 1;"
   ```

---

## **Next Steps for Production**

When ready to go bigger:

### Upgrade Backend ($7/month)
- Keeps service running 24/7
- More RAM and CPU
- Dashboard → loba-backend → Settings → Instance Type

### Upgrade Database ($15/month)
- Unlimited storage
- Better performance
- Dashboard → loba-db → Settings → Plan

### Add Custom Domain
- Dashboard → loba-frontend → Settings → Custom Domain
- Points to your domain (e.g., www.loba.example.com)
- Free SSL/HTTPS ✅

### Enable Cron Jobs (for backups, cleanup)
- Add to `render.yaml`:
  ```yaml
  - type: cron
    name: db-backup
    schedule: "0 2 * * *"
    command: "cd loba-backend && python backup_db.py"
  ```

### Add Email Notifications
- Render dashboard → Settings → Notifications
- Get alerts for deployment failures, crashes

---

## **Cost Estimate**

| Scenario | Monthly Cost |
|----------|-------------|
| Development (free tier, sleepy) | **$0** |
| Small production (24/7 backend) | **$7** (backend) |
| Production (24/7 + database) | **$22** (backend + database) |
| Production (24/7 + database + domain SSL) | **$25** (+$3 domain) |

---

## **Deploy Yourself Right Now! 🚀**

1. Push code to GitHub: `git push origin main`
2. Go to https://render.com → Sign in with GitHub
3. Click "New +" → "Blueprint"
4. Select this repo
5. Watch deployment complete in ~5 minutes
6. Visit the live URL!

Your app will be running for $0/month (with the free tier limitation of spinning down when idle).
