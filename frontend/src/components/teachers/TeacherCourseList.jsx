import React, { useEffect, useState, useContext, useMemo } from 'react';
import axios from '../../api/axios';
import DataTable from '../common/DataTable';
import { AuthContext } from '../../context/AuthContext';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const TeacherCourseList = () => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/courses/teacher?teacherUserId=${user.userId}`);
            setCourses(response.data);
        } catch (err) {
            setError('Failed to load courses.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.userId) {
            fetchCourses();
        }
    }, [user]);

    const filteredCourses = useMemo(() =>
        courses.filter(c =>
            c.courseName.toLowerCase().includes(search.toLowerCase()) ||
            c.courseCode.toLowerCase().includes(search.toLowerCase())
        ), [courses, search]);

    const columns = useMemo(() => [
        { header: 'Course Code', accessor: 'courseCode' },
        { header: 'Course Name', accessor: 'courseName' },
        { header: 'Class', accessor: 'className' },
    ], []);

    const tableActions = (
        <div className="flex items-center gap-4">
            <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute inset-y-0 left-3 h-full w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search courses..."
                    className="block w-full rounded-md border-0 py-1.5 pl-10 ring-1 ring-inset ring-gray-300"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>
    );

    return (
        <DataTable
            title="Your Courses"
            columns={columns}
            data={filteredCourses}
            loading={loading}
            error={error}
            actions={tableActions}
        />
    );
};

export default TeacherCourseList;
