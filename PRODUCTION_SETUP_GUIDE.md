# Production Setup Guide
**Integrated Management System v1.0.0**

**Version:** 1.0.0  
**Last Updated:** July 23, 2026

---

## Overview

This guide provides step-by-step instructions for setting up the Integrated Management System in a production environment. Follow these instructions carefully to ensure a successful deployment.

---

## Prerequisites

### System Requirements

#### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 20 GB SSD
- **OS**: Ubuntu 20.04 LTS or equivalent Linux distribution

#### Recommended Requirements
- **CPU**: 4 cores
- **RAM**: 8 GB
- **Storage**: 50 GB SSD
- **OS**: Ubuntu 22.04 LTS

### Software Requirements
- **Node.js**: v18.x or higher
- **PostgreSQL**: v14.x or higher
- **Nginx**: v1.18+ (for reverse proxy)
- **PM2**: v5.x+ (process manager)
- **Git**: Latest version

### Network Requirements
- **Ports**: 22 (SSH), 80 (HTTP), 443 (HTTPS)
- **Bandwidth**: 10 Mbps minimum
- **DNS**: A record configured for production domain

---

## Step 1: Server Setup

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Required Packages
```bash
sudo apt install -y curl git build-essential
```

### 1.3 Configure Firewall
```bash
# Install UFW
sudo apt install -y ufw

# Configure firewall rules
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Step 2: Install Node.js

### 2.1 Install Node.js 18.x
```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v18.x or higher
npm --version   # Should be 9.x or higher
```

---

## Step 3: Install PostgreSQL

### 3.1 Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
```

### 3.2 Configure PostgreSQL

Edit `/etc/postgresql/14/main/postgresql.conf`:
```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

Add or update these settings:
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

### 3.3 Restart PostgreSQL
```bash
sudo systemctl restart postgresql
sudo systemctl enable postgresql
```

### 3.4 Create Database User and Database
```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE USER ims_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE integrated_management_system OWNER ims_user;
GRANT ALL PRIVILEGES ON DATABASE integrated_management_system TO ims_user;
\q
```

### 3.5 Test Database Connection
```bash
sudo -u postgres psql -d integrated_management_system -c "SELECT 1;"
```

---

## Step 4: Install Nginx

### 4.1 Install Nginx
```bash
sudo apt install -y nginx
```

### 4.2 Start and Enable Nginx
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4.3 Verify Nginx
```bash
sudo systemctl status nginx
```

---

## Step 5: Install PM2

### 5.1 Install PM2 Globally
```bash
sudo npm install -g pm2
```

### 5.2 Verify PM2
```bash
pm2 --version
```

---

## Step 6: Deploy Application

### 6.1 Clone Repository
```bash
cd /var/www
sudo git clone <your-repository-url> integrated-management-system
cd integrated-management-system
```

### 6.2 Install Backend Dependencies
```bash
cd server
npm install --production
```

### 6.3 Install Frontend Dependencies
```bash
cd ../client
npm install --production
```

### 6.4 Create Required Directories
```bash
cd /var/www/integrated-management-system/server
mkdir -p logs uploads
chmod 755 logs uploads
```

---

## Step 7: Configure Environment

### 7.1 Create .env File
```bash
cd /var/www/integrated-management-system
cp .env.example .env
nano .env
```

### 7.2 Configure Environment Variables

Update the following variables in `.env`:

```bash
# Application
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-production-domain.com

# Database
DB_CLIENT=pg
DB_HOST=localhost
DB_PORT=5432
DB_NAME=integrated_management_system
DB_USER=ims_user
DB_PASSWORD=your_secure_password

# JWT Configuration (IMPORTANT: Generate secure secrets)
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_minimum_32_characters
JWT_REFRESH_EXPIRE=30d

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=https://your-production-domain.com

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=logs
```

### 7.3 Generate Secure Secrets
```bash
# Generate JWT Secret
openssl rand -base64 32

# Generate Refresh Token Secret
openssl rand -base64 32
```

### 7.4 Secure .env File
```bash
chmod 600 .env
```

---

## Step 8: Database Migration

### 8.1 Run Migrations
```bash
cd /var/www/integrated-management-system/server
npx knex migrate:latest
```

### 8.2 Verify Migration Status
```bash
npx knex migrate:status
```

### 8.3 Run Seeds (Optional)
```bash
npx knex seed:run
```

---

## Step 9: Build Frontend

### 9.1 Configure Frontend Environment
```bash
cd /var/www/integrated-management-system/client
nano .env.production
```

Add:
```bash
VITE_API_URL=https://your-production-domain.com/api
```

### 9.2 Build Frontend
```bash
npm run build
```

### 9.3 Verify Build
```bash
ls -la dist/
```

---

## Step 10: Configure PM2

### 10.1 Create PM2 Configuration
```bash
cd /var/www/integrated-management-system
nano ecosystem.config.js
```

Add:
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

### 10.2 Start Application with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 10.3 Verify Application
```bash
pm2 status
pm2 logs ims-backend
curl http://localhost:5000/health
```

---

## Step 11: Configure Nginx

### 11.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/integrated-management-system
```

