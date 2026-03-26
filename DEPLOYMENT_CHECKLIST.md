# Production Deployment Checklist

Complete this checklist before going live.

---

## **Pre-Launch Configuration**

### Backend
- [ ] Update `.env.production` with strong `SECRET_KEY`
- [ ] Set `DATABASE_URL` to production MySQL server
- [ ] Set `CORS_ORIGINS` to your domain only (not "*")
- [ ] Change `ENVIRONMENT=production`
- [ ] Verify `gunicorn_config.py` has correct worker count
- [ ] Test backend with: `python -m pytest` (if tests exist)
- [ ] Create admin user account
- [ ] Review and secure all API endpoints

### Frontend
- [ ] Build production bundle: `npm run build`
- [ ] Verify `dist/` folder exists and has files
- [ ] Test API calls work in production mode
- [ ] Check `api.js` uses correct endpoint
- [ ] Verify no hardcoded `localhost` URLs
- [ ] Test all auth flows (login, register, logout)

### Database
- [ ] MySQL database created: `loba_prod`
- [ ] Database user created with strong password
- [ ] Database user has only needed permissions
- [ ] Tables initialized successfully
- [ ] Initial data seeded (if needed)
- [ ] Backup strategy in place

### Nginx
- [ ] `nginx.conf` domain names updated
- [ ] SSL certificate paths correct
- [ ] Proxy settings point to backend port 8000
- [ ] Static file paths correct
- [ ] Compression enabled
- [ ] Security headers added

### SSL/HTTPS
- [ ] SSL certificate obtained from Let's Encrypt
- [ ] Certificate paths in Nginx config verified
- [ ] Auto-renewal scheduled
- [ ] Test HTTPS access works
- [ ] No mixed content warnings

### Security
- [ ] Firewall configured (UFW or AWS Security Groups)
- [ ] SSH key-only authentication (no passwords)
- [ ] Remove debug mode from FastAPI
- [ ] Database backups encrypted and stored securely
- [ ] Log files not world-readable
- [ ] No sensitive data in version control
- [ ] CORS properly restricted
- [ ] CSRF protection enabled if needed

### Monitoring
- [ ] Error logging configured
- [ ] Uptime monitoring in place (StatusCake, Pingdom, etc.)
- [ ] Email alerts for service failures
- [ ] Log aggregation set up (optional)

---

## **Deployment Day**

### Pre-Deployment
- [ ] Full database backup taken
- [ ] All code committed and uploaded
- [ ] .env.production file securely copied to server
- [ ] Server resources checked (disk space, RAM)

### Deployment Steps
1. [ ] Clone repo on production server
2. [ ] Install dependencies (pip & npm)
3. [ ] Build frontend: `npm run build`
4. [ ] Initialize database
5. [ ] Configure Nginx
6. [ ] Enable SSL certificate
7. [ ] Start backend service
8. [ ] Start Nginx
9. [ ] Test all endpoints work

### Post-Deployment Testing
- [ ] Visit domain in browser - loads without errors
- [ ] Status page works: `/api/health` returns 200
- [ ] Login page loads
- [ ] Can create new account
- [ ] Can login with credentials
- [ ] Dashboard loads with user data
- [ ] API requests work (check Network tab in DevTools)
- [ ] Uploads work (if applicable)
- [ ] HTTPS redirect works (http → https)
- [ ] SSL certificate valid (green padlock)

### Post-Launch Monitoring
- [ ] Monitor error logs for 24 hours
- [ ] Check CPU/Memory usage
- [ ] Verify SSL auto-renewal is scheduled
- [ ] Confirm all background jobs running
- [ ] Test admin functions work

---

## **Post-Launch**

### Maintenance Schedule
- [ ] Weekly: Review error logs
- [ ] Weekly: Check disk space usage
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review and rotate logs
- [ ] Quarterly: Security audit
- [ ] Quarterly: Performance review
- [ ] Immediately: Monitor after any code changes

### Backup Strategy
- [ ] Daily: Automated database backups
- [ ] Weekly: Test restore from backup
- [ ] Monthly: Archive old backups
- [ ] Store backups: Off-site encrypted location

### Scaling (if needed)
- [ ] Add more Gunicorn workers
- [ ] Set up database read replicas
- [ ] Add caching layer (Redis)
- [ ] CDN for frontend assets
- [ ] Load balancer if running multiple instances

---

## **Rollback Plan**

If deployment fails:
1. [ ] Have previous database backup ready
2. [ ] Have previous code version git tags
3. [ ] Document rollback procedures
4. [ ] Test rollback process before going live

---

## **Communication**

- [ ] Inform users of scheduled maintenance window
- [ ] Update status page during deployment
- [ ] Send completion notice to stakeholders
- [ ] Document any issues or surprises during deployment
