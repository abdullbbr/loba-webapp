# Docker Production Deployment (Simplified)

This is an alternative to the traditional deployment guide - faster and more portable.

---

## **Prerequisites**

- [ ] Linux server with Docker & Docker Compose installed
- [ ] Domain name
- [ ] SSH access to server

---

## **Quick Setup**

### 1. Install Docker
```bash
sudo apt update && sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
sudo systemctl enable docker
```

### 2. Clone & Configure
```bash
cd /home/loba
git clone <your-repo> .
cd /home/loba

# Copy .env files
cp loba-backend/.env.production .env.backend
cp loba-frontend/.env.production .env.frontend

# Edit with your secrets
nano .env.backend
# Set: SECRET_KEY, MYSQL_ROOT_PASSWORD, MYSQL_USER, MYSQL_PASSWORD
```

### 3. Create Nginx Config for Docker
```bash
# Copy nginx.conf to nginx-docker.conf for the frontend
cp nginx.conf nginx-docker.conf
```

### 4. Start Services
```bash
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 5. Initialize Database
```bash
docker-compose exec backend python -c "
from database import engine, Base
import models
Base.metadata.create_all(bind=engine)
print('Database initialized!')
"
```

---

## **Common Commands**

```bash
# View logs
docker-compose logs backend

# Restart a service
docker-compose restart backend

# Stop all
docker-compose down

# Stop and remove volumes (careful!)
docker-compose down -v

# Get shell access to container
docker-compose exec backend bash
```

---

## **SSL with Let's Encrypt (Docker)**

```bash
# Create directories
mkdir -p certbot/conf certbot/www

# Generate certificate
docker run --rm -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot certbot/certbot \
  certonly --webroot -w /var/www/certbot \
  -d yourdomain.com -d www.yourdomain.com

# Update nginx.conf with SSL paths, then restart
docker-compose restart nginx
```

---

## **Backup Database (Docker)**

```bash
docker-compose exec mysql mysqldump -u root -p loba_prod > /backups/backup_$(date +%Y%m%d).sql
```
