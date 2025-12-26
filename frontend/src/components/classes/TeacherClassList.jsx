import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { PlusIcon, EyeIcon, PrinterIcon } from '@heroicons/react/24/outline';

const TeacherClassList = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!user?.userId) return;

        const fetchClasses = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`/teacher/classes/${user.userId}`);
                setClasses(response.data);
            } catch (err) {
                console.error('Error fetching teacher classes:', err);
                setError('Failed to load classes. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, [user]);

    const handlePrint = (classData) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Class Details - ${classData.name}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .class-info { margin-bottom: 20px; }
                        .class-name { font-size: 24px; font-weight: bold; color: #1f2937; }
                        .print-date { color: #6b7280; font-size: 14px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
                        th { background-color: #f3f4f6; font-weight: bold; }
                        .no-data { text-align: center; color: #6b7280; padding: 40px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>School Management System</h1>
                        <div class="class-info">
                            <div class="class-name">Class: ${classData.name}</div>
                            <div class="print-date">Printed on: ${new Date().toLocaleDateString()}</div>
                        </div>
                    </div>
                    <div class="no-data">
                        <p>Class details for ${classData.name}</p>
                        <p>This class is assigned to you as a teacher.</p>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error</h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Classes</h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        Classes assigned to you as a teacher
                    </p>
                </div>
            </div>

            {classes.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Classes Assigned</h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        You haven't been assigned to any classes yet.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map((classItem) => (
                        <div key={classItem.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {classItem.name}
                                </h3>
                            </div>

                            <div className="space-y-2 mb-6">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Class ID: {classItem.id}
                                </p>
                            </div>

                            <div className="flex space-x-2">
                                <Link
                                    to={`/classes/${classItem.id}`}
                                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                >
                                    <EyeIcon className="h-4 w-4 mr-2" />
                                    View Details
                                </Link>
                                <button
                                    onClick={() => handlePrint(classItem)}
                                    className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <PrinterIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeacherClassList; 