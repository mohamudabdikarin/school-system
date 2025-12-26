import React, { useEffect, useState, useMemo } from 'react';
import axios from '../../api/axios';
import { UserPlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import DataTable from '../common/DataTable';
import StudentFormModal from './StudentFormModal';
import ConfirmationModal from '../common/ConfirmationModal';
import toast from 'react-hot-toast';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [studentToDeleteId, setStudentToDeleteId] = useState(null);
  const [studentToDeleteDisplayName, setStudentToDeleteDisplayName] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formMode, setFormMode] = useState('add');

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/students');
      setStudents(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setIsFormModalOpen(false);
    fetchStudents();
    toast.success('Student saved successfully.');
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const openAddModal = () => {
    setSelectedStudent(null);
    setFormMode('add');
    setIsFormModalOpen(true);
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (student) => {
    setStudentToDeleteId(student.id);
    setStudentToDeleteDisplayName(`${student.firstName} ${student.lastName}`);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDeleteId) {
      setError('No student selected for deletion.');
      setIsConfirmModalOpen(false);
      return;
    }
    setLoading(true);
    try {
      await axios.delete(`/students/${studentToDeleteId}`);
      fetchStudents();
      setError('');
      toast.success('Student deleted successfully.');
    } catch (err) {
      toast.error('Failed to delete student.');
      setError(err.response?.data?.message || 'Failed to delete student.');
    } finally {
      setLoading(false);
      setIsConfirmModalOpen(false);
      setStudentToDeleteId(null);
      setStudentToDeleteDisplayName('');
    }
  };

  const filteredStudents = useMemo(() =>
    students.filter((s) => {
      const searchTerm = search.toLowerCase();
      const fullName = `${s.firstName?.toLowerCase()} ${s.lastName?.toLowerCase()}`;
      const userId = s.userId?.toLowerCase() || '';
      const phone = s.phone?.toLowerCase() || '';
      return (
        fullName.includes(searchTerm) ||
        userId.includes(searchTerm) ||
        phone.includes(searchTerm)
      );
    }), [students, search]);

  const columns = useMemo(() => [
    {
      header: 'Id',
      accessor: 'userId',
      render: (row) => row.userId || 'N/A'
    },
    {
      header: 'Name',
      accessor: 'firstName',
      render: (row) => `${row.firstName} ${row.lastName}`,
    },
    {
      header: 'Gender',
      accessor: 'gender',
      render: (row) => row.gender || <span className="text-gray-400 italic">Not Set</span>
    },
    {
      header: 'Phone',
      accessor: 'phone',
      render: (row) => row.phone || <span className="text-gray-400 italic">Not Set</span>
    },
    {
      header: 'Address',
      accessor: 'address',
      render: (row) => row.address || <span className="text-gray-400 italic">Not Set</span>
    },
    {
      header: 'Class',
      accessor: 'className',
      render: (row) => row.className || <span className="text-gray-400 italic">Unassigned</span>
    },
    {
      header: 'DOB',
      accessor: 'dateOfBirth',
      render: (row) => row.dateOfBirth ? new Date(row.dateOfBirth).toLocaleDateString() : <span className="text-gray-400 italic">Not Set</span>
    },
    {
      header: 'REG_DATE',
      accessor: 'admissionDate',
      render: (row) => row.admissionDate ? new Date(row.admissionDate).toLocaleDateString() : <span className="text-gray-400 italic">Not Set</span>
    },
    {
      header: 'Actions',
      render: (student) => (
        <div className="flex items-center gap-x-2">
          <button
            onClick={(e) => { e.stopPropagation(); openEditModal(student); }}
            className="p-1.5 rounded text-indigo-600 hover:bg-indigo-100 dark:hover:bg-gray-700"
            title="Edit"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openDeleteModal(student); }}
            className="p-1.5 rounded text-red-600 hover:bg-red-100 dark:hover:bg-gray-700"
            title="Delete"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ], []);

  const tableActions = (
    <div className="flex items-center gap-4 justify-end w-full">
      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute inset-y-0 left-3 h-full w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search students..."
          className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 dark:text-white dark:bg-gray-700/50 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <button
        onClick={openAddModal}
        className="flex items-center gap-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm"
      >
        <UserPlusIcon className="h-5 w-5" /> Add Student
      </button>
    </div>
  );

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}
      <DataTable
        title="Student Management"
        columns={columns}
        data={filteredStudents}
        loading={loading}
        actions={tableActions}
      />
      <StudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        mode={formMode}
        student={selectedStudent}
        onSuccess={handleFormSuccess}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Student"
        message={`Are you sure you want to delete ${studentToDeleteDisplayName}? This action cannot be undone.`}
        loading={loading}
      />
    </div>
  );
};

export default StudentList;
