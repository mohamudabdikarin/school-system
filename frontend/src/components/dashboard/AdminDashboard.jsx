import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import { UsersIcon, AcademicCapIcon, BookOpenIcon, ClockIcon, CurrencyDollarIcon, ChartBarIcon, ExclamationTriangleIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

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

const StatCard = ({ title, value, icon: Icon, color, to, subtitle }) => {
    const numericValue = typeof value === 'string' ? parseInt(value.replace(/,/g, '')) : value;
    const animatedValue = useCountAnimation(numericValue || 0);
    
    return (
        <Link to={to} className="block bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{title}</p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {animatedValue.toLocaleString()}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
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

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

  useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError('');
            try {
                // IMPORTANT: Ensure this endpoint exists and returns the correct data structure
                const response = await axios.get("/dashboard/admin");
                setStats(response.data);
            } catch (err) {
                console.error("Error fetching admin dashboard data:", err);
                setError("Could not load dashboard data. Please check the network connection and try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
  }, []);

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
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here's your school overview.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard 
                    title="Total Students" 
                    value={stats.totalStudents || 0} 
                    icon={UsersIcon} 
                    color="bg-blue-500" 
                    to="/students"
                    subtitle="+12% from last month"
                />
                <StatCard 
                    title="Total Teachers" 
                    value={stats.totalTeachers || 0} 
                    icon={AcademicCapIcon} 
                    color="bg-green-500" 
                    to="/teachers"
                    subtitle="+2 new this month"
                />
                <StatCard 
                    title="Active Classes" 
                    value={stats.totalClasses || 0} 
                    icon={BuildingLibraryIcon} 
                    color="bg-purple-500" 
                    to="/classes"
                    subtitle="All sections running"
                />
                <StatCard 
                    title="Total Courses" 
                    value={stats.totalCourses || 0} 
                    icon={BookOpenIcon} 
                    color="bg-orange-500" 
                    to="/courses"
                    subtitle="6 electives available"
                />
            </div>
    </div>
  );
};

export default AdminDashboard; 