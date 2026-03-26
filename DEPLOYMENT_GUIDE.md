# LOBA WebApp Production Deployment Guide

This guide covers deploying LOBA WebApp to a Linux server with MySQL, Nginx, and automatic SSL.

---

## **Pre-Deployment Checklist**

- [ ] Have a Linux server (Ubuntu 22.04 LTS recommended)
- [ ] Have a domain name pointing to the server
- [ ] SSH access to the server
- [ ] Sudo privileges on the server
- [ ] Basic Linux/command-line knowledge

---

## **Phase 1: Server Setup (Run on Linux Server)**

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3.11 python3-pip python3-venv git mysql-server nginx certbot python3-certbot-nginx curl
```

### 1.2 Create Application User
```bash
sudo useradd -m -s /bin/bash loba
sudo usermod -aG sudo loba
sudo su - loba
```

### 1.3 Clone Repository
```bash
cd /home/loba
git clone <your-repo-url> .
# Adjust permissions
sudo chown -R loba:loba /home/loba
```

---

## **Phase 2: Backend Setup**

### 2.1 Create Virtual Environment
```bash
cd /home/loba/loba-backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

### 2.2 Set Up Environment Variables
```bash
# Edit the .env.production file with your secrets
nano /home/loba/loba-backend/.env.production

# Required changes:
# - Generate SECRET_KEY: python -c "import secrets; print(secrets.token_urlsafe(32))"
# - Set DATABASE_URL (see Phase 3)
# - Set CORS_ORIGINS to your domain
```

### 2.3 Create Systemd Service
```bash
sudo cp /home/loba/loba-backend/loba-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable loba-backend
```

---

## **Phase 3: MySQL Database Setup**

### 3.1 Secure MySQL Installation
```bash
sudo mysql_secure_installation
# Follow prompts (remove anonymous users, disable remote root, remove test DB)
```

### 3.2 Create Production Database & User
```bash
sudo mysql -u root -p
```

Then execute in MySQL prompt:
```sql
CREATE DATABASE loba_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'loba_user'@'localhost' IDENTIFIED BY 'your_strong_password_here';
GRANT ALL PRIVILEGES ON loba_prod.* TO 'loba_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3.3 Update Backend .env.production
```bash
# Update this line with your MySQL credentials:
DATABASE_URL=mysql+pymysql://loba_user:your_strong_password_here@localhost:3306/loba_prod
```

### 3.4 Initialize Database
```bash
cd /home/loba/loba-backend
source venv/bin/activate
python -c "
from database import engine, Base
import models
Base.metadata.create_all(bind=engine)
print('Database tables created successfully!')
"
```

---

## **Phase 4: Frontend Build**

### 4.1 Install Node.js & Build
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash
sudo apt install -y nodejs

cd /home/loba/loba-frontend
npm install
npm run build
```

### 4.2 Verify Build Output
```bash
ls -la /home/loba/loba-frontend/dist
# Should show index.html, assets/, etc.
```

---

## **Phase 5: Nginx Configuration**

### 5.1 Update Nginx Config
```bash
# Copy provided nginx.conf
sudo cp /home/loba/nginx.conf /etc/nginx/sites-available/loba

# Edit domain names in the config
sudo nano /etc/nginx/sites-available/loba
# Replace all instances of 'yourdomain.com' with your actual domain

# Enable the site
sudo ln -s /etc/nginx/sites-available/loba /etc/nginx/sites-enabled/loba

# Disable default
sudo rm /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t
# Should output: "successful" and "configuration file test is successful"
```

### 5.2 Start Nginx
```bash
sudo systemctl enable nginx
sudo systemctl restart nginx
```

---

## **Phase 6: SSL Certificate (Let's Encrypt)**

### 6.1 Create Certbot Directory
```bash
sudo mkdir -p /var/www/certbot
sudo chown www-data:www-data /var/www/certbot
```

### 6.2 Generate SSL Certificate
```bash
sudo certbot certonly --webroot -w /var/www/certbot -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter your email
# - Accept terms
# - Choose to not redirect yet (we configured Nginx manually)
```

### 6.3 Set Up Auto-Renewal
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

---

## **Phase 7: Start Services**

### 7.1 Start Backend
```bash
sudo systemctl start loba-backend
sudo systemctl status loba-backend

# Check logs
sudo journalctl -u loba-backend -f
```

### 7.2 Verify Backend is Running
```bash
curl http://localhost:8000/api/health
# Should return: {"status":"ok"}
```

### 7.3 Test Complete Setup
```bash
# Visit in browser: https://yourdomain.com
# Should load the frontend
# Login should work if testing with existing data
```

---

## **Phase 8: Create Admin Account**

If starting fresh, create admin user:

```bash
cd /home/loba/loba-backend
source venv/bin/activate
python -c "
from database import SessionLocal, engine
from models import Member
import bcrypt

db = SessionLocal()
hashed = bcrypt.hashpw(b'temppassword123', bcrypt.gensalt()).decode()

admin = Member(
    email='admin@example.com',
    full_name='Admin User',
    phone='+1234567890',
    hashed_password=hashed,
    role='super_admin',
    is_active=True
)

db.add(admin)
db.commit()
print(f'Admin created: admin@example.com')
print('Change password on first login!')
"
```

---

## **Phase 9: Firewall Configuration**

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw enable
```

---

## **Production Monitoring & Maintenance**

### Check Service Status
```bash
sudo systemctl status loba-backend
sudo systemctl status nginx
```

### View Logs
```bash
# Backend errors
sudo journalctl -u loba-backend -n 50 -f

# Nginx errors
sudo tail -f /var/log/nginx/error.log

# Nginx access
sudo tail -f /var/log/nginx/access.log
```

### Restart Services (if needed)
```bash
sudo systemctl restart loba-backend
sudo systemctl reload nginx
```

### Database Backup
```bash
# Daily backup script
sudo mysql -u root -p loba_prod > /backups/loba_$(date +%Y%m%d).sql
```

---

## **Troubleshooting**

### Backend won't start
```bash
sudo journalctl -u loba-backend -n 100
# Check .env.production file
# Verify database connection
```

### Frontend not loading
```bash
# Check Nginx config
sudo nginx -t

# Check frontend files exist
ls -la /home/loba/loba-frontend/dist/

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Database connection errors
```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u loba_user -p -h localhost loba_prod
```

### SSL certificate errors
```bash
# Check certificate
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal

# Check Nginx SSL config
sudo nginx -t
```

---

## **Next Steps**

1. Set up automated backups for database and uploads
2. Configure email notifications (SMTP in .env)
3. Set up monitoring/alerting (Prometheus, Grafana, or use managed services)
4. Enable 2FA for admin accounts
5. Regularly update dependencies: `pip list --outdated`, `npm outdated`
6. Set up log rotation for Nginx/backend
