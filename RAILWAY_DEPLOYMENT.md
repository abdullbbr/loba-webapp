# Deploy to Railway (Free - $5/month credits)

Railway is the best free option: $5 monthly credits (covers small app easily), no credit card required upfront.

---

## **Step 1: Deploy on Railway**

1. Go to: https://railway.app/
2. Click **"Start Project"** 
3. Select **"Deploy from GitHub"**
4. Authorize Railway to access your GitHub
5. Select **abdullbbr/loba-webapp** repo
6. Click **"Deploy Now"**

Railway auto-detects your setup and starts deploying! ✅

---

## **Step 2: Add Environment Variables**

Once deployment starts:

1. In Railway Dashboard → Click **"Variables"**
2. Add these manually:

```
DATABASE_URL = postgresql://...  (Railway creates this automatically)
CORS_ORIGINS = https://your-railway-backend-url.com
```

---

## **Step 3: Initialize Database**

1. In Railway Dashboard → Click your backend service
2. Click **"Connect"** tab
3. Open a terminal and run:

```bash
cd loba-backend
python -c "
from database import engine, Base
import models
Base.metadata.create_all(bind=engine)
print('✅ Tables created!')
"
```

4. Create admin:
```bash
python -c "
from database import SessionLocal
from models import Member
import bcrypt

db = SessionLocal()
hashed = bcrypt.hashpw(b'YourPassword123!', bcrypt.gensalt()).decode()

admin = Member(
    email='admin@example.com',
    full_name='Admin',
    phone='+1234567890',
    hashed_password=hashed,
    role='super_admin',
    is_active=True
)
db.add(admin)
db.commit()
print('✅ Admin created!')
"
```

---

## **Step 4: View Your Live App**

- Backend: `https://loba-backend-production.up.railway.app` (or similar Railway URL)
- Frontend: `https://loba-frontend-production.up.railway.app`

Both auto-assigned by Railway.

---

## **Cost**

- **$5/month free credits** = Runs entire app FOR FREE
- No credit card required upfront
- If you exceed $5, you can add payment then

---

## **Done!** 🚀

Your app is live for free! Every git push automatically redeploys.
