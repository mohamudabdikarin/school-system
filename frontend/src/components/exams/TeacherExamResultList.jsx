import { useState, useEffect, useContext } from 'react';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import TeacherExamResultFormModal from './TeacherExamResultFormModal';

const TeacherExamResultList = () => {
    const [examResults, setExamResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingResult, setEditingResult] = useState(null);
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [courses, setCourses] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!user?.userId) return;

        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const [examResponse, studentsResponse, classesResponse, coursesResponse] = await Promise.all([
                    axios.get(`/teacher/exam-results/${user.userId}`),
                    axios.get(`/teacher/students/${user.userId}`),
                    axios.get(`/teacher/classes/${user.userId}`),
                    axios.get('/courses')
                ]);

                setExamResults(examResponse.data);
                setStudents(studentsResponse.data);
                setClasses(classesResponse.data);
                setCourses(coursesResponse.data);
            } catch (err) {
                console.error('Error fetching teacher exam results:', err);
                if (err.response && err.response.status === 404) {
                    setExamResults([]); // No results, not an error
                } else {
                    setError('Failed to load exam results. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleAddResult = () => {
        setEditingResult(null);
        setShowModal(true);
    };

    const handleEditResult = (result) => {
        setEditingResult(result);
        setShowModal(true);
    };

    const handleDeleteResult = async (id) => {
        if (!window.confirm('Are you sure you want to delete this exam result?')) {
            return;
        }

        try {
            await axios.delete(`/exam-results/${id}`);
            setExamResults(examResults.filter(result => result.id !== id));
        } catch (err) {
            console.error('Error deleting exam result:', err);
            let msg = 'Failed to delete exam result. Please try again.';
            if (err.response?.data?.message) msg = err.response.data.message;
            else if (err.response?.data) msg = JSON.stringify(err.response.data);
            setError(msg);
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditingResult(null);
    };

    const handleModalSave = async (resultData) => {
        try {
            if (editingResult) {
                const response = await axios.put(`/exam-results/${editingResult.id}`, resultData);
                setExamResults(examResults.map(result =>
                    result.id === editingResult.id ? response.data : result
                ));
            } else {
                const response = await axios.post('/exam-results', resultData);
                setExamResults([...examResults, response.data]);
            }
            handleModalClose();
        } catch (err) {
            console.error('Error saving exam result:', err);
            let msg = 'Failed to save exam result. Please try again.';
            if (err.response?.data?.message) msg = err.response.data.message;
            else if (err.response?.data) msg = JSON.stringify(err.response.data);
            setError(msg);
        }
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
                <button onClick={() => setError('')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">Dismiss</button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Exam Results</h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        Manage exam results for your students
                    </p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={handleAddResult}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Result
                    </button>
                </div>
            </div>

            {examResults.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Exam Results</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        No exam results found for your students.
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Class
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Course
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Exam Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Marks
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Grade
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {examResults.map((result) => (
                                    <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {result.studentName || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {result.className || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {result.courseName || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {result.examType}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {result.examDate}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {result.marksObtained}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {result.grade}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditResult(result)}
                                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteResult(result.id)}
                                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showModal && (
                <TeacherExamResultFormModal
                    isOpen={showModal}
                    onClose={handleModalClose}
                    onSave={handleModalSave}
                    examResult={editingResult}
                    students={students}
                    classes={classes}
                    courses={courses}
                    isTeacher={true}
                />
            )}
        </div>
    );
};

export default TeacherExamResultList; 