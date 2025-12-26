import { useContext, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
    HomeIcon, UserGroupIcon, AcademicCapIcon, CurrencyDollarIcon, BookOpenIcon,
    CalendarDaysIcon, ClipboardDocumentCheckIcon, DocumentTextIcon, ChartBarIcon,
    UsersIcon, BuildingLibraryIcon, LifebuoyIcon, ArrowLeftOnRectangleIcon, ClockIcon
} from '@heroicons/react/24/outline';

const iconMap = {
    Dashboard: HomeIcon,
    'User Management': UsersIcon,
    Students: UserGroupIcon,
    Teachers: AcademicCapIcon,
    Classes: BuildingLibraryIcon,
    Courses: BookOpenIcon,
    'Exam Results': ChartBarIcon,
    'Mark Attendance': ClipboardDocumentCheckIcon,
    'Periods': ClockIcon,
};

const getLinks = (role) => {
    const baseLinks = [];

    switch (role) {
        case "ROLE_ADMIN":
            return [
                { to: "/admin", label: "Dashboard" },
                { to: "/users", label: "User Management" },
                { to: "/students", label: "Students" },
                { to: "/teachers", label: "Teachers" },
                { to: "/classes", label: "Classes" },
                { to: "/courses", label: "Courses" },
                { to: "/exam-results", label: "Exam Results" },
                { to: "/attendance/mark", label: "Mark Attendance" },
                { to: "/periods", label: "Periods" },
                ...baseLinks
            ];
        case "ROLE_TEACHER":
            return [
                { to: "/teacher", label: "Dashboard" },
                { to: "/teacher/classes", label: "Classes" },
                { to: "/teacher/courses", label: "Courses" },
                { to: "/teacher/exam-results", label: "Exam Results" },
                { to: "/attendance/mark", label: "Mark Attendance" },
                ...baseLinks
            ];
        case "ROLE_STUDENT":
            return [
                { to: "/exam-results", label: "Exam Results" },
                ...baseLinks
            ];
        default:
            return baseLinks;
    }
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const { user, logout } = useContext(AuthContext);
    const navLinks = user ? getLinks(user.role) : [];

    // Correctly handle active link styling for both light and dark modes
    const getLinkClassName = ({ isActive }) => {
        const baseClasses = 'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all';
        const inactiveClasses = 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white';
        const activeClasses = 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
        return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
    };

    return (
        <aside className={`w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0`}>
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 h-16 px-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">EM</span>
                    </div>
                    <Link to="/" className="text-lg font-bold text-gray-900 dark:text-white">
                        EduManage
                    </Link>
                </div>
                <nav className="flex-1 px-3 py-4 overflow-y-auto">
                    <ul className="space-y-1">
                        {navLinks.map(({ to, label }) => {
                            const Icon = iconMap[label];
                            const isDashboard = label === 'Dashboard';
                            return (
                                <li key={label}>
                                    <NavLink
                                        to={to}
                                        className={getLinkClassName}
                                        onClick={() => setSidebarOpen(false)}
                                        {...(isDashboard ? { end: true } : {})}
                                    >
                                        {Icon && <Icon className="w-5 h-5" />}
                                        <span>{label}</span>
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
                <div className="p-3 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                        <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar; 