# Cloud Deployment Guide
**Integrated Management System v1.0.0**

**Deployment Architecture:**
- **Frontend**: Vercel (React application)
- **Backend**: Render or Railway (Node.js/Express API)
- **Database**: Render PostgreSQL or Railway PostgreSQL

**Last Updated:** July 24, 2026

---

## Overview

This guide provides step-by-step instructions for deploying the Integrated Management System to cloud infrastructure using Vercel for the frontend and Render/Railway for the backend and database.

---

## Prerequisites

### Required Accounts
- GitHub account (repository already exists: quelemine/IntegratedManagementSystem)
- Vercel account (free tier available)
- Render account (free tier available) OR Railway account

### Required Information
- GitHub repository URL: https://github.com/quelemine/IntegratedManagementSystem
- Backend API URL (will be provided by Render/Railway after deployment)
- Frontend URL (will be provided by Vercel after deployment)

---

## Part 1: Database Deployment (Render PostgreSQL)

### Step 1: Create PostgreSQL Database on Render

1. **Log in to Render**
   - Go to https://dashboard.render.com
   - Sign up or log in

2. **Create New Database**
   - Click "New +" button
   - Select "PostgreSQL"
   - Choose a name: `integrated-management-db`
   - Select database: `integrated_management_system`
   - Select user: `ims_user`
   - Choose region (closest to your users)
   - Select plan: Free (or paid for production)
   - Click "Create Database"

3. **Wait for Database to be Ready**
   - Render will provision the database
   - This typically takes 1-2 minutes
   - You'll see a green checkmark when ready

4. **Get Database Connection Details**
   - Click on your database
   - Go to "Connections" tab
   - Copy the following information:
     - Host
     - Port
     - Database name
     - User
     - Password
   - Save these for backend configuration

### Step 2: Run Database Migrations

After deploying the backend, you'll need to run migrations:

**Option A: Using Render Shell**
1. Go to your backend service on Render
2. Click "Shell" tab
3. Run: `npx knex migrate:latest`
4. Verify migrations completed successfully

**Option B: Using Migration Script**
1. The repository includes `scripts/deploy-migrations.js`
2. Run: `node scripts/deploy-migrations.js`

**Option C: Manual via Local Machine**
1. Set DATABASE_URL to your Render PostgreSQL connection string
2. Run: `npx knex migrate:latest`

### Step 3: Seed Database (Optional)

If you want to populate with sample data:

```bash
npx knex seed:run
```

### Database Backup Recommendations

**Render Free Tier:**
- Backups are not included in free tier
- Manual backups recommended weekly
- Use pg_dump to export data

**Render Paid Tier:**
- Automated daily backups included
- Point-in-time recovery available
- 7-day retention by default

**Manual Backup Command:**
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

---

## Part 2: Backend Deployment (Render)

### Step 1: Prepare Backend for Render

The repository already includes `render.yaml` configuration file. This file defines:
- Web service configuration
- Database connection
- Environment variables
- Build and start commands

### Step 2: Deploy Backend to Render

1. **Log in to Render**
   - Go to https://dashboard.render.com
   - Ensure you're logged in

2. **Create New Web Service**
   - Click "New +" button
   - Select "Web Service"
   - Connect to GitHub
   - Authorize Render to access your repository
   - Select: `quelemine/IntegratedManagementSystem`
   - Select branch: `master`
   - Render will detect `render.yaml` configuration
   - Review settings:
     - Name: `integrated-management-system-api`
     - Region: Same as database
     - Plan: Free (or paid for production)
   - Click "Create Web Service"

3. **Configure Environment Variables**
   
   The `render.yaml` file includes automatic environment variable configuration. However, you may need to manually set:

   **Required Variables:**
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render's default)
   - `DB_CLIENT`: `pg`
   - `DB_HOST`: (from Render PostgreSQL)
   - `DB_PORT`: `5432`
   - `DB_NAME`: `integrated_management_system`
   - `DB_USER`: (from Render PostgreSQL)
   - `DB_PASSWORD`: (from Render PostgreSQL)
   - `JWT_SECRET`: (generate secure 32+ character string)
   - `JWT_REFRESH_SECRET`: (generate secure 32+ character string)
   - `CLIENT_URL`: (your Vercel frontend URL - set after frontend deployment)
   - `CORS_ORIGIN`: (your Vercel frontend URL - set after frontend deployment)

   **Optional Variables:**
   - `RATE_LIMIT_WINDOW_MS`: `900000`
   - `RATE_LIMIT_MAX_REQUESTS`: `100`
   - `LOG_LEVEL`: `info`
   - `LOG_FILE_PATH`: `logs`

4. **Generate Secure Secrets**
   
   Use these commands to generate secure secrets:
   ```bash
   # JWT Secret
   openssl rand -base64 32
   
   # Refresh Token Secret
   openssl rand -base64 32
   ```

5. **Wait for Deployment**
   - Render will build and deploy your backend
   - This typically takes 2-5 minutes
   - Monitor the deployment logs
   - You'll see a live URL when ready: `https://integrated-management-system-api.onrender.com`

