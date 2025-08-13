# Deployment Guide

This guide will help you deploy your Custom Form Builder project on Railway (backend) and Vercel (frontend).

## Prerequisites

1. **GitHub Account**: Make sure your project is pushed to GitHub
2. **Railway Account**: Sign up at [railway.app](https://railway.app)
3. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
4. **MongoDB Atlas Account**: For database hosting (recommended)

## Step 1: Deploy Backend on Railway

### 1.1 Set up MongoDB Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier is fine)
3. Create a database user with read/write permissions
4. Get your connection string

### 1.2 Deploy on Railway
1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set the root directory to `backend`
5. Add environment variables:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   PORT=5000
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```
6. Deploy the project
7. Note down your Railway app URL (e.g., `https://your-app-name.railway.app`)

### 1.3 Verify Backend Deployment
- Visit `https://your-app-name.railway.app/api/test`
- You should see: `{"message": "Backend is working!"}`

## Step 2: Deploy Frontend on Vercel

### 2.1 Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project" → "Import Git Repository"
3. Select your repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables:
   ```
   VITE_API_URL=https://your-railway-backend-url.railway.app/api/forms
   ```
6. Deploy the project

### 2.2 Verify Frontend Deployment
- Visit your Vercel app URL
- Test the form builder functionality
- Check that it connects to your Railway backend

## Step 3: Update CORS Configuration

After getting your Vercel domain, update the CORS configuration in Railway:

1. Go to your Railway project dashboard
2. Update the `CORS_ORIGIN` environment variable:
   ```
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```
3. Redeploy the backend

## Step 4: Test Your Deployment

1. **Backend Health Check**: `https://your-railway-app.railway.app/api/test`
2. **Frontend**: Visit your Vercel app URL
3. **Create a form**: Test the form builder functionality
4. **Database**: Verify data is being saved to MongoDB Atlas

## Environment Variables Reference

### Backend (Railway)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/form-builder
PORT=5000
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-railway-backend-url.railway.app/api/forms
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure `CORS_ORIGIN` is set correctly in Railway
2. **Database Connection**: Verify MongoDB Atlas connection string
3. **Build Failures**: Check that all dependencies are in `package.json`
4. **API 404**: Ensure the Railway app is running and accessible

### Debugging Steps

1. Check Railway logs for backend errors
2. Check Vercel build logs for frontend issues
3. Test API endpoints directly using tools like Postman
4. Verify environment variables are set correctly

## Cost Considerations

- **Railway**: Free tier includes 500 hours/month
- **Vercel**: Free tier includes unlimited deployments
- **MongoDB Atlas**: Free tier includes 512MB storage

## Security Notes

1. Never commit `.env` files to Git
2. Use environment variables for sensitive data
3. Set up proper CORS origins
4. Consider adding authentication for production use

## Next Steps

1. Set up custom domains (optional)
2. Configure CI/CD pipelines
3. Add monitoring and logging
4. Implement user authentication
5. Set up automated backups for your database
