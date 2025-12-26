import React, { useEffect, useState, useMemo } from 'react';
import axios from '../../api/axios';
import DataTable from '../common/DataTable';
import { ShieldCheckIcon, UserCircleIcon, AcademicCapIcon, NoSymbolIcon, MagnifyingGlassIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useSearch } from '../../context/SearchContext';

const roleIcons = {
    ROLE_ADMIN: <ShieldCheckIcon className="h-6 w-6 text-indigo-600" title="Admin"/>,
    ROLE_TEACHER: <AcademicCapIcon className="h-6 w-6 text-green-600" title="Teacher"/>,
    ROLE_STUDENT: <UserCircleIcon className="h-6 w-6 text-blue-600" title="Student"/>,
};

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showPasswords, setShowPasswords] = useState({});
  const { search: globalSearch } = useSearch();

  useEffect(() => {
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
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() =>
    users.filter((u) => {
      const searchTerm = (search + ' ' + globalSearch).toLowerCase();
      return (
        (u.userId?.toLowerCase() || '').includes(searchTerm)
      );
    }), [users, search, globalSearch]);

  const columns = useMemo(() => [
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
      header: 'Password',
      accessor: 'password',
      render: (user) => (
        <span className="flex items-center gap-2">
          {showPasswords[user.userId] ? (
            <span className="font-mono text-xs">{user.password}</span>
          ) : (
            <span className="font-mono text-xs">••••••••</span>
          )}
          <button type="button" onClick={() => handleTogglePassword(user.userId)} className="focus:outline-none">
            {showPasswords[user.userId] ? <EyeSlashIcon className="h-4 w-4 text-gray-500" /> : <EyeIcon className="h-4 w-4 text-gray-500" />}
          </button>
        </span>
      )
    },
    {
        header: 'Status',
        accessor: 'isActive',
        render: ({ isActive }) => (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
                {isActive ? 'Active' : 'Inactive'}
            </span>
        )
    },
    {
      header: 'Actions',
      render: (user) => (
        <div className="flex items-center gap-x-2">
          <button
            onClick={() => handleToggleActive(user)}
            className={`p-1.5 rounded ${user.isActive ? 'text-red-600 hover:bg-red-100' : 'text-green-600 hover:bg-green-100'}`}
            title={user.isActive ? 'Deactivate' : 'Activate'}
          >
            {user.isActive ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>
      ),
    },
  ], []);

  const handleTogglePassword = (userId) => {
    setShowPasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleToggleActive = async (user) => {
    setLoading(true);
    setError('');
    try {
      const endpoint = `/api/v1/users/${user.userId}/status`;
      await axios.patch(endpoint, { isActive: !user.isActive });
      // Refresh users
      const response = await axios.get('/users');
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${user.isActive ? 'deactivate' : 'activate'} user.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-auto">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-2 flex flex-col sm:flex-row gap-2 sm:gap-4 items-center justify-between border-b border-gray-200 dark:border-gray-700">
        {/* Remove the local search bar UI (tableActions) if header search is present */}
      </div>
      <DataTable
        title="User Account Management"
        columns={columns}
        data={filteredUsers}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default UserList; 