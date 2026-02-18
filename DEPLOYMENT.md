# Deployment Guide - Render + Vercel

This guide explains how to deploy the Super Admin Maintenance Control Panel using:
- **Backend**: Render.com (Node.js)
- **Frontend**: Vercel.com (Static Files)

---

## Prerequisites

1. **GitHub Account** - Push your code to GitHub
2. **MongoDB Atlas** - Database already set up
3. **Render Account** - https://render.com
4. **Vercel Account** - https://vercel.com

---

## Step 1: Prepare Code for Deployment

### 1.1 Update Environment Variables

Update `.env.production` with your actual deployed URLs:

```env
BACKEND_URL=https://your-backend.onrender.com
FRONTEND_URL=https://your-frontend.vercel.app
ADMIN_PANEL_URL=https://your-admin-panel.vercel.app
```

### 1.2 Push to GitHub

```bash
git add .
git commit -m "Deploy configuration for Render + Vercel"
git push -u origin main
```

---

## Step 2: Deploy Backend on Render

### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### 2.2 Deploy Using render.yaml

**Option A: Manual Deployment (Recommended)**

1. Log in to Render Dashboard
2. Click "**New +**" → "**Web Service**"
3. Connect your GitHub repository
4. Select the repository: `BioMuseumNewRepo/Maintenance-Control`
5. Configure the service:
   - **Name**: `servermaintenancecontrolsbes`
   - **Root Directory**: `.` (dot - repository root)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or Paid for production)

6. Go to **Environment** tab and add these variables:
   ```
   NODE_ENV=production
   PORT=5001
   MONGODB_URI=<your_mongodb_connection_string>
   DB_NAME=ZOOMUSEUMSBES
   JWT_SECRET=<generate_strong_random_string>
   FRONTEND_URL=https://<your-vercel-app>.vercel.app
   BACKEND_URL=https://<your-render-service>.onrender.com
   LOG_LEVEL=info
   ```

7. Click **"Create Web Service"**
8. Wait for deployment to complete (5-10 minutes)
9. Copy your backend URL from Render dashboard (e.g., `https://biomuseum-admin-backend.onrender.com`)

**Option B: Using render.yaml**
```bash
# Render will auto-detect render.yaml in your repo root
# Just connect GitHub and it will use the configuration
```

### 2.3 Verify Backend Deployment

```bash
# Test your backend endpoint
curl https://your-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Super Admin Panel is running"
}
```

---

## Step 3: Deploy Frontend on Vercel

### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel to access your repositories

### 3.2 Deploy Frontend

1. Log in to Vercel Dashboard
2. Click **"Add New"** → **"Project"**
3. Select your repository (`sbeszoomuseum/Maintenance-Control`)
4. Configure the project:
   - **Project Name**: `zoomaintenance`
   - **Framework Preset**: Other (Static)
   - **Root Directory**: `./frontend`
   - **Build Command**: Leave blank (no build needed)
   - **Output Directory**: `.` (current directory)

5. Go to **Environment Variables** and add:
   ```
   REACT_APP_BACKEND_URL=https://servermaintenancecontrolsbes.onrender.com
   ```

6. Click **"Deploy"**
7. Wait for deployment (2-5 minutes)
8. Get your Vercel frontend URL (e.g., `https://zoomaintenance.vercel.app`)

### 3.3 Update Frontend Configuration

After getting your Vercel URL, add a `config.js` to frontend:

```javascript
// frontend/config.js
window.__BACKEND_URL__ = 'https://servermaintenancecontrolsbes.onrender.com';
window.__FRONTEND_URL__ = 'https://zoomaintenance.vercel.app';
```

Then reference it in `index.html` before other scripts:

```html
<script src="/config.js"></script>
<script src="/js/api.js"></script>
```

---

## Step 4: Update Backend CORS Configuration

Update `backend/server.js` to allow your Vercel URLs:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5001',
    'https://*.vercel.app',
    'https://your-frontend.vercel.app'
  ],
  credentials: true
};