6. **Run Migrations**
   - Go to your service's "Shell" tab
   - Run: `npx knex migrate:latest`
   - Verify migrations completed

7. **Verify Backend Health**
   - Visit: `https://integrated-management-system-api.onrender.com/health`
   - Expected response:
     ```json
     {
       "status": "healthy",
       "timestamp": "2026-07-24T00:00:00.000Z",
       "environment": "production",
       "version": "1.0.0",
       "database": {
         "status": "connected"
       },
       "uptime": 123.456
     }
     ```

8. **Copy Backend URL**
   - Save your backend API URL for frontend configuration
   - Example: `https://integrated-management-system-api.onrender.com`

### Backend Deployment Verification Checklist

- [ ] Backend service deployed successfully
- [ ] Database connection established
- [ ] Migrations completed
- [ ] Health check endpoint returns 200
- [ ] API documentation accessible at `/api-docs`
- [ ] JWT secrets configured
- [ ] CORS origin configured (will update after frontend deployment)

---

## Part 3: Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Vercel

The repository already includes:
- `client/vercel.json` - Vercel configuration
- `client/.env.example` - Environment variable template
- `client/vite.config.js` - Build configuration

### Step 2: Deploy Frontend to Vercel

1. **Log in to Vercel**
   - Go to https://vercel.com
   - Sign up or log in

2. **Import Project**
   - Click "Add New Project"
   - Connect to GitHub
   - Authorize Vercel to access your repository
   - Select: `quelemine/IntegratedManagementSystem`

3. **Configure Project Settings**
   
   **Framework Preset:**
   - Framework: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

   **Environment Variables:**
   - `VITE_API_URL`: Your backend API URL
     - Example: `https://integrated-management-system-api.onrender.com/api`
     - Note: Include `/api` at the end

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your frontend
   - This typically takes 1-3 minutes
   - You'll see a live URL when ready

5. **Copy Frontend URL**
   - Save your Vercel frontend URL
   - Example: `https://integrated-management-system.vercel.app`

### Step 3: Update Backend CORS Configuration

After frontend deployment, update the backend CORS configuration:

1. Go to Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Update `CLIENT_URL` to your Vercel URL
5. Update `CORS_ORIGIN` to your Vercel URL
6. Click "Save Changes"
7. Render will automatically redeploy

### Step 4: Verify Frontend Deployment

1. Visit your Vercel URL
2. Test login functionality
3. Verify API calls are working
4. Check browser console for errors

### Frontend Deployment Verification Checklist

- [ ] Frontend deployed successfully
- [ ] Build completed without errors
- [ ] SPA routing works (refresh on any page)
- [ ] API calls to backend successful
- [ ] Login functionality works
- [ ] All pages load correctly

---

## Part 4: Railway Alternative (Optional)

If you prefer Railway instead of Render, follow these steps:

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Sign up or log in

### Step 2: Deploy with Railway

**Option A: Using Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL database
railway add postgresql

# Add backend service
railway up

# Set environment variables
railway variables set NODE_ENV=production
railway variables set PORT=10000
railway variables set DB_CLIENT=pg
# ... set other variables

