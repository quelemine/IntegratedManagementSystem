# Complete Deployment Guide
**Integrated Management System - Final Production Deployment**

**Version:** 1.0  
**Last Updated:** July 23, 2026  
**System Version:** 1.0.0

---

## Table of Contents
1. [Server Requirements](#server-requirements)
2. [Software Dependencies](#software-dependencies)
3. [Environment Variable Setup](#environment-variable-setup)
4. [Database Setup](#database-setup)
5. [Migration Instructions](#migration-instructions)
6. [Seed Instructions](#seed-instructions)
7. [Backend Deployment](#backend-deployment)
8. [Frontend Deployment](#frontend-deployment)
9. [SSL/HTTPS Setup](#sslhttps-setup)
10. [Backup and Restore Procedures](#backup-and-restore-procedures)
11. [Troubleshooting Guide](#troubleshooting-guide)

---

## 1. Server Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 20 GB SSD
- **OS**: Ubuntu 20.04 LTS or later (or equivalent Linux distribution)

### Recommended Requirements
- **CPU**: 4 cores
- **RAM**: 8 GB
- **Storage**: 50 GB SSD
- **OS**: Ubuntu 22.04 LTS

### Network Requirements
- **Ports**: 22 (SSH), 80 (HTTP), 443 (HTTPS)
- **Bandwidth**: 10 Mbps minimum
- **DNS**: A record configured for production domain

---

## 2. Software Dependencies

### System Packages
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl git build-essential
```

### Node.js (v18.x or higher)
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v18.x or higher
npm --version   # Should be 9.x or higher
```

### PostgreSQL (v14.x or higher)
```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Verify installation
sudo -u postgres psql --version
```

### Nginx (v1.18+)
```bash
# Install Nginx
sudo apt install -y nginx

# Verify installation
nginx -v
```

### PM2 (Process Manager)
```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### Application Dependencies
```bash
# Backend dependencies (installed during deployment)
cd server
npm install --production

# Frontend dependencies (installed during deployment)
cd client
npm install --production
```

---

## 3. Environment Variable Setup

### Step 1: Create .env File
```bash
# Copy the production template
cp .env.production .env
```

### Step 2: Configure Environment Variables

Edit the `.env` file and update the following variables:

#### Application Settings
```bash
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-production-domain.com
```

#### Database Settings
```bash
DB_CLIENT=pg
DB_HOST=localhost  # or your database server IP
DB_PORT=5432
DB_NAME=integrated_management_system
DB_USER=ims_production_user
DB_PASSWORD=your_secure_password_here
```

**Important:** Generate a strong password for the database user.

#### JWT Configuration
```bash
JWT_SECRET=your_very_secure_jwt_secret_key_minimum_32_characters
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_very_secure_refresh_secret_key_minimum_32_characters
JWT_REFRESH_EXPIRE=30d
```

**Important:** Generate cryptographically secure secrets for JWT. Use at least 32 characters.

#### Rate Limiting
```bash
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

#### CORS Configuration
```bash
CORS_ORIGIN=https://your-production-domain.com
```

#### Logging
```bash
LOG_LEVEL=info
LOG_FILE_PATH=logs
```

#### Email Configuration (Optional)
```bash
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-email-password
SMTP_FROM=noreply@your-domain.com
```

### Step 3: Secure the .env File
```bash
# Set appropriate permissions
chmod 600 .env

# Ensure it's in .gitignore
echo ".env" >> .gitignore
```

### Step 4: Generate Secure Secrets

Use the following commands to generate secure secrets:

```bash
# Generate JWT Secret
openssl rand -base64 32

# Generate Refresh Token Secret
openssl rand -base64 32

# Generate Session Secret
openssl rand -base64 32
```

---

## 4. Database Setup

### Step 1: Create Database User
```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE USER ims_production_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE integrated_management_system OWNER ims_production_user;
GRANT ALL PRIVILEGES ON DATABASE integrated_management_system TO ims_production_user;
\q
```

### Step 2: Configure PostgreSQL

Edit `/etc/postgresql/14/main/postgresql.conf`:

```ini
# Connection Settings
listen_addresses = 'localhost'
max_connections = 100

# Memory Settings
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 1310kB
min_wal_size = 1GB
max_wal_size = 4GB
```

### Step 3: Restart PostgreSQL
```bash
sudo systemctl restart postgresql
sudo systemctl enable postgresql
```

### Step 4: Test Connection
```bash
sudo -u postgres psql -d integrated_management_system -c "SELECT 1;"
```

---

## 5. Migration Instructions

### Step 1: Navigate to Server Directory
```bash
cd /var/www/integrated-management-system/server
```

### Step 2: Install Knex CLI (if not installed)
```bash
npm install -g knex
```

### Step 3: Run Migrations
```bash
# Run all pending migrations
npx knex migrate:latest

# Verify migration status
npx knex migrate:status
```

### Step 4: Verify Database Schema
```bash
sudo -u postgres psql -d integrated_management_system

# List all tables
\dt

# Exit
\q
```

### Migration Rollback (if needed)
```bash
# Rollback last migration
npx knex migrate:rollback

# Rollback all migrations
npx knex migrate:rollback --all

# Re-run migrations
npx knex migrate:latest
```

---

## 6. Seed Instructions

### Step 1: Review Seed Files
Seed files are located in `server/seeds/` directory:
- `001_roles.js` - Role definitions
- `002_schools.js` - Sample school data
- `003_users.js` - Admin user
- `004_divisions.js` - Division data
- `005_grades.js` - Grade levels
- `006_classes.js` - Class data
- `007_sample_students.js` - Sample students
- `008_sample_teachers.js` - Sample teachers

### Step 2: Run Seeds (Optional)
```bash
cd server

# Run all seeds
npx knex seed:run

# Run specific seed file
npx knex seed:run --specific=001_roles.js
```

### Step 3: Verify Seeded Data
```bash
sudo -u postgres psql -d integrated_management_system

# Check roles
SELECT * FROM roles;

# Check users
SELECT id, email, role_id FROM users;

# Exit
\q
```

**Important:** Seeds are for initial setup only. Do not run seeds in production if you have existing data.

---

## 7. Backend Deployment

### Step 1: Clone Repository
```bash
cd /var/www
sudo git clone <your-repository-url> integrated-management-system
cd integrated-management-system
```

### Step 2: Install Dependencies
```bash
cd server
npm install --production
```

### Step 3: Create Required Directories
```bash
# Create logs directory
mkdir -p logs

# Create uploads directory
mkdir -p uploads

# Set permissions
chmod 755 logs uploads
```

### Step 4: Configure Environment
```bash
# Copy .env.production to .env
cp .env.production .env

# Edit .env with production values
nano .env
```

### Step 5: Run Database Migrations
```bash
npx knex migrate:latest
```

### Step 6: Create PM2 Configuration

Create `ecosystem.config.js` in the project root:

```javascript
module.exports = {
  apps: [{
    name: 'ims-backend',
    script: './server/index.js',
    cwd: '/var/www/integrated-management-system',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
```

### Step 7: Start Application with PM2
```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 startup script
pm2 startup
# Follow the command output to complete setup
```

### Step 8: Verify Application
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs ims-backend

# Test health endpoint
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-07-23T00:00:00.000Z",
  "environment": "production",
  "version": "1.0.0",
  "database": {
    "status": "connected"
  },
  "uptime": 123.456
}
```

---

## 8. Frontend Deployment

### Step 1: Install Dependencies
```bash
cd /var/www/integrated-management-system/client
npm install --production
```

### Step 2: Configure Environment

Create `.env.production` in client directory:

```bash
VITE_API_URL=https://your-production-domain.com/api
```

### Step 3: Build for Production
```bash
npm run build
```

### Step 4: Verify Build
```bash
# Check if dist directory was created
ls -la dist/

# Verify index.html exists
ls -la dist/index.html
```

### Step 5: Test Build Locally (Optional)
```bash
# Install serve globally
npm install -g serve

# Serve the build
serve -s dist -l 3000

# Test in browser
# Navigate to http://localhost:3000
```

### Step 6: Configure Nginx

Create `/etc/nginx/sites-available/integrated-management-system`:

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name your-production-domain.com www.your-production-domain.com;
    
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name your-production-domain.com www.your-production-domain.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/your-domain.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend (Static Files)
    location / {
        root /var/www/integrated-management-system/client/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health Check
    location /health {
        proxy_pass http://localhost:5000;
        access_log off;
    }

    # File Uploads
    location /uploads {
        alias /var/www/integrated-management-system/server/uploads;
        expires 30d;
    }

    # API Documentation (Optional - disable in production)
    location /api-docs {
        proxy_pass http://localhost:5000;
        # Comment out to disable in production
    }
}
```

### Step 7: Enable Nginx Configuration
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/integrated-management-system /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 9. SSL/HTTPS Setup

### Option 1: Let's Encrypt (Free SSL)

#### Step 1: Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

#### Step 2: Obtain SSL Certificate
```bash
sudo certbot --nginx -d your-production-domain.com -d www.your-production-domain.com
```

Follow the prompts:
- Enter email address
- Agree to terms
- Choose whether to redirect HTTP to HTTPS (recommended)

#### Step 3: Verify SSL
```bash
# Check certificate
sudo certbot certificates

# Test auto-renewal
sudo certbot renew --dry-run
```

#### Step 4: Auto-Renewal
Certbot automatically sets up auto-renewal. Verify with:
```bash
sudo systemctl status certbot.timer
```

### Option 2: Commercial SSL Certificate

#### Step 1: Generate CSR
```bash
sudo openssl req -new -newkey rsa:2048 -nodes -keyout /etc/ssl/private/your-domain.key -out /etc/ssl/certs/your-domain.csr
```

#### Step 2: Submit CSR to Certificate Authority
- Submit the CSR file to your CA
- Receive the certificate file (.crt)
- Receive intermediate certificates

#### Step 3: Install Certificate
```bash
# Copy certificate
sudo cp your-domain.crt /etc/ssl/certs/

# Copy intermediate certificates
sudo cat intermediate.crt >> /etc/ssl/certs/your-domain.crt

# Set permissions
sudo chmod 600 /etc/ssl/private/your-domain.key
sudo chmod 644 /etc/ssl/certs/your-domain.crt
```

#### Step 4: Update Nginx Configuration
Update the SSL paths in your Nginx configuration:
```nginx
ssl_certificate /etc/ssl/certs/your-domain.crt;
ssl_certificate_key /etc/ssl/private/your-domain.key;
```

#### Step 5: Restart Nginx
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## 10. Backup and Restore Procedures

### Database Backup

#### Manual Backup
```bash
# Full database backup
sudo -u postgres pg_dump integrated_management_system > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
sudo -u postgres pg_dump integrated_management_system | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

#### Automated Backup Script

Create `/usr/local/bin/backup-database.sh`:
```bash
#!/bin/bash

# Configuration
DB_NAME="integrated_management_system"
BACKUP_DIR="/var/backups/postgresql"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
sudo -u postgres pg_dump $DB_NAME | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup successful: $BACKUP_DIR/backup_$TIMESTAMP.sql.gz"
    
    # Remove old backups
    find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
else
    echo "Backup failed!"
    exit 1
fi
```

Make it executable:
```bash
sudo chmod +x /usr/local/bin/backup-database.sh
```

#### Schedule Automated Backups
```bash
# Edit crontab
sudo crontab -e

# Add daily backup at 2:00 AM
0 2 * * * /usr/local/bin/backup-database.sh >> /var/log/postgresql_backup.log 2>&1
```

### Application Backup

#### Backup Application Files
```bash
# Create backup directory
mkdir -p /var/backups/integrated-management-system

# Backup application
tar -czf /var/backups/integrated-management-system/app_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/integrated-management-system

# Backup uploads separately
tar -czf /var/backups/integrated-management-system/uploads_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/integrated-management-system/server/uploads
```

### Restore Procedures

#### Restore Database
```bash
# Stop application
pm2 stop ims-backend

# Restore from SQL file
sudo -u postgres psql integrated_management_system < backup_file.sql

# Restore from compressed file
gunzip -c backup_file.sql.gz | sudo -u postgres psql integrated_management_system

# Restart application
pm2 start ims-backend
```

#### Restore Application Files
```bash
# Stop application
pm2 stop ims-backend
sudo systemctl stop nginx

# Restore application
tar -xzf /var/backups/integrated-management-system/app_backup.tar.gz -C /

# Restore uploads
tar -xzf /var/backups/integrated-management-system/uploads_backup.tar.gz -C /

# Restart services
pm2 start ims-backend
sudo systemctl start nginx
```

---

## 11. Troubleshooting Guide

### Common Issues

#### 1. Application Won't Start

**Symptoms:** PM2 shows application as errored or stopped

**Solutions:**
```bash
# Check PM2 logs
pm2 logs ims-backend

# Check for port conflicts
sudo netstat -tulpn | grep :5000

# Check environment variables
pm2 env 0

# Restart application
pm2 restart ims-backend

# Check Node.js version
node --version  # Should be v18.x or higher
```

#### 2. Database Connection Failed

**Symptoms:** Health check shows database status as "disconnected"

**Solutions:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
sudo -u postgres psql -d integrated_management_system -c "SELECT 1;"

# Check database credentials in .env
cat .env | grep DB_

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

#### 3. Nginx 502 Bad Gateway

**Symptoms:** Browser shows 502 error when accessing the site

**Solutions:**
```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx configuration
sudo nginx -t

# Check if backend is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

#### 4. SSL Certificate Issues

**Symptoms:** Browser shows SSL errors or certificate warnings

**Solutions:**
```bash
# Check certificate expiration
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Check SSL configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 5. File Upload Fails

**Symptoms:** File uploads fail or timeout

**Solutions:**
```bash
# Check uploads directory permissions
ls -la /var/www/integrated-management-system/server/uploads

# Set correct permissions
chmod 755 /var/www/integrated-management-system/server/uploads

# Check disk space
df -h

# Check Nginx client_max_body_size
# Add to server block: client_max_body_size 10M;
```

#### 6. High Memory Usage

**Symptoms:** Application uses excessive memory

**Solutions:**
```bash
# Check PM2 memory usage
pm2 monit

# Restart application
pm2 restart ims-backend

# Adjust PM2 memory limit in ecosystem.config.js
max_memory_restart: '1G'

# Check Node.js memory leak
pm2 install pm2-logrotate
```

#### 7. API Returns 401 Unauthorized

**Symptoms:** API requests fail with 401 error

**Solutions:**
```bash
# Check JWT_SECRET in .env
cat .env | grep JWT_SECRET

# Verify token expiration
# Check JWT_EXPIRE setting

# Check authentication middleware
# Review server/config/jwt.js

# Test with fresh token
```

#### 8. CORS Errors

**Symptoms:** Browser console shows CORS errors

**Solutions:**
```bash
# Check CORS_ORIGIN in .env
cat .env | grep CORS_ORIGIN

# Verify it matches your domain
# Should be: https://your-production-domain.com

# Check Nginx configuration
# Ensure proper headers are set
```

### Log Locations

#### Application Logs
- **PM2 Logs**: `/var/www/integrated-management-system/logs/`
- **Error Log**: `logs/error.log`
- **Out Log**: `logs/out.log`

#### Nginx Logs
- **Access Log**: `/var/log/nginx/access.log`
- **Error Log**: `/var/log/nginx/error.log`

#### PostgreSQL Logs
- **Main Log**: `/var/log/postgresql/postgresql-14-main.log`

### Useful Commands

```bash
# Check system resources
htop

# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
ps aux

# Check network connections
sudo netstat -tulpn

# Check PM2 status
pm2 status

# Check PM2 logs
pm2 logs

# Restart PM2 application
pm2 restart ims-backend

# Stop PM2 application
pm2 stop ims-backend

# Start PM2 application
pm2 start ims-backend

# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# View recent logs
tail -f /var/www/integrated-management-system/logs/error.log

# Check health endpoint
curl http://localhost:5000/health

# Check SSL certificate
sudo certbot certificates
```

### Getting Help

If issues persist:
1. Check all relevant logs
2. Verify all environment variables
3. Ensure all services are running
4. Check system resources
5. Review recent changes
6. Consult the GitHub issues page
7. Contact support team

---

## Appendix

### Quick Reference

**Start Application:**
```bash
pm2 start ecosystem.config.js
```

**Stop Application:**
```bash
pm2 stop ims-backend
```

**Restart Application:**
```bash
pm2 restart ims-backend
```

**View Logs:**
```bash
pm2 logs ims-backend
```

**Check Health:**
```bash
curl http://localhost:5000/health
```

**Restart Nginx:**
```bash
sudo systemctl restart nginx
```

**Restart PostgreSQL:**
```bash
sudo systemctl restart postgresql
```

**Backup Database:**
```bash
sudo -u postgres pg_dump integrated_management_system > backup.sql
```

**Restore Database:**
```bash
sudo -u postgres psql integrated_management_system < backup.sql
```

---

**Document Version:** 1.0  
**Last Updated:** July 23, 2026  
**For System Version:** 1.0.0