Add:
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
}
```

### 11.2 Enable Configuration
```bash
sudo ln -s /etc/nginx/sites-available/integrated-management-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 12: Configure SSL

### Option A: Let's Encrypt (Free SSL)

#### 12.1 Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

#### 12.2 Obtain SSL Certificate
```bash
sudo certbot --nginx -d your-production-domain.com -d www.your-production-domain.com
```

#### 12.3 Verify Auto-Renewal
```bash
sudo certbot renew --dry-run
```

### Option B: Commercial SSL Certificate

#### 12.1 Generate CSR
```bash
sudo openssl req -new -newkey rsa:2048 -nodes -keyout /etc/ssl/private/your-domain.key -out /etc/ssl/certs/your-domain.csr
```

#### 12.2 Install Certificate
```bash
# Copy certificate files
sudo cp your-domain.crt /etc/ssl/certs/
sudo cat intermediate.crt >> /etc/ssl/certs/your-domain.crt

# Set permissions
sudo chmod 600 /etc/ssl/private/your-domain.key
sudo chmod 644 /etc/ssl/certs/your-domain.crt
```

#### 12.3 Update Nginx Configuration
Update SSL paths in Nginx configuration and restart:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 13: Configure Log Rotation

### 13.1 Configure PM2 Log Rotation
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 13.2 Configure Nginx Log Rotation
Nginx log rotation is configured by default. Verify with:
```bash
sudo ls /etc/logrotate.d/
```

---

## Step 14: Setup Automated Backups

### 14.1 Create Backup Script
```bash
sudo nano /usr/local/bin/backup-database.sh
```

Add:
```bash
#!/bin/bash

DB_NAME="integrated_management_system"
BACKUP_DIR="/var/backups/postgresql"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

sudo -u postgres pg_dump $DB_NAME | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz

if [ $? -eq 0 ]; then
    echo "Backup successful: $BACKUP_DIR/backup_$TIMESTAMP.sql.gz"
    find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
else
    echo "Backup failed!"
    exit 1
fi
```

### 14.2 Make Script Executable
```bash
sudo chmod +x /usr/local/bin/backup-database.sh
```

### 14.3 Schedule Automated Backups
```bash
sudo crontab -e
```

Add:
```bash
0 2 * * * /usr/local/bin/backup-database.sh >> /var/log/postgresql_backup.log 2>&1
```

---

## Step 15: Verification

### 15.1 Health Check
```bash
curl https://your-production-domain.com/health
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

### 15.2 Check Services
```bash
# PM2 status
pm2 status

# Nginx status
sudo systemctl status nginx

# PostgreSQL status
sudo systemctl status postgresql
```

### 15.3 Test Application
- Open browser and navigate to `https://your-production-domain.com`
- Test login functionality
- Verify all features are accessible

---

## Troubleshooting

### Application Won't Start
```bash
# Check PM2 logs
pm2 logs ims-backend

# Check for port conflicts
sudo netstat -tulpn | grep :5000

# Restart application
pm2 restart ims-backend
```

### Database Connection Failed
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
sudo -u postgres psql -d integrated_management_system -c "SELECT 1;"

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Nginx 502 Bad Gateway
```bash
# Check Nginx status
sudo systemctl status nginx

# Check if backend is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### SSL Certificate Issues
```bash
# Check certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Restart Nginx
sudo systemctl restart nginx
```

---

## Maintenance

### Regular Maintenance Tasks

#### Daily
- Check application logs
- Verify health check endpoint
- Monitor error rates

#### Weekly
- Review performance metrics
- Check disk space
- Review security logs

#### Monthly
- Update dependencies
- Review security advisories
- Audit user access

#### Quarterly
- Security audit
- Performance review
- Disaster recovery test

---

## Support

### Documentation
- [COMPLETE_DEPLOYMENT_GUIDE.md](docs/COMPLETE_DEPLOYMENT_GUIDE.md) - Detailed deployment instructions
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Deployment checklist
- [RELEASE_NOTES.md](RELEASE_NOTES.md) - Version release notes
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API documentation

### Getting Help
- Check application logs in `/var/www/integrated-management-system/logs/`
- Check Nginx logs in `/var/log/nginx/`
- Check PostgreSQL logs in `/var/log/postgresql/`

---

**Guide Version:** 1.0  
**Last Updated:** July 23, 2026  
**For System Version:** 1.0.0
