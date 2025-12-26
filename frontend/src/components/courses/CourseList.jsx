import React, { useEffect, useState, useMemo } from 'react';
import axios from '../../api/axios';
import DataTable from '../common/DataTable';
import CourseFormModal from './CourseFormModal';
import ConfirmationModal from '../common/ConfirmationModal';
import { UserPlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const CourseList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [formMode, setFormMode] = useState('add');

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/courses');
           console.log('API Response Data:', response.data); 
            setCourses(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch courses.');
             console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCourses(); }, []);

    const openAddModal = () => {
        setSelectedCourse(null);
        setFormMode('add');
        setIsFormModalOpen(true);
    };

    const openEditModal = (course) => {
        setSelectedCourse(course);
        setFormMode('edit');
        setIsFormModalOpen(true);
    };

    const openDeleteModal = (course) => {
        setSelectedCourse(course);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedCourse) return;
        setLoading(true);
        try {
            await axios.delete(`/courses/${selectedCourse.id}`);
            fetchCourses();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete course.');
        } finally {
            setLoading(false);
            setIsConfirmModalOpen(false);
            setSelectedCourse(null);
        }
    };

    const filteredCourses = useMemo(() =>
        courses.filter(c =>
            c.courseName.toLowerCase().includes(search.toLowerCase()) ||
            c.courseCode.toLowerCase().includes(search.toLowerCase())
        ), [courses, search]);

    const columns = useMemo(() => [
        { header: 'Course Code', accessor: 'courseCode' },
        { header: 'Course Name', accessor: 'courseName' },
        { header: 'Teacher', accessor: 'teacher', render: (row) => row.teacher ? `${row.teacher.firstName} ${row.teacher.lastName}` : 'Unassigned' },
        {
            header: 'Actions',
            render: (course) => (
                <div className="flex items-center gap-x-2">
                    <button onClick={() => openEditModal(course)} className="p-1.5 rounded text-indigo-600" title="Edit"><PencilSquareIcon className="h-5 w-5" /></button>
                    <button onClick={() => openDeleteModal(course)} className="p-1.5 rounded text-red-600" title="Delete"><TrashIcon className="h-5 w-5" /></button>
                </div>
            ),
        },
    ], []);

    const tableActions = (
        <div className="flex items-center gap-4">
            <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute inset-y-0 left-3 h-full w-5 text-gray-400" />
                <input type="text" placeholder="Search courses..." className="block w-full rounded-md border-0 py-1.5 pl-10 ring-1 ring-inset ring-gray-300" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button onClick={openAddModal} className="flex items-center gap-x-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold">
                <UserPlusIcon className="h-5 w-5" /> Add Course
            </button>
        </div>
    );

    return (
        <>
            <DataTable title="Course Management" columns={columns} data={filteredCourses} loading={loading} error={error} actions={tableActions} />
            <CourseFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} mode={formMode} course={selectedCourse} onSuccess={fetchCourses} />
            <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={handleConfirmDelete} title="Delete Course" message={`Are you sure you want to delete ${selectedCourse?.courseName}?`} loading={loading} />
        </>
    );
};

export default CourseList;