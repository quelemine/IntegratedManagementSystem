# Deployment Checklist
**Integrated Management System v1.0.0**

**Version:** 1.0.0  
**Last Updated:** July 23, 2026

---

## Pre-Deployment Checklist

### 1. Environment Preparation
- [ ] **Server Provisioned**
  - [ ] Server acquired (2+ cores, 4GB RAM minimum)
  - [ ] Operating system installed (Ubuntu 20.04+)
  - [ ] SSH access configured
  - [ ] Firewall rules configured (ports 22, 80, 443)
  - [ ] DNS records configured (A record for domain)

- [ ] **Software Installed**
  - [ ] Node.js v18+ installed
  - [ ] PostgreSQL v14+ installed
  - [ ] Nginx v1.18+ installed
  - [ ] PM2 v5+ installed globally
  - [ ] Git installed

- [ ] **Database Setup**
  - [ ] PostgreSQL user created
  - [ ] Database created
  - [ ] Privileges granted
  - [ ] Connection tested
  - [ ] Backup directory created

### 2. Application Configuration
- [ ] **Environment Variables**
  - [ ] .env file created from .env.example
  - [ ] NODE_ENV set to 'production'
  - [ ] PORT configured (default 5000)
  - [ ] CLIENT_URL set to production domain
  - [ ] Database credentials configured
  - [ ] JWT_SECRET set (secure, 32+ characters)
  - [ ] JWT_REFRESH_SECRET set (secure, 32+ characters)
  - [ ] CORS_ORIGIN set to production domain
  - [ ] All variables verified

- [ ] **Repository Setup**
  - [ ] Repository cloned to server
  - [ ] Git remote configured
  - [ ] Production branch checked out
  - [ ] .gitignore reviewed for sensitive files

### 3. Security Configuration
- [ ] **SSL Certificate**
  - [ ] SSL certificate obtained
  - [ ] Certificate installed
  - [ ] Certificate chain configured
  - [ ] HTTPS accessible
  - [ ] HTTP redirects to HTTPS
  - [ ] SSL auto-renewal configured

- [ ] **Security Headers**
  - [ ] X-Frame-Options configured
  - [ ] X-Content-Type-Options configured
  - [ ] X-XSS-Protection configured
  - [ ] Strict-Transport-Security configured
  - [ ] Content-Security-Policy configured

---

## Deployment Checklist

### 4. Backend Deployment
- [ ] **Dependencies Installation**
  - [ ] Navigate to server directory
  - [ ] Run `npm install --production`
  - [ ] Verify installation completed
  - [ ] Check for security vulnerabilities

- [ ] **Directory Setup**
  - [ ] Create logs directory
  - [ ] Create uploads directory
  - [ ] Set proper permissions (755)

- [ ] **Database Migration**
  - [ ] Backup current database (if exists)
  - [ ] Run `npx knex migrate:latest`
  - [ ] Verify migration status
  - [ ] Run seeds if required

- [ ] **PM2 Configuration**
  - [ ] Create ecosystem.config.js
  - [ ] Configure cluster mode (2 instances)
  - [ ] Set memory limit (1GB)
  - [ ] Configure log files
  - [ ] Test PM2 configuration
  - [ ] Start application with PM2
  - [ ] Save PM2 process list
  - [ ] Configure PM2 startup script

- [ ] **Backend Verification**
  - [ ] Check PM2 status
  - [ ] Check application logs
  - [ ] Test health check endpoint
  - [ ] Verify database connection
  - [ ] Verify API endpoints respond

### 5. Frontend Deployment
- [ ] **Dependencies Installation**
  - [ ] Navigate to client directory
  - [ ] Run `npm install --production`
  - [ ] Verify installation completed

- [ ] **Environment Configuration**
  - [ ] Create .env.production
  - [ ] Set VITE_API_URL to production domain
  - [ ] Verify configuration

- [ ] **Production Build**
  - [ ] Run `npm run build`
  - [ ] Verify build completed
  - [ ] Check dist directory exists
  - [ ] Verify build size reasonable

