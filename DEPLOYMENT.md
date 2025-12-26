# School Management System - Deployment Guide

## Prerequisites
- Render account (https://render.com) - Free tier available
- Supabase account (https://supabase.com) - Free tier available  
- Vercel account (https://vercel.com) - Free tier available
- Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Deploy PostgreSQL Database on Supabase

1. Go to Supabase.com and create a new project
2. Choose a project name and database password
3. Wait for the project to be created (2-3 minutes)
4. Go to Settings → Database
5. Copy the connection string from "Connection string" → "URI"
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@[HOST]:[PORT]/postgres`

## Step 2: Deploy Spring Boot Backend on Render

1. Go to Render.com and create a new Web Service
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: school-management-backend
   - **Root Directory**: `backend/schoolsystem`
   - **Environment**: Java
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -Dspring.profiles.active=prod -jar target/schoolsystem-0.0.1-SNAPSHOT.jar`
4. Set the following environment variables:
   ```
   DATABASE_URL=<your-supabase-connection-string>
   JWT_SECRET=AmalSECRETJwtKeyCodeForSchoolManagement-System-Production-2025
   CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   SPRING_PROFILES_ACTIVE=prod
   ```
5. Deploy the service

## Step 3: Deploy React Frontend on Vercel

1. Go to Vercel.com and create a new project
2. Import your Git repository
3. Set the root directory to `frontend`
4. Set the following environment variables:
   ```
   VITE_API_BASE_URL=https://your-backend-url.onrender.com/api/v1
   ```
5. Deploy the project

## Step 4: Update CORS Configuration

After getting your Vercel domain:
1. Go back to Render backend service
2. Update the `CORS_ALLOWED_ORIGINS` environment variable:
   ```
   CORS_ALLOWED_ORIGINS=https://your-actual-frontend-domain.vercel.app
   ```
3. Redeploy the backend service

## Step 5: Update Frontend API URL

1. Update the `.env.production` file in the frontend with your actual Render backend URL
2. Redeploy the frontend on Vercel

## Database Migration

The application is configured with `spring.jpa.hibernate.ddl-auto=update` in production, which will automatically create/update tables on first run.

## Monitoring and Logs

- **Backend logs**: Available in Render dashboard
- **Frontend logs**: Available in Vercel dashboard  
- **Database**: Monitor in Supabase dashboard
- **Health check**: `https://your-backend-url.onrender.com/actuator/health`

## Security Notes

- JWT secret is configured via environment variable
- CORS is properly configured for your frontend domain
- Database credentials are managed by Supabase
- All connections use HTTPS in production

## Troubleshooting

1. **CORS errors**: Ensure `CORS_ALLOWED_ORIGINS` includes your exact Vercel domain
2. **Database connection**: Check `DATABASE_URL` format and Supabase project status
3. **API calls failing**: Verify `VITE_API_BASE_URL` points to correct Render backend URL
4. **Build failures**: Check logs in respective platforms (Render/Vercel)
5. **Cold starts**: Render free tier has cold starts - first request may be slow