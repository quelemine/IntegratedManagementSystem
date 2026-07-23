# Deployment Guide

## Overview
This guide covers the deployment process for the Integrated Management System to production environments.

## Prerequisites

### System Requirements
- **Node.js**: v18.x or higher
- **PostgreSQL**: v14.x or higher
- **Nginx**: v1.18+ (for reverse proxy)
- **PM2**: v5.x+ (process manager)
- **SSL Certificate**: For HTTPS

### Server Requirements
- **CPU**: 2+ cores recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 20GB minimum SSD
- **OS**: Ubuntu 20.04+ or similar Linux distribution

## Pre-Deployment Checklist

### Security
- [ ] Change all default passwords
- [ ] Configure firewall rules
- [ ] Set up SSL certificates
- [ ] Configure environment variables
- [ ] Review and update CORS settings
- [ ] Enable rate limiting
- [ ] Set up database backups

### Database
- [ ] Create production database
- [ ] Run database migrations
- [ ] Seed initial data
- [ ] Configure database backups
- [ ] Test database connections

### Application
- [ ] Build frontend for production
- [ ] Configure production environment
- [ ] Test health check endpoint
- [ ] Verify API endpoints
- [ ] Test authentication flow

## Deployment Steps

### 1. Server Setup

#### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

#### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
```

#### Install Nginx
```bash
sudo apt install -y nginx
```

#### Install PM2
```bash
sudo npm install -g pm2
```

### 2. Database Setup

#### Create Database User
```bash
sudo -u postgres psql
CREATE USER ims_user WITH PASSWORD 'secure_password';
CREATE DATABASE integrated_management_system OWNER ims_user;
GRANT ALL PRIVILEGES ON DATABASE integrated_management_system TO ims_user;
\q
```

#### Configure PostgreSQL
Edit `/etc/postgresql/14/main/postgresql.conf`:
```ini
listen_addresses = 'localhost'
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
```

### 3. Application Setup

#### Clone Repository
```bash
cd /var/www
sudo git clone <your-repo-url> integrated-management-system
cd integrated-management-system
```

#### Install Dependencies
```bash
# Backend
cd server
npm install --production

# Frontend
cd ../client
npm install --production
```

#### Configure Environment
```bash
cp .env.production .env
nano .env
```

Update with production values:
- Database credentials
- JWT secrets
- CORS origin
- Other production settings

#### Build Frontend
```bash
cd client
npm run build
```

### 4. Database Migration

#### Run Migrations
```bash
cd server
npx knex migrate:latest
```

#### Run Seeds (if needed)
```bash
npx knex seed:run
```

### 5. Application Deployment with PM2

#### Create PM2 Configuration
Create `ecosystem.config.js`:
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
    max_memory_restart: '1G'
  }]
};
```

#### Start Application
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Nginx Configuration

#### Configure Reverse Proxy
Create `/etc/nginx/sites-available/integrated-management-system`:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/your-domain.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

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

#### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/integrated-management-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. SSL Certificate Setup

#### Using Let's Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

#### Auto-renewal
```bash
sudo certbot renew --dry-run
```

### 8. Firewall Configuration

#### Configure UFW
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 9. Monitoring Setup

#### PM2 Monitoring
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

#### Log Rotation
Create `/etc/logrotate.d/integrated-management-system`:
```
/var/www/integrated-management-system/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 www-data www-data
}
```

## Post-Deployment Verification

### Health Check
```bash
curl https://your-domain.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T00:00:00.000Z",
  "environment": "production",
  "database": {
    "status": "connected"
  },
  "uptime": 123.456
}
```

### Application Tests
- [ ] Login functionality
- [ ] Dashboard loads
- [ ] API endpoints respond
- [ ] File uploads work
- [ ] Database queries execute
- [ ] Error logging works

## Updates and Maintenance

### Application Updates
```bash
cd /var/www/integrated-management-system
git pull origin main
cd server
npm install
cd ../client
npm install
npm run build
pm2 restart ims-backend
```

### Database Migrations
```bash
cd server
npx knex migrate:latest
pm2 restart ims-backend
```

### Rollback Procedure
```bash
cd /var/www/integrated-management-system
git checkout <previous-commit>
cd server
npm install
cd ../client
npm install
npm run build
pm2 restart ims-backend
```

## Troubleshooting

### Application Won't Start
```bash
pm2 logs ims-backend
pm2 describe ims-backend
```

### Database Connection Issues
```bash
sudo -u postgres psql -d integrated_management_system
```

### Nginx Issues
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Port Conflicts
```bash
sudo netstat -tulpn | grep :5000
```

## Security Best Practices

1. **Keep software updated**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Regular backups**
   - Database: Daily automated backups
   - Application files: Weekly backups

3. **Monitor logs**
   ```bash
   pm2 logs
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

4. **Security scanning**
   - Regular dependency audits
   - SSL certificate monitoring
   - Failed login monitoring

## Performance Optimization

### Enable Compression
Add to Nginx config:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### Enable Browser Caching
Already configured in Nginx config above.

### Database Connection Pooling
Configure in `server/config/database.js`:
```javascript
pool: {
  min: 2,
  max: 10,
  acquireTimeoutMillis: 30000,
  idleTimeoutMillis: 30000
}
```

## Support and Maintenance

### Contact Information
- **System Administrator**: [contact]
- **Database Administrator**: [contact]
- **On-Call Rotation**: [contact]

### Emergency Procedures
1. Check health endpoint
2. Review application logs
3. Check database connectivity
4. Restart services if needed
5. Escalate if unresolved

### Documentation
- API Documentation: https://your-domain.com/api-docs
- System Logs: /var/www/integrated-management-system/logs/
- Nginx Logs: /var/log/nginx/
