# Deployment Checklist
**Integrated Management System - Production Deployment**

**Version:** 1.0  
**Last Updated:** July 21, 2026

---

## Pre-Deployment Phase

### 1. Planning & Preparation
- [ ] **Deployment Schedule Confirmed**
  - [ ] Date and time scheduled
  - [ ] Stakeholders notified
  - [ ] Maintenance window approved
  - [ ] Rollback plan documented

- [ ] **Team Readiness**
  - [ ] Deployment team assigned
  - [ ] On-call personnel identified
  - [ ] Communication channels established
  - [ ] Emergency contacts verified

- [ ] **Documentation Review**
  - [ ] Deployment guide reviewed
  - [ ] Migration guide reviewed
  - [ ] Backup strategy reviewed
  - [ ] Troubleshooting guide reviewed

### 2. Environment Setup
- [ ] **Server Provisioning**
  - [ ] Server acquired (2+ cores, 4GB RAM minimum)
  - [ ] Operating system installed (Ubuntu 20.04+)
  - [ ] SSH access configured
  - [ ] Firewall rules configured (ports 22, 80, 443)
  - [ ] DNS records configured (A record for domain)

- [ ] **Software Installation**
  - [ ] Node.js v18+ installed
  - [ ] PostgreSQL v14+ installed
  - [ ] Nginx v1.18+ installed
  - [ ] PM2 v5+ installed globally
  - [ ] Git installed
  - [ ] SSL certificate obtained (Let's Encrypt or commercial)

- [ ] **Database Setup**
  - [ ] PostgreSQL user created
  - [ ] Database created
  - [ ] Privileges granted
  - [ ] Connection tested
  - [ ] Backup directory created
  - [ ] Automated backup scheduled

### 3. Application Configuration
- [ ] **Environment Variables**
  - [ ] .env file created from .env.production template
  - [ ] NODE_ENV set to 'production'
  - [ ] PORT configured (default 5000)
  - [ ] CLIENT_URL set to production domain
  - [ ] Database credentials configured
  - [ ] JWT_SECRET set (secure, 32+ characters)
  - [ ] JWT_REFRESH_SECRET set (secure, 32+ characters)
  - [ ] CORS_ORIGIN set to production domain
  - [ ] SMTP credentials configured (if using email)
  - [ ] All variables verified

- [ ] **Repository Setup**
  - [ ] Repository cloned to server
  - [ ] Git remote configured
  - [ ] Production branch checked out
  - [ ] .gitignore reviewed for sensitive files

---

## Deployment Phase

### 4. Backend Deployment
- [ ] **Dependencies Installation**
  - [ ] Navigate to server directory
  - [ ] Run `npm install --production`
  - [ ] Verify installation completed successfully
  - [ ] Check for security vulnerabilities (`npm audit`)

- [ ] **Database Migration**
  - [ ] Backup current database (if exists)
  - [ ] Run `npx knex migrate:latest`
  - [ ] Verify migration status
  - [ ] Run seeds if required (`npx knex seed:run`)
  - [ ] Verify data integrity

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
  - [ ] Check PM2 status (`pm2 status`)
  - [ ] Check application logs (`pm2 logs`)
  - [ ] Test health check endpoint (`curl http://localhost:5000/health`)
  - [ ] Verify database connection
  - [ ] Verify API endpoints respond

### 5. Frontend Deployment
- [ ] **Build Process**
  - [ ] Navigate to client directory
  - [ ] Run `npm install --production`
  - [ ] Run `npm run build`
  - [ ] Verify build completed successfully
  - [ ] Check dist directory contents

- [ ] **Static Files**
  - [ ] Verify dist directory exists
  - [ ] Check index.html exists
  - [ ] Verify asset files present
  - [ ] Check file sizes are reasonable

### 6. Nginx Configuration
- [ ] **Nginx Setup**
  - [ ] Create server block configuration
  - [ ] Configure HTTP to HTTPS redirect
  - [ ] Configure SSL certificates
  - [ ] Configure reverse proxy for API
  - [ ] Configure static file serving
  - [ ] Configure security headers
  - [ ] Configure gzip compression
  - [ ] Configure caching for static assets
  - [ ] Test Nginx configuration (`nginx -t`)
  - [ ] Restart Nginx

- [ ] **SSL Configuration**
  - [ ] SSL certificate installed
  - [ ] Certificate chain verified
  - [ ] HTTPS accessible
  - [ ] HTTP redirects to HTTPS
  - [ ] SSL auto-renewal configured (if using Let's Encrypt)

---

## Post-Deployment Phase

### 7. Verification & Testing
- [ ] **Health Checks**
  - [ ] Health check endpoint responds (`curl https://domain.com/health`)
  - [ ] Database status shows "connected"
  - [ ] Uptime reported correctly
  - [ ] Environment shows "production"

- [ ] **Authentication Testing**
  - [ ] Login page loads
  - [ ] Valid credentials work
  - [ ] Invalid credentials rejected
  - [ ] Token generation works
  - [ ] Token refresh works
  - [ ] Logout works

- [ ] **Role Testing**
  - [ ] Admin can access all features
  - [ ] Principal can access academic features
  - [ ] Teacher can access teaching features
  - [ ] Student can access student features
  - [ ] Parent can access parent features

- [ ] **Core Functionality Testing**
  - [ ] Dashboard loads correctly
  - [ ] Students page loads
  - [ ] Teachers page loads
  - [ ] Classes page loads
  - [ ] Attendance page loads
  - [ ] Assignments page loads
  - [ ] Grades page loads
  - [ ] Invoices page loads
  - [ ] Payments page loads
  - [ ] Messages page loads
  - [ ] Announcements page loads
  - [ ] Notifications page loads

- [ ] **API Testing**
  - [ ] All API endpoints respond
  - [ ] Authentication required on protected routes
  - [ ] Rate limiting works
  - [ ] Error responses are consistent
  - [ ] CORS headers correct

- [ ] **Performance Testing**
  - [ ] Page load times acceptable (< 3 seconds)
  - [ ] API response times acceptable (< 500ms)
  - [ ] Database queries efficient
  - [ ] No memory leaks detected
  - [ ] CPU usage normal

### 8. Monitoring Setup
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

### 9. Security Verification
- [ ] **Security Headers**
  - [ ] X-Frame-Options header present
  - [ ] X-Content-Type-Options header present
  - [ ] X-XSS-Protection header present
  - [ ] Strict-Transport-Security header present
  - [ ] Content-Security-Policy header present

- [ ] **SSL/TLS**
  - [ ] SSL certificate valid
  - [ ] TLS 1.2+ enforced
  - [ ] Weak ciphers disabled
  - [ ] Certificate auto-renewal configured

- [ ] **Access Control**
  - [ ] Firewall rules active
  - [ ] SSH access restricted
  - [ ] Database access restricted
  - [ ] File permissions correct

### 10. Documentation & Handoff
- [ ] **Documentation**
  - [ ] Deployment documented
  - [ ] Configuration documented
  - [ ] Access credentials documented
  - [ ] Troubleshooting guide updated
  - [ ] Runbook created

- [ ] **Handoff**
  - [ ] Operations team notified
  - [ ] Support team trained
  - [ ] Documentation shared
  - [ ] Access granted
  - [ ] Monitoring access granted

---

## Rollback Procedures

### Pre-Rollback Checklist
- [ ] Issue severity assessed
- [ ] Rollback decision made
- [ ] Stakeholders notified
- [ ] Rollback window confirmed

### Rollback Steps
- [ ] **Application Rollback**
  - [ ] Stop PM2 processes (`pm2 stop all`)
  - [ ] Checkout previous commit (`git checkout <previous-commit>`)
  - [ ] Reinstall dependencies (`npm install --production`)
  - [ ] Rebuild frontend (`npm run build`)
  - [ ] Restart PM2 (`pm2 restart all`)
  - [ ] Verify application health

- [ ] **Database Rollback** (if needed)
  - [ ] Stop application
  - [ ] Restore database from backup
  - [ ] Verify data integrity
  - [ ] Restart application
  - [ ] Verify functionality

- [ ] **Verification**
  - [ ] Health check passes
  - [ ] Core functionality works
  - [ ] No errors in logs
  - [ ] Stakeholders notified

---

## Ongoing Maintenance

### Daily Tasks
- [ ] Review application logs
- [ ] Check health check endpoint
- [ ] Monitor error rates
- [ ] Verify backup completion

### Weekly Tasks
- [ ] Review performance metrics
- [ ] Check disk space
- [ ] Review security logs
- [ ] Test backup restoration

### Monthly Tasks
- [ ] Update dependencies
- [ ] Review security advisories
- [ ] Audit user access
- [ ] Review and update documentation

### Quarterly Tasks
- [ ] Security audit
- [ ] Performance review
- [ ] Disaster recovery test
- [ ] Capacity planning

---

## Emergency Contacts

| Role | Name | Contact | Availability |
|------|------|---------|--------------|
| System Administrator | [Name] | [Phone/Email] | [Hours] |
| Database Administrator | [Name] | [Phone/Email] | [Hours] |
| Development Lead | [Name] | [Phone/Email] | [Hours] |
| On-Call Engineer | [Name] | [Phone/Email] | 24/7 |

---

## Important Notes

### Critical Information
- **Production Domain**: [domain.com]
- **Server IP**: [IP Address]
- **Database Name**: integrated_management_system
- **PM2 App Name**: ims-backend
- **Nginx Config**: /etc/nginx/sites-available/integrated-management-system
- **Application Logs**: /var/www/integrated-management-system/logs/
- **Nginx Logs**: /var/log/nginx/

### Quick Commands
```bash
# Check application status
pm2 status

# View application logs
pm2 logs ims-backend

# Restart application
pm2 restart ims-backend

# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Test Nginx configuration
sudo nginx -t

# Check database connection
psql -U [user] -d integrated_management_system -c "SELECT 1;"

# View recent logs
tail -f /var/www/integrated-management-system/logs/error.log
```

---

## Sign-Off

### Deployment Approval
- [ ] **Technical Lead**: _________________ Date: _______
- [ ] **Operations Manager**: _________________ Date: _______
- [ ] **Security Officer**: _________________ Date: _______
- [ ] **Project Manager**: _________________ Date: _______

### Deployment Completion
- **Deployment Date**: _________________
- **Deployment Time**: _________________
- **Deployed By**: _________________
- **Deployment Status**: ✅ SUCCESS / ❌ FAILED

### Post-Deployment Verification
- [ ] All verification tests passed
- [ ] Monitoring confirmed operational
- [ ] Documentation updated
- [ ] Team notified

---

**Checklist Version:** 1.0  
**Last Updated:** July 21, 2026  
**Next Review:** After first production deployment
