import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios"; // Assuming this axios instance is correctly configured
import { AuthContext } from "../../context/AuthContext";
import { ClockIcon, ChartBarIcon, BookOpenIcon, CurrencyDollarIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

// StatCard component for displaying individual statistics
const StatCard = ({ title, value, icon: Icon, color, to }) => (
    <Link to={to} className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all p-6">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="h-7 w-7 text-white" />
            </div>
        </div>
    </Link>
);

// DashboardLoader component for displaying a loading skeleton
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

// Main StudentDashboard component
const StudentDashboard = () => {
    // Access user context for authentication details
    const { user } = useContext(AuthContext);
    // State to store dashboard statistics
    const [stats, setStats] = useState({});
    // State to manage loading status
    const [loading, setLoading] = useState(true);
    // State to store any error messages
    const [error, setError] = useState('');

    // useEffect hook to fetch dashboard data when the component mounts or user changes
    useEffect(() => {
        // Log the user object to the console for debugging purposes
        console.log("User from AuthContext:", user);

        // Ensure user and user.userId are available before attempting to fetch data
        if (!user?.userId) {
            console.warn("User ID not available, skipping dashboard data fetch.");
            setLoading(false); // Stop loading animation
            setError("User not logged in or user ID is missing."); // Inform the user
            return;
        }

        // Asynchronous function to fetch dashboard data
        const fetchDashboardData = async () => {
            setLoading(true); // Start loading
            setError(''); // Clear previous errors
            try {
                // Make a GET request to the student dashboard endpoint
                // Sending user.userId directly as a string (axios will handle URL encoding)
                const response = await axios.get(`/dashboard/student/${user.userId}`);
                setStats(response.data); // Set the fetched data to state
            } catch (err) {
                console.error("Error fetching student dashboard data:", err);
                // Provide more specific error messages based on the HTTP response status
                if (err.response) {
                    if (err.response.status === 403) {
                        setError("Access Denied: You do not have permission to view this dashboard. Please ensure you are logged in as a student.");
                    } else if (err.response.status === 404) {
                        setError("Dashboard data not found for this user. Please ensure your student profile exists in the system.");
                    } else if (err.response.status >= 400 && err.response.status < 500) {
                        setError(`Client Error (${err.response.status}): ${err.response.data?.message || "An invalid request was sent."}`);
                    } else if (err.response.status >= 500) {
                        setError(`Server Error (${err.response.status}): An issue occurred on the server. Please try again later.`);
                    } else {
                        setError("Could not load your dashboard data. An unexpected response was received.");
                    }
                } else if (err.request) {
                    // The request was made but no response was received (e.g., network down)
                    setError("Network Error: No response received from the server. Please check your internet connection.");
                } else {
                    // Something happened in setting up the request that triggered an Error
                    setError("An unexpected error occurred while setting up the request. Please try again later.");
                }
            } finally {
                setLoading(false); // Stop loading regardless of success or failure
            }
        };
        fetchDashboardData(); // Call the fetch function
    }, [user]); // Re-run effect if the 'user' object changes

    // Render loading skeleton if data is still loading
    if (loading) {
        return <DashboardLoader />;
    }

    // Render error message if an error occurred
    if (error) {
        return (
            <div className="text-center py-10 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-2 text-lg font-medium text-red-800 dark:text-red-200">Failed to Load Dashboard</h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
        );
    }

    // Render the dashboard content once data is loaded successfully
    const student = stats.student || {};
    const userId = student.user && student.user.userId ? student.user.userId : '-';
    const name = student.firstName && student.lastName ? `${student.firstName} ${student.lastName}` : (student.firstName || student.lastName ? `${student.firstName || ''}${student.lastName || ''}` : '-');
    const className = student.schoolClass && student.schoolClass.name ? student.schoolClass.name : '-';
    const registeredYear = student.admissionDate ? new Date(student.admissionDate).getFullYear() : '-';

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 sm:p-10 font-sans">
            {/* Student Info Section */}
            <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col sm:flex-row gap-4 sm:gap-10">
                <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Student ID</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{userId}</div>
                </div>
                <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Name</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{name}</div>
                </div>
                <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Class</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{className}</div>
                </div>
                <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Registered Year</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{registeredYear}</div>
            </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
