import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import DashboardLayout from "./layouts/DashboardLayout";

// --- Components ---
import Login from "./components/auth/Login";
import AdminDashboard from "./components/dashboard/AdminDashboard";
import TeacherDashboard from "./components/dashboard/TeacherDashboard";
import StudentDashboard from "./components/dashboard/StudentDashboard";
import StudentList from "./components/students/StudentList";
import TeacherList from "./components/teachers/TeacherList";
import TeacherCourseList from "./components/teachers/TeacherCourseList";
import CourseList from "./components/courses/CourseList";

import ExamResultList from "./components/exams/ExamResultList";
import TeacherExamResultList from "./components/exams/TeacherExamResultList";
import UserList from "./components/users/UserList";
import ClassList from "./components/classes/ClassList";
import ClassDetails from "./components/classes/ClassDetails";
import TeacherClassList from "./components/classes/TeacherClassList";
import AttendanceMark from "./components/attendance/AttendanceMark";
import PeriodManagement from "./components/attendance/PeriodManagement";
// Note: Other minor components like FileUpload, ReportDownload will be integrated into their respective pages later.

// A wrapper for routes that require authentication.
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, authLoading } = useContext(AuthContext);

  if (authLoading) {
  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="loader" />
    </div>
  );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

// Redirects logged-in users from the root path to their respective dashboards.
function RootRedirect() {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "ROLE_ADMIN":
      return <Navigate to="/admin" replace />;
    case "ROLE_TEACHER":
      return <Navigate to="/teacher" replace />;
    case "ROLE_STUDENT":
      return <Navigate to="/student" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
}

function Unauthorized() {
  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-4xl font-bold text-red-600 mb-4">403 - Unauthorized</h1>
        <p className="text-lg text-gray-700">You do not have permission to view this page.</p>
        <Link to="/" className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Go to Homepage
        </Link>
    </div>
  );
}

function App() {
  return (
      <Routes>
      {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Root path logic */}
      <Route path="/" element={<RootRedirect />} />

      {/* Protected routes within the main dashboard layout */}
        <Route
          element={
          <ProtectedRoute>
            <DashboardLayout />
            </ProtectedRoute>
          }
      >
        {/* Dashboards */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/teacher" element={<ProtectedRoute allowedRoles={["ROLE_TEACHER"]}><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/student" element={<ProtectedRoute allowedRoles={["ROLE_STUDENT"]}><StudentDashboard /></ProtectedRoute>} />
        
        {/* Management Pages */}
        <Route path="/users" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><UserList /></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_TEACHER"]}><StudentList /></ProtectedRoute>} />
        <Route path="/teachers" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><TeacherList /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_TEACHER"]}><CourseList /></ProtectedRoute>} />
        
        <Route path="/exam-results" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_TEACHER", "ROLE_STUDENT"]}><ExamResultList /></ProtectedRoute>} />
        
        <Route path="/classes" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><ClassList /></ProtectedRoute>} />
        <Route path="/classes/:id" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_TEACHER"]}><ClassDetails /></ProtectedRoute>} />
        
        {/* Teacher-specific routes */}
        <Route path="/teacher/classes" element={<ProtectedRoute allowedRoles={["ROLE_TEACHER"]}><TeacherClassList /></ProtectedRoute>} />
        <Route path="/teacher/courses" element={<ProtectedRoute allowedRoles={["ROLE_TEACHER"]}><TeacherCourseList /></ProtectedRoute>} />
        <Route path="/teacher/exam-results" element={<ProtectedRoute allowedRoles={["ROLE_TEACHER"]}><TeacherExamResultList /></ProtectedRoute>} />
        
        {/* Attendance routes */}
        <Route path="/attendance/mark" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_TEACHER"]}><AttendanceMark /></ProtectedRoute>} />
        <Route path="/periods" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><PeriodManagement /></ProtectedRoute>} />
        
        {/* Add other nested routes here */}
      </Route>

      {/* Fallback for any other path */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

export default App;