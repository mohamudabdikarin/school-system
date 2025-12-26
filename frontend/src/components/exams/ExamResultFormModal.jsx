// src/components/exam-results/ExamResultFormModal.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';

export default function ExamResultFormModal({ isOpen, onClose, onSuccess, editData }) {
    // Sticking to your original state management structure
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [examType, setExamType] = useState('Midterm');
    const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
    const [marks, setMarks] = useState('');
    
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditMode = Boolean(editData);

    // --- EFFECT 1: Fetch initial classes and handle pre-filling form in edit mode ---
    useEffect(() => {
        if (!isOpen) return;

        // Fetch the list of all classes when the modal opens
        axios.get('/classes')
            .then(res => setClasses(res.data))
            .catch(() => setError('Failed to load classes.'));

        if (isEditMode) {
            // Pre-fill form fields from the editData prop
            const { classId, studentId, courseId, examType, examDate, marksObtained } = editData;
            setSelectedClass(classId || '');
            setSelectedStudent(studentId || '');
            setSelectedCourse(courseId || '');
            setExamType(examType || 'Midterm');
            setMarks(marksObtained || '');

            // FIX: Correctly handle date formatting from backend
            if (examDate) {
                // This handles both string dates and the array format from some Java serializers
                const dateObj = Array.isArray(examDate) ? new Date(examDate[0], examDate[1] - 1, examDate[2]) : new Date(examDate);
                setExamDate(dateObj.toISOString().split('T')[0]);
            }
        } else {
            // Reset form for "Add" mode
            setSelectedClass('');
            setSelectedStudent('');
            setSelectedCourse('');
            setExamType('Midterm');
            setExamDate(new Date().toISOString().split('T')[0]);
            setMarks('');
        }
    }, [isOpen, editData, isEditMode]);

    // --- EFFECT 2: Fetch students and courses based on the selected class ---
    // This effect runs when the class changes, OR when in edit mode.
    useEffect(() => {
        if (!selectedClass) {
            setStudents([]);
            setCourses([]);
            return;
        }

        let isMounted = true; // Prevent state updates on unmounted component
        const fetchDependentData = async () => {
            try {
                // Fetch both students and courses in parallel for efficiency
                const [studentRes, courseRes] = await Promise.all([
                    axios.get(`/classes/${selectedClass}/students`),
                    axios.get(`/courses?classId=${selectedClass}`)
                ]);

                if (isMounted) {
                    setStudents(studentRes.data || []);
                    setCourses(courseRes.data || []);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Failed to load students or courses.');
                }
            }
        };

        fetchDependentData();

        return () => { isMounted = false; };
    }, [selectedClass]);

    // --- Form Submission Logic ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!selectedClass || !selectedStudent || !selectedCourse || !examType || !examDate || marks === '') {
            setError('All fields are required.');
            return;
        }
        if (isNaN(marks) || marks < 0 || marks > 100) {
            setError('Marks must be a number between 0 and 100.');
            return;
        }
        setLoading(true);
        try {
            const payload = {
                classId: selectedClass,
                studentId: selectedStudent,
                courseId: selectedCourse,
                examType,
                examDate,
                marksObtained: parseFloat(marks),
            };
            if (isEditMode) {
                await axios.put(`/exam-results/${editData.id}`, payload);
            } else {
                await axios.post('/exam-results', payload);
            }
            onSuccess(); // This should trigger a close and refresh in the parent
        } catch (err) {
            setError(err.response?.data?.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        // FIX: Added dark mode classes for the modal overlay and panel
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                    {isEditMode ? 'Edit Exam Result' : 'Add Exam Result'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Class Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class</label>
                        <select
                            value={selectedClass}
                            onChange={e => setSelectedClass(e.target.value)}
                            className="block w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">-- Select a Class --</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    {/* Student Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student</label>
                        <select
                            value={selectedStudent}
                            onChange={e => setSelectedStudent(e.target.value)}
                            disabled={!selectedClass}
                            className="block w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-700/50"
                        >
                            <option value="">-- Select a Student --</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                        </select>
                    </div>

                    {/* Course Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course</label>
                        <select
                            value={selectedCourse}
                            onChange={e => setSelectedCourse(e.target.value)}
                            disabled={!selectedClass}
                            className="block w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-700/50"
                        >
                            <option value="">-- Select a Course --</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.courseName}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Exam Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam Type</label>
                            <select value={examType} onChange={e => setExamType(e.target.value)} className="block w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="Midterm">Midterm</option>
                                <option value="Final">Final</option>
                                <option value="Quiz">Quiz</option>
                                <option value="Assignment">Assignment</option>
                            </select>
                        </div>
                        {/* Exam Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam Date</label>
                            <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className="block w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>

                    {/* Marks Obtained */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marks Obtained</label>
                        <input type="number" step="0.01" value={marks} onChange={e => setMarks(e.target.value)} className="block w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-200 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 w-full sm:w-auto">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 w-full sm:w-auto">
                            {loading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Save Result')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}