- [ ] **Nginx Configuration**
  - [ ] Create server block configuration
  - [ ] Configure HTTP to HTTPS redirect
  - [ ] Configure SSL certificates
  - [ ] Configure reverse proxy for API
  - [ ] Configure static file serving
  - [ ] Configure security headers
  - [ ] Configure gzip compression
  - [ ] Configure caching for static assets
  - [ ] Test Nginx configuration
  - [ ] Restart Nginx

---

## Post-Deployment Checklist

### 6. Health Checks
- [ ] **Application Health**
  - [ ] Health check endpoint returns 200
  - [ ] Database status shows "connected"
  - [ ] Uptime reported correctly
  - [ ] Environment shows "production"
  - [ ] Version reported correctly

- [ ] **Service Status**
  - [ ] PM2 process running
  - [ ] Nginx running
  - [ ] PostgreSQL running
  - [ ] All services enabled on boot

### 7. Functional Testing
- [ ] **Authentication**
  - [ ] Login page loads
  - [ ] Valid credentials work
  - [ ] Invalid credentials rejected
  - [ ] Token generation works
  - [ ] Token refresh works
  - [ ] Logout works

- [ ] **Role-Based Access**
  - [ ] Admin can access all features
  - [ ] Principal can access academic features
  - [ ] Teacher can access teaching features
  - [ ] Student can access student features
  - [ ] Parent can access parent features
  - [ ] Unauthorized access blocked

- [ ] **Core Features**
  - [ ] Dashboard loads correctly
  - [ ] Students page loads
  - [ ] Teachers page loads
  - [ ] Classes page loads
  - [ ] Attendance page loads
  - [ ] Assignments page loads
  - [ ] Grades page loads
  - [ ] Fees page loads
  - [ ] Invoices page loads
  - [ ] Payments page loads
  - [ ] Financial reports page loads
  - [ ] Messages page loads
  - [ ] Announcements page loads
  - [ ] Notifications page loads

- [ ] **API Endpoints**
  - [ ] All API endpoints respond
  - [ ] Authentication required on protected routes
  - [ ] Rate limiting works
  - [ ] Error responses consistent
  - [ ] CORS headers correct

### 8. Security Verification
- [ ] **Security Headers**
  - [ ] X-Frame-Options header present
  - [ ] X-Content-Type-Options header present
  - [ ] X-XSS-Protection header present
  - [ ] Strict-Transport-Security header present
  - [ ] Content-Security-Policy header present

- [ ] **SSL/TLS**
  - [ ] SSL certificate valid
  - [ ] Certificate not expired
  - [ ] TLS 1.2+ enforced
  - [ ] Weak ciphers disabled
  - [ ] Certificate chain complete

- [ ] **Access Control**
  - [ ] Firewall rules active
  - [ ] SSH access restricted
  - [ ] Database access restricted
  - [ ] File permissions correct
  - [ ] No exposed secrets

### 9. Performance Verification
- [ ] **Performance Metrics**
  - [ ] Page load times acceptable (< 3 seconds)
  - [ ] API response times acceptable (< 500ms)
  - [ ] Database queries efficient
  - [ ] No memory leaks detected
  - [ ] CPU usage normal
  - [ ] Memory usage normal

- [ ] **Resource Usage**
  - [ ] CPU usage < 80%
  - [ ] Memory usage < 80%
  - [ ] Disk space sufficient
  - [ ] Network bandwidth sufficient

### 10. Monitoring Setup
- [ ] **Application Monitoring**
  - [ ] PM2 monitoring configured
  - [ ] Log rotation configured
  - [ ] Error log monitoring setup
  - [ ] Uptime monitoring configured
  - [ ] Performance monitoring configured

- [ ] **Database Monitoring**
  - [ ] Database connection monitoring
  - [ ] Query performance monitoring
  - [ ] Disk space monitoring
  - [ ] Backup verification

