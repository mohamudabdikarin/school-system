import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const AttendanceMark = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [dayOfWeek, setDayOfWeek] = useState('');
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (attendanceDate) {
            const date = new Date(attendanceDate);
            const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
            setDayOfWeek(days[date.getDay()]);
        }
    }, [attendanceDate]);

    useEffect(() => {
        if (selectedClass && dayOfWeek) {
            fetchPeriodsByClass();
        }
    }, [selectedClass, dayOfWeek]);

    useEffect(() => {
        if (selectedClass && selectedPeriod && attendanceDate) {
            fetchStudents();
            fetchExistingAttendance();
        }
    }, [selectedClass, selectedPeriod, attendanceDate]);

    const fetchClasses = async () => {
        try {
            const response = await axios.get('/classes');
            setClasses(response.data);
        } catch (err) {
            console.error('Error fetching classes:', err);
        }
    };

    const fetchPeriodsByClass = async () => {
        try {
            const response = await axios.get(`/periods/class/${selectedClass}/day/${dayOfWeek}`);
            setPeriods(response.data);
        } catch (err) {
            console.error('Error fetching periods:', err);
            setError('Failed to fetch periods for this class');
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await axios.get(`/classes/${selectedClass}/students`);
            setStudents(response.data);
            
            // Initialize attendance state
            const initialAttendance = {};
            response.data.forEach(student => {
                initialAttendance[student.id] = { present: false, remarks: '' };
            });
            setAttendance(initialAttendance);
        } catch (err) {
            console.error('Error fetching students:', err);
        }
    };

    const fetchExistingAttendance = async () => {
        try {
            const period = periods.find(p => p.id === parseInt(selectedPeriod));
            if (!period) return;

            const response = await axios.get(
                `/attendance/class/${selectedClass}/course/${period.courseId}/period/${selectedPeriod}`,
                { params: { date: attendanceDate } }
            );
            
            const existingAttendance = {};
            response.data.forEach(record => {
                existingAttendance[record.studentId] = {
                    present: record.present,
                    remarks: record.remarks || ''
                };
            });
            setAttendance(prev => ({ ...prev, ...existingAttendance }));
        } catch (err) {
            console.error('Error fetching existing attendance:', err);
        }
    };

    const toggleAttendance = (studentId) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                present: !prev[studentId]?.present
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const period = periods.find(p => p.id === parseInt(selectedPeriod));
            if (!period) {
                setError('Please select a valid period');
                setLoading(false);
                return;
            }

            const attendanceData = {
                classId: parseInt(selectedClass),
                courseId: period.courseId,
                periodId: parseInt(selectedPeriod),
                attendanceDate,
                students: Object.entries(attendance).map(([studentId, data]) => ({
                    studentId: parseInt(studentId),
                    present: data.present,
                    remarks: data.remarks
                }))
            };

            await axios.post('/attendance/mark', attendanceData);
            setSuccess('Attendance marked successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to mark attendance');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Mark Attendance</h1>

            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                    {success}
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Date
                        </label>
                        <input
                            type="date"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        {dayOfWeek && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{dayOfWeek}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Class
                        </label>
                        <select
                            value={selectedClass}
                            onChange={(e) => {
                                setSelectedClass(e.target.value);
                                setSelectedPeriod('');
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="">Select Class</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Period / Subject
                        </label>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            disabled={!selectedClass || periods.length === 0}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                        >
                            <option value="">Select Period</option>
                            {periods.map(period => (
                                <option key={period.id} value={period.id}>
                                    Period {period.periodNumber}: {period.courseName} ({period.startTime} - {period.endTime})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {students.length > 0 && (
                <form onSubmit={handleSubmit}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Student ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Present
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Remarks
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {students.map(student => (
                                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {student.user?.userId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {student.firstName} {student.lastName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                type="button"
                                                onClick={() => toggleAttendance(student.id)}
                                                className="inline-flex items-center justify-center"
                                            >
                                                {attendance[student.id]?.present ? (
                                                    <CheckCircleIcon className="h-8 w-8 text-green-500 hover:text-green-600 cursor-pointer" />
                                                ) : (
                                                    <XCircleIcon className="h-8 w-8 text-red-500 hover:text-red-600 cursor-pointer" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="text"
                                                value={attendance[student.id]?.remarks || ''}
                                                onChange={(e) => setAttendance(prev => ({
                                                    ...prev,
                                                    [student.id]: {
                                                        ...prev[student.id],
                                                        remarks: e.target.value
                                                    }
                                                }))}
                                                placeholder="Optional remarks"
                                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Attendance'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AttendanceMark;
