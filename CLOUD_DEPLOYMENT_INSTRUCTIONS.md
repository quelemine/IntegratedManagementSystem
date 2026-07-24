# Cloud Deployment Instructions
**Integrated Management System v1.0.0**

**Deployment Status:** Configuration pushed to GitHub, ready for manual deployment

---

## Important Note

I cannot directly deploy to cloud platforms (Vercel, Render, Railway) as this requires:
- Authentication with your cloud accounts
- Access to your billing information
- Manual configuration of environment variables

**The cloud deployment configuration has been pushed to GitHub and is ready for you to deploy manually.**

Follow the step-by-step instructions below to deploy the system.

---

## Quick Start Deployment Guide

### Step 1: Deploy PostgreSQL Database (Render)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Log in or sign up

2. **Create PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Name: `integrated-management-db`
   - Database: `integrated_management_system`
   - User: `ims_user`
   - Region: Select closest to your users
   - Plan: Free (for testing) or Paid (for production)
   - Click "Create Database"

3. **Wait for Database to be Ready**
   - Takes 1-2 minutes
   - Look for green checkmark

4. **Copy Connection Details**
   - Click on your database
   - Go to "Connections" tab
   - Copy: Host, Port, Database, User, Password
   - Save these for backend configuration

### Step 2: Deploy Backend API (Render)

1. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect GitHub
   - Select: `quelemine/IntegratedManagementSystem`
   - Branch: `master`
   - Render will detect `render.yaml` configuration
   - Review settings and click "Create Web Service"

2. **Configure Environment Variables**
   
   In Render dashboard, go to your service → Environment:
   
   **Required Variables:**
   ```
   NODE_ENV = production
   PORT = 10000
   DB_CLIENT = pg
   DB_HOST = [from PostgreSQL]
   DB_PORT = 5432
   DB_NAME = integrated_management_system
   DB_USER = [from PostgreSQL]
   DB_PASSWORD = [from PostgreSQL]
   JWT_SECRET = [generate with: openssl rand -base64 32]
   JWT_REFRESH_SECRET = [generate with: openssl rand -base64 32]
   CLIENT_URL = [will set after frontend deployment]
   CORS_ORIGIN = [will set after frontend deployment]
   ```

3. **Wait for Deployment**
   - Takes 2-5 minutes
   - Monitor deployment logs
   - You'll get URL like: `https://integrated-management-system-api.onrender.com`

4. **Run Database Migrations**
   - Go to service → "Shell" tab
   - Run: `npx knex migrate:latest`
   - Verify migrations completed

5. **Verify Backend Health**
   - Visit: `https://your-backend-url.onrender.com/health`
   - Should return: `{"status":"healthy","database":{"status":"connected"}}`

6. **Save Backend URL**
   - Copy your backend API URL
   - Example: `https://integrated-management-system-api.onrender.com`

### Step 3: Deploy Frontend (Vercel)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com
   - Log in or sign up

2. **Import Project**
   - Click "Add New Project"
   - Connect GitHub
   - Select: `quelemine/IntegratedManagementSystem`

3. **Configure Project**
   - Framework: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   
   **Environment Variable:**
   ```
   VITE_API_URL = https://your-backend-url.onrender.com/api
   ```

4. **Deploy**
   - Click "Deploy"
   - Takes 1-3 minutes
   - You'll get URL like: `https://integrated-management-system.vercel.app`

5. **Save Frontend URL**
   - Copy your Vercel frontend URL

### Step 4: Connect Frontend and Backend

1. **Update Backend CORS**
   - Go to Render dashboard
   - Select your backend service
   - Go to Environment
   - Update `CLIENT_URL` to your Vercel URL
   - Update `CORS_ORIGIN` to your Vercel URL
   - Click "Save Changes"
   - Render will redeploy automatically

### Step 5: Verify Deployment

1. **Test Frontend**
   - Visit your Vercel URL
   - Try to login
   - Verify API calls work

2. **Test Backend**
   - Visit `/health` endpoint
   - Check API documentation at `/api-docs`

