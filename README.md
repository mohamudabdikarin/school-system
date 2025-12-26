# School Management System

A comprehensive school management system built with Spring Boot (backend) and React (frontend), designed to manage students, teachers, courses, attendance, and more.

## 🏗️ Architecture

- **Backend**: Spring Boot 4.0.1 with PostgreSQL
- **Frontend**: React 18 with Vite and Tailwind CSS
- **Database**: PostgreSQL
- **Authentication**: JWT-based authentication
- **Deployment**: Railway (backend + database) + Vercel (frontend)

## 🚀 Features

- User authentication and authorization
- Student management
- Teacher management
- Course management
- Class scheduling
- Attendance tracking
- Exam management
- Report generation
- Dashboard analytics

## 🛠️ Tech Stack

### Backend
- Spring Boot 4.0.1
- Spring Security
- Spring Data JPA
- PostgreSQL
- JWT Authentication
- Maven

### Frontend
- React 18
- Vite
- Tailwind CSS
- Axios
- React Router
- React Hook Form
- Recharts

## 📦 Project Structure

```
school-management-system/
├── backend/
│   └── schoolsystem/          # Spring Boot application
│       ├── src/
│       ├── pom.xml
│       └── railway.json       # Railway deployment config
├── frontend/                  # React application
│   ├── src/
│   ├── package.json
│   └── vercel.json           # Vercel deployment config
├── DEPLOYMENT.md             # Deployment guide
└── deploy.sh                # Deployment script
```

## 🚀 Quick Start

### Prerequisites
- Java 25
- Node.js 18+
- PostgreSQL
- Maven

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd school-management-system
   ```

2. **Setup Backend**
   ```bash
   cd backend/schoolsystem
   # Update application.properties with your local database config
   mvn spring-boot:run
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:2020
   - Swagger UI: http://localhost:2020/swagger-ui.html

## 🌐 Deployment

This application is configured for deployment on:
- **Railway**: Backend + PostgreSQL database
- **Vercel**: Frontend

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy
```bash
chmod +x deploy.sh
./deploy.sh
```

## 🔧 Configuration

### Environment Variables

**Backend (Railway)**
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret
- `CORS_ALLOWED_ORIGINS`: Allowed frontend origins
- `SPRING_PROFILES_ACTIVE`: Set to `prod` for production

**Frontend (Vercel)**
- `VITE_API_BASE_URL`: Backend API URL

## 📚 API Documentation

Once the backend is running, visit `/swagger-ui.html` for interactive API documentation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For deployment issues, see [DEPLOYMENT.md](DEPLOYMENT.md) or create an issue in this repository.