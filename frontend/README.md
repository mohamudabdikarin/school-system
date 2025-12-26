# School Management System - Frontend

A modern React-based frontend for the School Management System with role-based access control, built with Vite.

## Features

- **Authentication**: JWT-based login/logout
- **Role-based Dashboards**: Admin, Teacher, Student
- **Student Management**: CRUD operations, list view
- **Teacher Management**: CRUD operations, list view
- **Fee Management**: View fees, payment status
- **Course Management**: View courses and details
- **Timetable**: View class schedules
- **Attendance**: Track and view attendance records
- **Exam Management**: View exams and results
- **Library Management**: View books and borrowed items
- **Reports**: Download PDF reports
- **Excel Import/Export**: Upload and download Excel files

## Tech Stack

- React 18
- Vite (Build Tool)
- React Router DOM
- TailwindCSS
- Axios
- React Hook Form
- React Hot Toast

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. The app will open at `http://localhost:5173`

## Backend Integration

The frontend is configured to connect to the Spring Boot backend running on `http://localhost:8080`. Make sure the backend is running before using the frontend.

## Available Scripts

- `npm run dev`: Start development server (Vite)
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## Project Structure

```
src/
├── api/
│   └── axios.js          # Axios configuration
├── components/
│   ├── auth/
│   │   └── Login.jsx     # Login component
│   ├── common/
│   │   ├── Navbar.jsx    # Navigation bar
│   │   ├── Sidebar.jsx   # Sidebar navigation
│   │   ├── ProtectedRoute.jsx # Route protection
│   │   └── FileUpload.jsx # File upload component
│   ├── dashboard/
│   │   ├── AdminDashboard.jsx
│   │   ├── TeacherDashboard.jsx
│   │   └── StudentDashboard.jsx
│   ├── students/
│   │   ├── StudentList.jsx
│   │   └── StudentForm.jsx
│   ├── teachers/
│   │   └── TeacherList.jsx
│   ├── fees/
│   │   └── FeeList.jsx
│   ├── courses/
│   │   └── CourseList.jsx
│   ├── timetable/
│   │   └── TimetableList.jsx
│   ├── attendance/
│   │   └── AttendanceList.jsx
│   ├── exams/
│   │   ├── ExamList.jsx
│   │   └── ExamResultList.jsx
│   ├── library/
│   │   ├── BookList.jsx
│   │   └── BorrowedBooks.jsx
│   └── reports/
│       └── ReportDownload.jsx
├── context/
│   └── AuthContext.jsx   # Authentication context
├── App.jsx              # Main app component
├── main.jsx             # Entry point (Vite)
└── index.css            # Global styles
```

## Usage

1. **Login**: Use the provided credentials to log in
   - Admin: `admin` / `password`
   - Teacher: `teacher` / `password`
   - Student: `student` / `password`

2. **Navigation**: Use the sidebar to navigate between different modules

3. **Role-based Access**: Different features are available based on user role

## API Endpoints

The frontend connects to the following backend endpoints:
- `/api/v1/auth/login` - Authentication
- `/api/v1/dashboard/*` - Dashboard data
- `/api/v1/students` - Student management
- `/api/v1/teachers` - Teacher management
- `/api/v1/fees` - Fee management
- `/api/v1/courses` - Course management
- `/api/v1/timetables` - Timetable management
- `/api/v1/attendance` - Attendance management
- `/api/v1/exams` - Exam management
- `/api/v1/books` - Library management
- `/api/v1/reports` - Report generation
- `/api/v1/excel` - Excel import/export

## Vite Configuration

The project uses Vite for faster development and building:
- Hot Module Replacement (HMR)
- Fast refresh
- Optimized builds
- Proxy configuration for API calls

## Contributing

1. Follow the existing code structure
2. Use TailwindCSS for styling
3. Implement proper error handling
4. Add loading states where appropriate
5. Test thoroughly before submitting

## License

This project is part of the School Management System. 