- [ ] **Alert Configuration**
  - [ ] Health check failure alerts
  - [ ] Error rate alerts
  - [ ] Response time alerts
  - [ ] Disk space alerts
  - [ ] Database connection alerts

---

## User Acceptance Testing

### 11. User Testing
- [ ] **Admin Test**
  - [ ] Login successful
  - [ ] Dashboard accessible
  - [ ] User management works
  - [ ] School management works
  - [ ] All features accessible

- [ ] **Principal Test**
  - [ ] Login successful
  - [ ] Academic management accessible
  - [ ] Financial reports accessible
  - [ ] Announcements accessible
  - [ ] Appropriate restrictions in place

- [ ] **Teacher Test**
  - [ ] Login successful
  - [ ] Class management accessible
  - [ ] Attendance tracking works
  - [ ] Assignment management works
  - [ ] Grading works
  - [ ] Messaging works

- [ ] **Student Test**
  - [ ] Login successful
  - [ ] Dashboard accessible
  - [ ] Grades viewable
  - [ ] Assignments viewable
  - [ ] Notifications working
  - [ ] Appropriate restrictions in place

- [ ] **Parent Test**
  - [ ] Login successful
  - [ ] Child's grades viewable
  - [ ] Child's attendance viewable
  - [ ] Announcements accessible
  - [ ] Messaging works
  - [ ] Appropriate restrictions in place

### 12. Sign-Off
- [ ] **Technical Approval**
  - [ ] Development team approval
  - [ ] QA team approval
  - [ ] Security team approval
  - [ ] Operations team approval

- [ ] **Stakeholder Approval**
  - [ ] Product owner approval
  - [ ] School administration approval
  - [ ] IT director approval
  - [ ] Executive approval

---

## Rollback Plan

### Rollback Triggers
- [ ] Critical security vulnerability discovered
- [ ] Data corruption or loss
- [ ] Performance degradation > 50%
- [ ] System instability
- [ ] Critical functionality broken

### Rollback Procedure
1. **Stop Application**
   ```bash
   pm2 stop ims-backend
   sudo systemctl stop nginx
   ```

2. **Restore Database**
   ```bash
   sudo -u postgres psql integrated_management_system < backup_pre_release.sql
   ```

3. **Restore Application Files**
   ```bash
   tar -xzf app_backup_pre_release.tar.gz -C /
   ```

4. **Restart Services**
   ```bash
   pm2 start ims-backend
   sudo systemctl start nginx
   ```

5. **Verify Rollback**
   ```bash
   curl https://your-production-domain.com/health
   ```

---

## Quick Reference Commands

### Application Management
```bash
# Start application
pm2 start ecosystem.config.js

# Stop application
pm2 stop ims-backend

# Restart application
pm2 restart ims-backend

# View logs
pm2 logs ims-backend

# Check status
pm2 status
```

### Health Check
```bash
# Check health endpoint
curl https://your-production-domain.com/health
```

### Nginx Management
```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

### Database Management
```bash
# Backup database
sudo -u postgres pg_dump integrated_management_system > backup.sql

# Restore database
sudo -u postgres psql integrated_management_system < backup.sql

# Check connection
sudo -u postgres psql -d integrated_management_system -c "SELECT 1;"
```

---

## Documentation References

- [COMPLETE_DEPLOYMENT_GUIDE.md](docs/COMPLETE_DEPLOYMENT_GUIDE.md) - Detailed deployment instructions
- [DATABASE_MIGRATION_GUIDE.md](docs/DATABASE_MIGRATION_GUIDE.md) - Database migration procedures
- [DATABASE_BACKUP_STRATEGY.md](docs/DATABASE_BACKUP_STRATEGY.md) - Backup and restore procedures
- [RELEASE_NOTES.md](RELEASE_NOTES.md) - Version release notes
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API endpoint documentation

---

**Checklist Version:** 1.0  
**Last Updated:** July 23, 2026  
**For System Version:** 1.0.0
