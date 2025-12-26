import React, { useState, useEffect } from 'react';
import axios from '../../api/axios'; // Assuming this is correctly configured

export default function TeacherExamResultFormModal({
    isOpen,
    onClose,
    onSave, // This prop is expected to be an async function that handles the API call
    examResult,
    students, // These props are likely for initial dropdown populations, though classStudents/classCourses are fetched dynamically
    classes,
    courses
}) {
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [examType, setExamType] = useState('Midterm');
    const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
    const [marks, setMarks] = useState(''); // Keep as string for input, parse before sending
    const [remarks, setRemarks] = useState('');

    const [loading, setLoading] = useState(false); // State for loading indicator
    const [error, setError] = useState(''); // State for displaying form-level errors

    // New: dynamic students/courses for selected class
    const [classStudents, setClassStudents] = useState([]);
    const [classCourses, setClassCourses] = useState([]);

    const isEditMode = Boolean(examResult);

    useEffect(() => {
        if (!isOpen) return; // Only run when modal is open

        if (isEditMode && examResult) {
            // Populate form fields if in edit mode
            setSelectedClass(examResult.classId?.toString() || '');
            setSelectedStudent(examResult.studentId?.toString() || '');
            setSelectedCourse(examResult.courseId?.toString() || '');
            setExamType(examResult.examType || 'Midterm');
            setMarks(examResult.marksObtained?.toString() || ''); // Display as string
            setRemarks(examResult.remarks || '');
            if (examResult.examDate) {
                // Handle different date formats from backend if necessary
                const dateObj = Array.isArray(examResult.examDate)
                    ? new Date(examResult.examDate[0], examResult.examDate[1] - 1, examResult.examDate[2])
                    : new Date(examResult.examDate);
                setExamDate(dateObj.toISOString().split('T')[0]); // Format for input type="date"
            }
        } else {
            // Reset form fields for add mode
            setSelectedClass('');
            setSelectedStudent('');
            setSelectedCourse('');
            setExamType('Midterm');
            setExamDate(new Date().toISOString().split('T')[0]);
            setMarks('');
            setRemarks('');
        }
        // Clear errors and loading state on modal open/reset
        setError('');
        setLoading(false);
    }, [isOpen, examResult, isEditMode]);

    // Fetch students and courses for selected class
    useEffect(() => {
        if (!selectedClass) {
            setClassStudents([]);
            setClassCourses([]);
            return;
        }
        const fetchClassData = async () => {
            try {
                // Fetch students for the selected class
                const studentsRes = await axios.get(`/classes/${selectedClass}/students`);
                setClassStudents(studentsRes.data || []);

                // Fetch courses for the selected class
                const coursesRes = await axios.get(`/courses?classId=${selectedClass}`);
                setClassCourses(coursesRes.data || []);
            } catch (err) {
                console.error("Failed to fetch class-specific data:", err);
                // Optionally, set an error message here for the user
                setClassStudents([]);
                setClassCourses([]);
            }
        };
        fetchClassData();
    }, [selectedClass]); // Re-run when selectedClass changes

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        setLoading(true); // Start loading

        // Client-side validation
        if (!selectedClass || !selectedStudent || !selectedCourse || !examType || !examDate || marks === '') {
            setError('All fields marked with * are required.');
            setLoading(false);
            return;
        }

        // Validate marks: must be a number between 0 and 100
        const parsedMarks = parseFloat(marks); // Use parseFloat for potential decimal marks
        if (isNaN(parsedMarks) || parsedMarks < 0 || parsedMarks > 100) {
            setError('Marks must be a number between 0 and 100.');
            setLoading(false);
            return;
        }

        // Construct the payload
        const payload = {
            classId: parseInt(selectedClass),
            studentId: parseInt(selectedStudent),
            courseId: parseInt(selectedCourse),
            examType,
            marksObtained: parsedMarks,
            examDate: examDate, // YYYY-MM-DD string is generally fine for LocalDate
        };

        // Conditionally add remarks only if it has a value
        if (remarks.trim() !== '') {
            payload.remarks = remarks.trim();
        }

        try {
            // Call the onSave prop, which is expected to handle the actual API request
            await onSave(payload);
            // If onSave completes successfully, the parent component will close the modal
        } catch (err) {
            console.error("Error saving exam result:", err);
            // Display a user-friendly error message
            setError(`Failed to save exam result: ${err.message || 'An unexpected error occurred.'}`);
        } finally {
            setLoading(false); // End loading regardless of success or failure
        }
    };

    if (!isOpen) return null; // Don't render if modal is not open

    return (
        <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black bg-opacity-70" /> {/* Backdrop */}
            <div className="fixed inset-0 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                        {isEditMode ? 'Edit Exam Result' : 'Add Exam Result'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Class Dropdown */}
                        <div>
                            <label htmlFor="class-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Class *
                            </label>
                            <select
                                id="class-select"
                                value={selectedClass}
                                onChange={e => {
                                    setSelectedClass(e.target.value);
                                    setSelectedStudent(''); // Reset student when class changes
                                    setSelectedCourse(''); // Reset course when class changes
                                }}
                                className="block w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            >
                                <option value="">-- Select a Class --</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Student Dropdown */}
                        <div>
                            <label htmlFor="student-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Student *
                            </label>
                            <select
                                id="student-select"
                                value={selectedStudent}
                                onChange={e => setSelectedStudent(e.target.value)}
                                disabled={!selectedClass || classStudents.length === 0} // Disable if no class selected or no students
                                className="block w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-700/50"
                                required
                            >
                                <option value="">-- Select a Student --</option>
                                {classStudents.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.firstName} {s.lastName}
                                    </option>
                                ))}
                            </select>
                            {selectedClass && classStudents.length === 0 && (
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No students found for this class.</p>
                            )}
                        </div>

                        {/* Course Dropdown */}
                        <div>
                            <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Course *
                            </label>
                            <select
                                id="course-select"
                                value={selectedCourse}
                                onChange={e => setSelectedCourse(e.target.value)}
                                disabled={!selectedClass || classCourses.length === 0} // Disable if no class selected or no courses
                                className="block w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-700/50"
                                required
                            >
                                <option value="">-- Select a Course --</option>
                                {classCourses.map(c => (
                                    <option key={c.id} value={c.id}>{c.courseName}</option>
                                ))}
                            </select>
                            {selectedClass && classCourses.length === 0 && (
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No courses found for this class.</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Exam Type */}
                            <div>
                                <label htmlFor="exam-type-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Exam Type *
                                </label>
                                <select
                                    id="exam-type-select"
                                    value={examType}
                                    onChange={e => setExamType(e.target.value)}
                                    className="block w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                >
                                    <option value="Midterm">Midterm</option>
                                    <option value="Final">Final</option>
                                    <option value="Quiz">Quiz</option>
                                    <option value="Assignment">Assignment</option>
                                </select>
                            </div>

                            {/* Exam Date */}
                            <div>
                                <label htmlFor="exam-date-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Exam Date *
                                </label>
                                <input
                                    type="date"
                                    id="exam-date-input"
                                    value={examDate}
                                    onChange={e => setExamDate(e.target.value)}
                                    className="block w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        {/* Marks Obtained */}
                        <div>
                            <label htmlFor="marks-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Marks Obtained *
                            </label>
                            <input
                                type="number"
                                id="marks-input"
                                step="0.01" // Allow decimal marks
                                min="0"
                                max="100"
                                value={marks}
                                onChange={e => setMarks(e.target.value)}
                                className="block w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter marks (0-100)"
                                required
                            />
                        </div>

                        {/* Remarks */}
                        <div>
                            <label htmlFor="remarks-textarea" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Remarks
                            </label>
                            <textarea
                                id="remarks-textarea"
                                value={remarks}
                                onChange={e => setRemarks(e.target.value)}
                                className="block w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                rows="3"
                                placeholder="Optional remarks about the exam result"
                            />
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm font-medium">{error}</p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-200 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 w-full sm:w-auto"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading} // Disable button while loading
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 w-full sm:w-auto"
                            >
                                {loading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Save Result')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
