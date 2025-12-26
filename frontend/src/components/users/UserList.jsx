import React, { useEffect, useState, useMemo } from 'react';
import axios from '../../api/axios';
import DataTable from '../common/DataTable';
import ConfirmationModal from '../common/ConfirmationModal';
import { ShieldCheckIcon, UserCircleIcon, AcademicCapIcon, NoSymbolIcon, CheckCircleIcon, XCircleIcon, EyeIcon, EyeSlashIcon, ArrowPathIcon, KeyIcon } from '@heroicons/react/24/outline';

const roleIcons = {
  ROLE_ADMIN: <ShieldCheckIcon className="h-6 w-6 text-indigo-600" title="Admin" />,
  ROLE_TEACHER: <AcademicCapIcon className="h-6 w-6 text-green-600" title="Teacher" />,
  ROLE_STUDENT: <UserCircleIcon className="h-6 w-6 text-blue-600" title="Student" />,
};

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [action, setAction] = useState(null); // 'activate' or 'deactivate'
  const [search, setSearch] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/users');
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openConfirmationModal = (user, action) => {
    setSelectedUser(user);
    setAction(action);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser || !action) return;
    setLoading(true);
    try {
      const isActive = action === 'activate';
      await axios.patch(`/users/${selectedUser.userId}/status`, { isActive });
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} user.`);
    } finally {
      setLoading(false);
      setIsConfirmModalOpen(false);
      setSelectedUser(null);
      setAction(null);
    }
  };

  const openPasswordModal = (user) => {
    setPasswordUser(user);
    setNewPassword('');
    setPasswordError('');
    setPasswordSuccess('');
    setIsPasswordModalOpen(true);
  };

  const handlePasswordUpdate = async () => {
    if (!passwordUser || !newPassword) return;
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');
    try {
      await axios.patch(`/users/${passwordUser.userId}/password`, { newPassword });
      setIsPasswordModalOpen(false);
      fetchUsers();
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSearchChange = (e) => setSearch(e.target.value);

  const filteredUsers = users.filter(user =>
    user.userId.toLowerCase().includes(search.toLowerCase()) ||
    user.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleTogglePassword = (userId) => {
    setVisiblePasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const columns = useMemo(() => {
    const baseColumns = [
      { header: 'User ID', accessor: 'userId' },
      {
        header: 'Role',
        accessor: 'role',
        render: ({ role }) => (
          <div className="flex items-center gap-2">
            {roleIcons[role] || <NoSymbolIcon className="h-6 w-6 text-gray-400" />}
            <span className="font-medium">{role.replace('ROLE_', '')}</span>
          </div>
        )
      },
      {
        header: 'Status',
        accessor: 'isActive',
        render: ({ isActive }) => (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        )
      },
      {
        header: 'Actions',
        render: (user) => (
          <div className="flex items-center gap-x-2">
            {user.isActive ? (
              <button
                onClick={() => openConfirmationModal(user, 'deactivate')}
                className="p-1.5 rounded text-red-600 hover:bg-red-100 dark:hover:bg-gray-700" title="Deactivate">
                <XCircleIcon className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={() => openConfirmationModal(user, 'activate')}
                className="p-1.5 rounded text-green-600 hover:bg-green-100 dark:hover:bg-gray-700" title="Activate">
                <CheckCircleIcon className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => openPasswordModal(user)}
              className="p-1.5 rounded text-yellow-600 hover:bg-yellow-100 dark:hover:bg-gray-700"
              title="Update Password"
            >
              <KeyIcon className="h-5 w-5" />
            </button>
          </div>
        ),
      },
    ];
    // Show password column for students and teachers
    if (filteredUsers.some(user => user.role === 'ROLE_STUDENT' || user.role === 'ROLE_TEACHER' || user.role === "ROLE_ADMIN")) {
      baseColumns.splice(2, 0, {
        header: 'Password',
        render: (user) => (user.role === 'ROLE_STUDENT' || user.role === 'ROLE_TEACHER' || user.role === "ROLE_ADMIN") ? (
          <div className="flex items-center gap-2">
            <span className="font-mono select-all">
              {visiblePasswords[user.userId] ? user.password : '\u2022\u2022\u2022\u2022'}
            </span>
            <button onClick={() => handleTogglePassword(user.userId)} className="ml-1">
              {visiblePasswords[user.userId] ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
        ) : null
      });
    }
    return baseColumns;
  }, [visiblePasswords, filteredUsers]);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="relative w-full sm:w-80">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg>
        <input
          type="text"
          placeholder="Search by User ID or Role..."
          value={search}
          onChange={handleSearchChange}
            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 dark:text-white dark:bg-gray-700/50 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
        />
        </div>
      </div>
      <DataTable
        title="User Account Management"
        columns={columns}
        data={filteredUsers}
        loading={loading}
        error={error}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={`${action === 'activate' ? 'Activate' : 'Deactivate'} User`}
        message={`Are you sure you want to ${action} the user with User ID ${selectedUser?.userId}?`}
        loading={loading}
      />
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Update Password</h2>
            <div className="mb-2"><span className="font-semibold">User ID:</span> {passwordUser?.userId}</div>
            <input
              type="password"
              className="w-full rounded border px-3 py-2 mb-2 dark:bg-gray-700 dark:text-white"
              placeholder="New password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              disabled={passwordLoading}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                disabled={passwordLoading}
              >Cancel</button>
              <button
                onClick={handlePasswordUpdate}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                disabled={passwordLoading || !newPassword}
              >{passwordLoading ? 'Updating...' : 'Update'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserList; 