# School Management System - Deployment Guide

## Prerequisites
- Railway account (https://railway.app)
- Vercel account (https://vercel.com)
- Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Deploy PostgreSQL Database on Railway

1. Go to Railway.app and create a new project
2. Click "Add Service" → "Database" → "PostgreSQL"
3. Note down the database connection details from the "Variables" tab:
   - `DATABASE_URL` (complete connection string)

## Step 2: Deploy Spring Boot Backend on Railway

1. In the same Railway project, click "Add Service" → "GitHub Repo"
2. Connect your repository and select the backend folder
3. Set the following environment variables in Railway:
   ```
   DATABASE_URL=<your-postgresql-connection-string>
   JWT_SECRET=AmalSECRETJwtKeyCodeForSchoolManagement-System-Production-2025
   CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3000
   SPRING_PROFILES_ACTIVE=prod
   ```
4. Set the root directory to `backend/schoolsystem`
5. Railway will automatically detect the Java application and deploy it

## Step 3: Deploy React Frontend on Vercel

1. Go to Vercel.com and create a new project
2. Import your Git repository
3. Set the root directory to `frontend`
4. Set the following environment variables:
   ```
   VITE_API_BASE_URL=https://your-backend-url.railway.app/api/v1
   ```
5. Deploy the project

## Step 4: Update CORS Configuration

After getting your Vercel domain:
1. Go back to Railway backend service
2. Update the `CORS_ALLOWED_ORIGINS` environment variable:
   ```
   CORS_ALLOWED_ORIGINS=https://your-actual-frontend-domain.vercel.app
   ```
3. Redeploy the backend service

## Step 5: Update Frontend API URL

1. Update the `.env.production` file in the frontend with your actual Railway backend URL
2. Redeploy the frontend on Vercel

## Database Migration

The application is configured with `spring.jpa.hibernate.ddl-auto=update` in production, which will automatically create/update tables on first run.

## Monitoring and Logs

- **Backend logs**: Available in Railway dashboard
- **Frontend logs**: Available in Vercel dashboard
- **Health check**: `https://your-backend-url.railway.app/actuator/health`

## Security Notes

- JWT secret is configured via environment variable
- CORS is properly configured for your frontend domain
- Database credentials are managed by Railway
- All connections use HTTPS in production

## Troubleshooting

1. **CORS errors**: Ensure `CORS_ALLOWED_ORIGINS` includes your exact Vercel domain
2. **Database connection**: Check `DATABASE_URL` format and Railway PostgreSQL status
3. **API calls failing**: Verify `VITE_API_BASE_URL` points to correct Railway backend URL
4. **Build failures**: Check logs in respective platforms (Railway/Vercel)