3. **Test All User Roles**
   - Admin login
   - Teacher login
   - Student login
   - Parent login

---

## Deployment Verification Checklist

Use this checklist after completing deployment:

### Database
- [ ] PostgreSQL database created
- [ ] Connection details saved
- [ ] Migrations completed successfully
- [ ] Tables created (users, schools, students, teachers, etc.)

### Backend
- [ ] Backend service deployed
- [ ] Environment variables configured
- [ ] Health check returns 200
- [ ] Database status: connected
- [ ] API documentation accessible
- [ ] Authentication works
- [ ] CORS configured for frontend URL

### Frontend
- [ ] Frontend deployed to Vercel
- [ ] VITE_API_URL configured
- [ ] Build completed without errors
- [ ] SPA routing works (refresh on any page)
- [ ] Login page loads
- [ ] API calls successful

### Integration
- [ ] Frontend can communicate with backend
- [ ] Login/logout works
- [ ] Dashboard loads
- [ ] Academic pages work
- [ ] Financial pages work
- [ ] Communication pages work

### User Roles
- [ ] Admin can access all features
- [ ] Principal can access academic features
- [ ] Teacher can access teaching features
- [ ] Student can access student features
- [ ] Parent can access parent features

---

## Deployment Completion Report Template

After deployment, fill in this report:

```
DEPLOYMENT COMPLETION REPORT
Integrated Management System v1.0.0
Date: [Deployment Date]

FRONTEND DEPLOYMENT
- Platform: Vercel
- URL: [Your Vercel URL]
- Status: [Deployed/Failed]
- Build Time: [X minutes]
- Issues: [Any issues encountered]

BACKEND DEPLOYMENT
- Platform: Render
- URL: [Your Render URL]
- Status: [Deployed/Failed]
- Build Time: [X minutes]
- Health Check: [Pass/Fail]
- Database Connection: [Connected/Failed]
- Issues: [Any issues encountered]

DATABASE DEPLOYMENT
- Platform: Render PostgreSQL
- Database Name: integrated_management_system
- Status: [Created/Failed]
- Migrations: [Completed/Failed]
- Tables Created: [Number]
- Issues: [Any issues encountered]

INTEGRATION TESTS
- Frontend-Backend Communication: [Pass/Fail]
- Login/Logout: [Pass/Fail]
- Admin Dashboard: [Pass/Fail]
- Academic Pages: [Pass/Fail]
- Financial Pages: [Pass/Fail]
- Communication Pages: [Pass/Fail]

USER ROLE TESTS
- Admin Login: [Pass/Fail]
- Teacher Login: [Pass/Fail]
- Student Login: [Pass/Fail]
- Parent Login: [Pass/Fail]

OVERALL STATUS
- Deployment: [Success/Partial Success/Failed]
- Ready for Production: [Yes/No]
- Notes: [Any additional notes]
```

---

## Troubleshooting

### Backend Won't Start
- Check Render logs for errors
- Verify all environment variables are set
- Ensure database is running
- Check database connection details

### Frontend Build Fails
- Check Vercel build logs
- Verify VITE_API_URL is set
- Ensure dependencies install correctly

### CORS Errors
- Verify CORS_ORIGIN matches frontend URL exactly
- Include protocol (https://)
- Check backend logs for CORS errors

### Database Connection Failed
- Verify DATABASE_URL is correct
- Check database is running
- Ensure migrations have been run
- Test connection from Render Shell

### API Calls Fail
- Verify VITE_API_URL is correct
- Check backend is running
- Verify CORS is configured
- Check browser console for errors

---

## Support

For detailed deployment instructions, see:
- [CLOUD_DEPLOYMENT_GUIDE.md](CLOUD_DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Deployment checklist
- [RELEASE_NOTES.md](RELEASE_NOTES.md) - Release notes

---

## Next Steps

1. Follow the deployment steps above
2. Complete the verification checklist
3. Fill in the deployment completion report
4. Report any issues encountered

The cloud deployment configuration has been successfully pushed to GitHub and is ready for your manual deployment.