app.use(cors(corsOptions));
```

```bash
# Restart backend on Render after pushing this change
git push origin main
```

---

## Step 5: Update Client Website Integration

For client websites to use the deployed status endpoint:

```javascript
// Client website code
const ADMIN_PANEL_URL = 'https://servermaintenancecontrolsbes.onrender.com';
const CLIENT_ID = 'biomuseum-main';

fetch(`${ADMIN_PANEL_URL}/api/maintenance/status/${CLIENT_ID}`)
  .then(res => res.json())
  .then(data => {
    if (data.data.status !== 'active') {
      // Show popup
    }
  });
```

---

## Step 6: Verification Checklist

After deployment, verify:

- [ ] Backend health check: `https://servermaintenancecontrolsbes.onrender.com/health`
- [ ] Frontend loads: `https://zoomaintenance.vercel.app`
- [ ] Admin login works: `https://zoomaintenance.vercel.app`
- [ ] Can create clients via API
- [ ] Client popup endpoint responds: `https://servermaintenancecontrolsbes.onrender.com/api/maintenance/status/biomuseum-main`
- [ ] Database connections work
- [ ] CORS errors don't appear in browser console

---

## Troubleshooting

### Backend Deployment Issues

**"Address already in use"**
- Solution: Change PORT in environment variables or restart service

**"MongoDB connection failed"**
- Check MONGODB_URI in Render environment variables
- Verify MongoDB Atlas IP whitelist includes Render's IPs

**"CORS errors"**
- Update corsOptions in server.js with correct frontend URL
- Add frontend URL to environment variables

### Frontend Deployment Issues

**"API calls return 404"**
- Check REACT_APP_BACKEND_URL is set correctly
- Verify backend is running and accessible

**"Blank page or 404"**
- Check root directory is set to `./super-admin-panel/frontend`
- Verify `index.html` exists in that directory

---

## Environment Variables Summary

### Backend (Render)
```
NODE_ENV=production
PORT=5001
MONGODB_URI=<connection_string>
DB_NAME=ZOOMUSEUMSBES
JWT_SECRET=<random_strong_string>
FRONTEND_URL=https://zoomaintenance.vercel.app
BACKEND_URL=https://servermaintenancecontrolsbes.onrender.com
LOG_LEVEL=info
DEBUG=false
```

### Frontend (Vercel)
```
REACT_APP_BACKEND_URL=https://servermaintenancecontrolsbes.onrender.com
```

---

## Post-Deployment Steps

1. **Test Admin Panel**: Login at `https://zoomaintenance.vercel.app`
2. **Create Test Client**: Add a client with test data
3. **Verify Status Endpoint**: Check popup endpoint responds correctly
4. **Enable Auto-Redeploys**: 
   - Render: Already enabled by default
   - Vercel: Enabled when linked to GitHub

5. **Set Up Monitoring**:
   - Render: Monitor service health
   - Vercel: Check analytics dashboard

---

## Scaling & Production

For production with paid plans:

- **Render**: Upgrade to Standard plan for better uptime
- **Vercel**: Use Pro plan for advanced features
- **Database**: Scale MongoDB Atlas as needed
- **SSL/HTTPS**: Automatically handled by both platforms

---

## Support & Resources

- Render Documentation: https://render.com/docs
- Vercel Documentation: https://vercel.com/docs
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Express.js: https://expressjs.com

---

## Quick Deploy Summary

```bash
# 1. Prepare production environment
cp .env.production .env

# 2. Push to GitHub
git add . && git commit -m "Production deployment" && git push

# 3. Deploy Backend on Render
# - Connect GitHub → Create Web Service → Add env vars → Deploy

# 4. Deploy Frontend on Vercel
# - Connect GitHub → Create Project → Set root directory → Deploy

# 5. Update environment variables across services
# - Add actual URLs after deployment completes
```

---

**Deployed URLs Example:**
- Backend: `https://servermaintenancecontrolsbes.onrender.com`
- Frontend: `https://zoomaintenance.vercel.app`
- Status Endpoint: `https://servermaintenancecontrolsbes.onrender.com/api/maintenance/status/biomuseum-main`

---

Last Updated: February 18, 2026
