# Deploy to Glitch (Truly Free - No Card Ever)

Glitch is perfect for LOBA:
- ✅ Free forever (no credit card)
- ✅ Auto-deploy from GitHub
- ✅ Free PostgreSQL database
- ✅ Always running (no spindown)
- ✅ 4GB datastore included

---

## **Step 1: Go to Glitch**

Visit: https://glitch.com

1. Click **"Sign in"** → **"Sign in with GitHub"**
2. Authorize Glitch to access your repos

---

## **Step 2: Import Your Repo**

1. Click **"New Project"** → **"Import from GitHub"**
2. Paste your repo: `abdullbbr/loba-webapp`
3. Click **"Import"**
4. Wait for Glitch to clone & analyze

---

## **Step 3: Configure Backend**

In Glitch editor:

1. Click **".glitchignore"** (create if missing)
2. Add:
```
.git
.gitignore
loba-frontend/
node_modules/
*.pyc
__pycache__
.env.production
render.yaml
fly.toml
Procfile
```

3. Click **"Logs"** (view deployed backend)
4. Should see: `✓ Your app is live at https://loba-backend-RANDOMNAME.glitch.me`

---

## **Step 4: Set Environment Variables**

In Glitch:

1. Click **".env"** 
2. Add:
```
DATABASE_URL=postgresql://...  (Glitch creates this)
ENVIRONMENT=production
CORS_ORIGINS=https://loba-frontend-RANDOMNAME.glitch.me
```

3. Save → Auto-redeploys

---

## **Step 5: Initialize Database**

In Glitch **Console** (click "Tools" → "Terminal"):

```bash
cd loba-backend
python -c "
from database import engine, Base
import models
Base.metadata.create_all(bind=engine)
print('✅ Tables created!')
"
```

---

## **Step 6: Deploy Frontend**

Create a **NEW Glitch project** for frontend:

1. **"New Project"** → **"Import from GitHub"** 
2. Same repo: `abdullbbr/loba-webapp`
3. Configure backend URL in env:
```
VITE_API_BASE_URL=https://loba-backend-RANDOMNAME.glitch.me/api
```

4. In Terminal:
```bash
cd loba-frontend
npm install
npm run build
```

5. Glitch serves `dist/` automatically

Your live URLs:
- **Backend:** `https://loba-backend-RANDOMNAME.glitch.me`
- **Frontend:** `https://loba-frontend-RANDOMNAME.glitch.me`

---

## **Step 7: Create Admin User**

In backend Glitch Console:

```bash
cd loba-backend
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
print('✅ Admin ready!')
"
```

---

## **Test It**

1. Visit: `https://loba-frontend-RANDOMNAME.glitch.me`
2. Login with admin email & password
3. Done! 🚀

---

## **Cost**

- **$0/month** - Genuinely free forever
- No credit card required
- No payment ever needed

---

## **Auto-Deploy Updates**

Every time you push to GitHub:
```bash
git push
```

Glitch auto-redeploys within 30 seconds! ✅

---

## **Glitch Features**

- Full terminal access
- Live logs
- Edit code in browser or locally
- PostgreSQL database built-in
- Always running (no spindown)
- Mix projects (combine multiple repos)

Start at: https://glitch.com