# Run migrations
railway run npx knex migrate:latest
```

**Option B: Using Railway Dashboard**
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select: `quelemine/IntegratedManagementSystem`
4. Add PostgreSQL database
5. Configure environment variables
6. Deploy

### Railway Environment Variables

Same as Render, but Railway provides a DATABASE_URL that includes all connection details. You can use:

```bash
# Parse DATABASE_URL for individual components
# Or use DATABASE_URL directly in knex config
```

---

## Required Environment Variables Summary

### Backend (Render/Railway)

| Variable | Value | Source |
|----------|-------|--------|
| NODE_ENV | production | Manual |
| PORT | 10000 | Platform default |
| DB_CLIENT | pg | Manual |
| DB_HOST | From PostgreSQL | Render/Railway |
| DB_PORT | 5432 | Manual |
| DB_NAME | integrated_management_system | Manual |
| DB_USER | From PostgreSQL | Render/Railway |
| DB_PASSWORD | From PostgreSQL | Render/Railway |
| JWT_SECRET | Generate 32+ chars | Manual |
| JWT_REFRESH_SECRET | Generate 32+ chars | Manual |
| CLIENT_URL | Vercel frontend URL | Manual |
| CORS_ORIGIN | Vercel frontend URL | Manual |
| RATE_LIMIT_WINDOW_MS | 900000 | Optional |
| RATE_LIMIT_MAX_REQUESTS | 100 | Optional |
| LOG_LEVEL | info | Optional |

### Frontend (Vercel)

| Variable | Value | Source |
|----------|-------|--------|
| VITE_API_URL | Backend API URL + /api | Manual |

---

## Code Changes Made for Cloud Deployment

### Files Created/Modified

1. **client/vercel.json** (NEW)
   - Vercel configuration for SPA routing
   - Build settings
   - Environment variable reference

2. **client/.env.example** (NEW)
   - Frontend environment variable template
   - API URL configuration

3. **client/vite.config.js** (MODIFIED)
   - Added build configuration
   - Disabled sourcemaps for production

4. **render.yaml** (NEW)
   - Render service configuration
   - Database connection setup
   - Environment variable mapping

5. **scripts/deploy-migrations.js** (NEW)
   - Database migration script for cloud deployment

### No Code Changes Required

The following are already configured for cloud deployment:
- ✅ Backend uses environment variables for all configuration
- ✅ Frontend uses `VITE_API_URL` environment variable
- ✅ Database connection uses environment variables
- ✅ CORS configured via environment variables
- ✅ Health check endpoint available
- ✅ API starts with `node server/index.js`

---

## Deployment Order

**Recommended Order:**
1. Deploy PostgreSQL database (Render)
2. Deploy backend API (Render)
3. Run database migrations
4. Deploy frontend (Vercel)
5. Update backend CORS with frontend URL
6. Verify full integration

---

## Troubleshooting

### Backend Issues

**Database Connection Failed**
- Verify DATABASE_URL is correct
- Check database is running
- Ensure migrations have been run
- Check Render logs for specific errors

**CORS Errors**
- Verify CORS_ORIGIN matches frontend URL
- Check CLIENT_URL is set correctly
- Ensure frontend URL includes protocol (https://)

**Health Check Fails**
- Check database connection
- Verify all environment variables set
- Review deployment logs

### Frontend Issues

**Build Fails**
- Check build logs in Vercel
- Verify dependencies installed
- Ensure VITE_API_URL is set

**API Calls Fail**
- Verify VITE_API_URL is correct
- Check backend is running
- Verify CORS is configured on backend
- Check browser console for errors

**SPA Routing Issues**
- Verify vercel.json is configured
- Check all routes work with refresh
- Ensure fallback to index.html

### Database Issues

**Migrations Fail**
- Verify database connection
- Check migration files exist
- Run migrations manually via shell
- Review migration logs

**Connection Pool Issues**
- Adjust pool settings in database config
- Check database plan limits
- Monitor connection usage

---

## Post-Deployment Checklist

### Security
- [ ] JWT secrets are secure (32+ characters)
- [ ] Database credentials are not exposed
- [ ] HTTPS is enforced
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled

### Performance
- [ ] Database connection pooling configured
- [ ] Frontend build optimized
- [ ] Static assets cached
- [ ] API response times acceptable

### Monitoring
- [ ] Health check endpoint accessible
- [ ] Error logging enabled
- [ ] Database backups configured
- [ ] Uptime monitoring set up

### Functionality
- [ ] Login/logout works
- [ ] All user roles functional
- [ ] API endpoints responding
- [ ] File uploads working
- [ ] Database operations successful

---

## Cost Estimates

### Free Tier (Development/Staging)

**Render:**
- Backend: Free (512MB RAM, 0.1 CPU)
- Database: Free (90GB storage)
- **Total: $0/month**

**Vercel:**
- Frontend: Free (100GB bandwidth)
- **Total: $0/month**

**Total Monthly Cost: $0**

### Paid Tier (Production)

**Render:**
- Backend: $7/month (1GB RAM, 0.5 CPU)
- Database: $7/month (10GB storage, daily backups)
- **Total: $14/month**

**Vercel:**
- Frontend: $20/month (1TB bandwidth)
- **Total: $20/month**

**Total Monthly Cost: $34/month**

---

## Scaling Considerations

### Backend Scaling
- Render automatically scales based on plan
- Consider horizontal scaling for high traffic
- Use load balancer for multiple instances

### Database Scaling
- Render PostgreSQL scales vertically
- Consider read replicas for read-heavy workloads
- Implement caching (Redis) for performance

### Frontend Scaling
- Vercel automatically scales globally
- Edge caching for static assets
- CDN included with Vercel

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check health endpoint
- Review system metrics

**Weekly:**
- Review database performance
- Check backup status
- Monitor API response times

**Monthly:**
- Update dependencies
- Review security advisories
- Audit user access
- Review costs

### Updates

**Backend Updates:**
1. Push to GitHub
2. Render auto-deploys on push
3. Monitor deployment logs
4. Run migrations if needed
5. Verify functionality

**Frontend Updates:**
1. Push to GitHub
2. Vercel auto-deploys on push
3. Monitor build logs
4. Verify deployment

---

## Support and Resources

### Documentation
- [Complete Deployment Guide](docs/COMPLETE_DEPLOYMENT_GUIDE.md)
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)
- [Production Setup Guide](PRODUCTION_SETUP_GUIDE.md)
- [Release Notes](RELEASE_NOTES.md)

### Platform Documentation
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)

### Getting Help
- Check platform logs
- Review deployment logs
- Check health endpoint
- Review browser console

---

**Guide Version:** 1.0  
**Last Updated:** July 24, 2026  
**For System Version:** 1.0.0
