import React, { useEffect, useState, useMemo } from 'react';
import axios from '../../api/axios';
import DataTable from '../common/DataTable';
import TeacherFormModal from './TeacherFormModal';
import ConfirmationModal from '../common/ConfirmationModal';
import { UserPlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const TeacherList = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [formMode, setFormMode] = useState('add');

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/teachers');
            setTeachers(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch teachers.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const openAddModal = () => {
        setSelectedTeacher(null);
        setFormMode('add');
        setIsFormModalOpen(true);
    };

    const openEditModal = (teacher) => {
        setSelectedTeacher(teacher);
        setFormMode('edit');
        setIsFormModalOpen(true);
    };

    const openDeleteModal = (teacher) => {
        setSelectedTeacher(teacher);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedTeacher) return;
        setLoading(true);
        try {
            await axios.delete(`/teachers/${selectedTeacher.id}`);
            fetchTeachers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete teacher.');
        } finally {
            setLoading(false);
            setIsConfirmModalOpen(false);
            setSelectedTeacher(null);
        }
    };

    const filteredTeachers = useMemo(() =>
        teachers.filter((t) => {
            const searchTerm = search.toLowerCase();
            const fullName = `${t.firstName?.toLowerCase()} ${t.lastName?.toLowerCase()}`;
            const phone = t.phone?.toLowerCase() || '';
            const userId = t.userId?.toLowerCase() || '';
            const hireDate = t.hireDate?.toLowerCase() || '';
            const gender = t.gender?.toLowerCase() || '';
            return fullName.includes(searchTerm) || phone.includes(searchTerm) || userId.includes(searchTerm) || hireDate.includes(searchTerm) || gender.includes(searchTerm);
        }), [teachers, search]);

    const columns = useMemo(() => [
        { header: 'ID', accessor: 'userId', render: (row) => row.userId || 'N/A' },
        { header: 'Name', accessor: 'firstName', render: (row) => `${row.firstName} ${row.lastName}` },
        { header: 'Gender', accessor: 'gender', render: (row) => row.gender || 'Not Set' },
        { header: 'Hire Date', accessor: 'hireDate', render: (row) => row.hireDate || 'Not Set' },
        { header: 'Email', accessor: 'email', render: (row) => row.email || 'Not Set' },
        { header: 'Phone', accessor: 'phone', render: (row) => row.phone || 'Not Set' },
        { header: 'Address', accessor: 'address', render: (row) => row.address || 'Not Set' },
        { header: 'Specialization', accessor: 'specialization', render: (row) => row.specialization || 'Not Set' },
        { header: 'Qualification', accessor: 'qualification', render: (row) => row.qualification || 'Not Set' },
        {
            header: 'Exp',
            accessor: 'experience',
            render: (row) => (
                <span style={{ display: 'block', textAlign: 'center', minWidth: 40 }}>{row.experience !== undefined && row.experience !== null ? row.experience : '—'}</span>
            ),
        },
        {
            header: 'Actions',
            render: (teacher) => (
                <div className="flex items-center gap-x-2">
                    <button onClick={() => openEditModal(teacher)} className="p-1.5 rounded text-indigo-600 hover:bg-indigo-100" title="Edit"><PencilSquareIcon className="h-5 w-5" /></button>
                    <button onClick={() => openDeleteModal(teacher)} className="p-1.5 rounded text-red-600 hover:bg-red-100" title="Delete"><TrashIcon className="h-5 w-5" /></button>
                </div>
            ),
        },
    ], []);

    const tableActions = (
        <div className="flex items-center gap-4">
            <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute inset-y-0 left-3 h-full w-5 text-gray-400" />
                <input type="text" placeholder="Search teachers..." className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 dark:text-white dark:bg-gray-700/50 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button onClick={openAddModal} className="flex items-center gap-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm">
                <UserPlusIcon className="h-5 w-5" /> Add Teacher
            </button>
        </div>
    );

    return (
        <>
            <DataTable title="Teacher Management" columns={columns} data={filteredTeachers} loading={loading} error={error} actions={tableActions} />
            <TeacherFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} mode={formMode} teacher={selectedTeacher} onSuccess={fetchTeachers} />
            <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={handleConfirmDelete} title="Delete Teacher" message={`Are you sure you want to delete ${selectedTeacher?.firstName} ${selectedTeacher?.lastName}? This action is permanent.`} loading={loading} />
        </>
    );
};

export default TeacherList;