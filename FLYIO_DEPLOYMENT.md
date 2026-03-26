# Deploy to Fly.io (Truly Free, No Card)

Fly.io offers genuine free tier with generous limits:
- ✅ 3 shared CPU cores total per organization (FREE)
- ✅ 3GB RAM across apps (FREE)
- ✅ 30GB storage (FREE)
- ✅ Perfect for LOBA deployment

---

## **Prerequisites**

1. Install Fly CLI: https://fly.io/docs/hands-on/install-flyctl/
   ```bash
   # On Windows:
   choco install flyctl
   # Or download: https://github.com/superfly/flyctl/releases
   ```

2. Sign up: https://fly.io/

3. Login: `flyctl auth login`

---

## **Step 1: Create Fly Apps**

### Backend App
```bash
cd loba-backend

# Create app
flyctl apps create loba-backend

# Deploy
flyctl deploy
```

### Frontend App  
```bash
cd ../loba-frontend

# Create app
flyctl apps create loba-frontend

# Deploy
flyctl deploy
```

---

## **Step 2: Create PostgreSQL Database**

```bash
# Create shared PostgreSQL (free tier)
flyctl postgres create --org personal loba-db

# Get connection string
flyctl postgres users create flyway --admin
```

---

## **Step 3: Set Environment Variables**

### Backend
```bash
cd loba-backend

flyctl secrets set \
  DATABASE_URL="postgresql://..." \
  CORS_ORIGINS="https://loba-frontend.fly.dev"

flyctl deploy
```

### Frontend
```bash
cd ../loba-frontend

flyctl secrets set \
  VITE_API_BASE_URL="https://loba-backend.fly.dev/api"

flyctl deploy
```

---

## **Step 4: Initialize Database**

```bash
# SSH into backend
flyctl ssh console -a loba-backend

# Inside container:
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

exit
```

---

## **Your Live App**

- Frontend: `https://loba-frontend.fly.dev`
- Backend: `https://loba-backend.fly.dev`
- API: `https://loba-backend.fly.dev/api`

---

## **Cost: $0/month**

Genuinely free forever (within free tier limits). No credit card needed.

---

## **View Logs & Monitor**

```bash
# View logs
flyctl logs -a loba-backend
flyctl logs -a loba-frontend

# Monitor
flyctl monitor -a loba-backend
```

---

## **Deploy Updates**

Every `git push` won't auto-deploy. To update:
```bash
git push
flyctl deploy -a loba-backend
flyctl deploy -a loba-frontend
```

Or set up GitHub Actions for auto-deploy (see FLY_API_TOKEN docs).
