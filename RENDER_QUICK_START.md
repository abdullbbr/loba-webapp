# Quick Render Deployment Checklist

## Before Deploying (5 minutes)

- [ ] Code committed to GitHub: `git push origin main`
- [ ] `render.yaml` exists in root folder
- [ ] `.gitignore` created (prevents .env.production from being uploaded)
- [ ] `requirements.txt` has `psycopg2-binary` (not `pymysql`)
- [ ] `loba-backend/gunicorn_config.py` updated for free tier
- [ ] GitHub account created
- [ ] Repository is public (or private if using paid GitHub)

---

## Deploy to Render (5 minutes)

1. Go to **https://render.com**
2. Click **"New +"** in top-right
3. Select **"Blueprint"**
4. Search for & select your **LOBA_WebApp** repository
5. Click **"Create New Blueprint Instance"**
6. Wait ~5 minutes for deployment to complete
7. View services:
   - **loba-backend**: https://loba-backend.onrender.com
   - **loba-frontend**: https://loba-frontend.onrender.com

---

## After Deployment (2 minutes)

### Create Tables & Admin User

1. Go to Render Dashboard
2. Click **loba-backend** service
3. Go to **"Shell"** tab (top-right)
4. Run:
```bash
cd loba-backend
python -c "
from database import engine, Base
import models
Base.metadata.create_all(bind=engine)
print('✅ Tables created!')
"
```

5. Create admin user:
```bash
python -c "
from database import SessionLocal
from models import Member
import bcrypt

db = SessionLocal()
hashed = bcrypt.hashpw(b'YourTempPassword123', bcrypt.gensalt()).decode()

admin = Member(
    email='youremail@example.com',
    full_name='Your Name',
    phone='+1234567890',
    hashed_password=hashed,
    role='super_admin',
    is_active=True
)
db.add(admin)
db.commit()
print('✅ Admin created! Login with your email')
"
```

---

## Test It Works

1. Visit: **https://loba-frontend.onrender.com**
2. Login with admin email & password
3. Check DevTools → Network tab → all API calls should succeed
4. Test: Create member, send message, etc.

---

## Cost

- **Free tier**: $0/month (service spins down after 15 mins inactivity)
- **Business tier**: $7/month (keeps service always running)

---

## Help!

See **RENDER_DEPLOYMENT.md** for detailed troubleshooting and next steps.
