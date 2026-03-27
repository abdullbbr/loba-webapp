# Deploy to Replit (Free, No Card - Final Option!)

Replit offers:
- ✅ Free tier (no credit card ever needed)
- ✅ Full Python/Node support
- ✅ SQLite database included
- ✅ Web hosting
- ✅ Runs 24/7 (with minor limitations on free tier)

---

## **Step 1: Go to Replit**

Visit: https://replit.com

1. Click **"Sign Up"** → **"Sign up with GitHub"**
2. Authorize Replit → Redirect to Replit
3. Done!

---

## **Step 2: Create Backend Repl**

1. Click **"+ Create"**
2. Select **"Import from GitHub"**
3. Paste: `abdullbbr/loba-webapp`
4. Choose folder: **`loba-backend`** (or import full repo)
5. Click **"Import"**

---

## **Step 3: Configure Backend**

In Replit editor:

1. Click **".replit"** (or create it)
2. Set content:
```
run = "cd loba-backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"
```

3. Click **"Secrets"** (lock icon) → Add:
```
DATABASE_URL = sqlite:///./loba.db
ENVIRONMENT = production
CORS_ORIGINS = https://loba-frontend-USERNAME.replit.dev
```

4. Click **"Run"** → Backend starts! ✅
5. View at: `https://loba-backend-USERNAME.replit.dev`

---

## **Step 4: Initialize Database**

In Replit **Shell**:

```bash
cd loba-backend
python -c "
from database import engine, Base
import models
Base.metadata.create_all(bind=engine)
print('✅ Tables created!')
"
```

Create admin:
```bash
python -c "
from database import SessionLocal
from models import Member
import bcrypt

db = SessionLocal()
hashed = bcrypt.hashpw(b'Password123!', bcrypt.gensalt()).decode()

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
print('✅ Admin ready!')
"
```

---

## **Step 5: Create Frontend Repl**

1. Click **"+ Create"** → **"Import from GitHub"**
2. Same repo: `abdullbbr/loba-webapp`
3. Choose folder: **`loba-frontend`**
4. Click **"Import"**

In Replit editor:

1. Click **".replit"**:
```
run = "cd loba-frontend && npm install && npm run dev"
```

2. Click **"Secrets"** → Add:
```
VITE_API_BASE_URL = https://loba-backend-USERNAME.replit.dev/api
```

3. Click **"Run"**
4. Frontend at: `https://loba-frontend-USERNAME.replit.dev`

---

## **Step 6: Test Your App**

1. Click frontend link from Replit
2. Login with admin email & password
3. Done! 🚀

---

## **Your Live URLs**

- **Backend:** `https://loba-backend-USERNAME.replit.dev`
- **Frontend:** `https://loba-frontend-USERNAME.replit.dev`

---

## **Cost: $0/month**

- No credit card required
- Free tier limits: 0.5GB RAM, but enough for LOBA
- Can upgrade later if needed ($7/month for more power)

---

## **Auto-Deploy**

Connect GitHub repo in Replit settings → Auto-redeploy on push! ✅

---

## **Limitations (free tier)**

- Stops after 1 hour of inactivity (wakes on next request)
- 0.5GB RAM (sufficient for LOBA)
- SQLite only (no PostgreSQL)

All manageable for development/small usage!

**Start at:** https://replit.com
