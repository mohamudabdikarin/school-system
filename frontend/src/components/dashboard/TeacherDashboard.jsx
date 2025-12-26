import { useEffect, useState, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { UsersIcon, BookOpenIcon, CalendarDaysIcon, ChartBarIcon, ExclamationTriangleIcon, BuildingLibraryIcon } from "@heroicons/react/24/outline";

// Custom hook for counting animation
const useCountAnimation = (end, duration = 2000) => {
    const [count, setCount] = useState(0);
    const countRef = useRef(0);
    const startTimeRef = useRef(null);

    useEffect(() => {
        if (end === 0) {
            setCount(0);
            return;
        }

        const animate = (timestamp) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const progress = timestamp - startTimeRef.current;
            const percentage = Math.min(progress / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
            const current = Math.floor(easeOutQuart * end);
            
            countRef.current = current;
            setCount(current);

            if (percentage < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        requestAnimationFrame(animate);

        return () => {
            startTimeRef.current = null;
        };
    }, [end, duration]);

    return count;
};

const StatCard = ({ title, value, icon: Icon, color, to }) => {
    const numericValue = typeof value === 'string' ? parseInt(value.replace(/,/g, '')) : value;
    const animatedValue = useCountAnimation(numericValue || 0);
    
    return (
        <Link to={to} className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                        {animatedValue.toLocaleString()}
                    </p>
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="h-7 w-7 text-white" />
                </div>
            </div>
        </Link>
    );
};

const DashboardLoader = () => (
    <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-10"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-700 h-32 rounded-xl"></div>
            ))}
        </div>
    </div>
);

const TeacherDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user?.userId) return;

        const fetchDashboardData = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`/dashboard/teacher?teacherUserId=${user.userId}`);
                setStats(response.data);
            } catch (err) {
                console.error("Error fetching teacher dashboard data:", err);
                setError("Could not load your dashboard data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [user]);

    if (loading) {
        return <DashboardLoader />;
    }

    if (error) {
        return (
            <div className="text-center py-10 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-2 text-lg font-medium text-red-800 dark:text-red-200">Failed to Load Dashboard</h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teacher Dashboard</h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">Welcome back, {user?.firstName || 'Teacher'}!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Your Classes"
                    value={stats.totalClasses?.toLocaleString() || "0"}
                    icon={BuildingLibraryIcon}
                    color="bg-blue-500"
                    to="/teacher/classes"
                />
                <StatCard
                    title="Your Courses"
                    value={stats.totalCourses?.toLocaleString() || "0"}
                    icon={BookOpenIcon}
                    color="bg-purple-500"
                    to="/teacher/courses"
                />
            </div>
        </div>
    );
};

export default TeacherDashboard;