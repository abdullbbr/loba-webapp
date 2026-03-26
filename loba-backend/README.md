# LOBA Backend - FastAPI

## Setup & Run

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Or use the start script
chmod +x start.sh && ./start.sh
```

API docs available at: http://localhost:8000/docs

## Environment Variables
- SECRET_KEY: JWT secret key (change in production)
- DATABASE_URL: Database URL (defaults to SQLite loba.db)

## First Admin Account
Register normally, then use SQLite to set role:
  UPDATE members SET role='super_admin', is_active=1 WHERE email='your@email.com';
