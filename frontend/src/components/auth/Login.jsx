import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import DarkModeToggle from '../common/DarkModeToggle';
import { EyeIcon, EyeSlashIcon, UserIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import schoolLogo from '../../assets/school-Logo.png';

// Modern, minimal illustration (replace with your own SVG if desired)
const ModernSchoolIllustration = () => (
  <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="60" width="160" height="40" rx="8" fill="#6366F1" />
    <rect x="30" y="40" width="120" height="30" rx="6" fill="#A5B4FC" />
    <rect x="60" y="20" width="60" height="20" rx="5" fill="#E0E7FF" />
    <circle cx="90" cy="90" r="8" fill="#F59E42" />
    <rect x="80" y="80" width="20" height="10" rx="2" fill="#FDE68A" />

  </svg>
);

const Login = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(userId, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center relative">
      <div className="absolute top-4 right-4 z-10">
        <DarkModeToggle />
      </div>
      <div className="w-full max-w-4xl mx-auto flex items-center justify-center h-full">
        {/* Changed h-auto to h-fit and added min-h-[500px] for minimum height */}
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-3xl mx-auto shadow-2xl rounded-2xl bg-white dark:bg-gray-900 overflow-hidden border border-gray-200 dark:border-gray-800 h-fit min-h-[500px]">
          {/* Logo and Welcome Section for mobile */}
          <div className="flex flex-col items-center justify-center w-full md:hidden p-6 text-center">
            <img src={schoolLogo} alt="School Logo" className="w-24 h-24 object-contain mb-3 rounded-full shadow-lg border-4 border-indigo-200 dark:border-indigo-400 bg-white" />
            <h1 className="text-lg font-bold text-indigo-700 dark:text-indigo-300 mb-2">School Management System</h1>
          </div>
          {/* Logo and Welcome Section for md+ */}
          {/* Ensured h-full for the sidebar on md+ screens */}
          <div className="hidden md:flex flex-col items-center justify-center bg-indigo-50 dark:bg-gray-800 p-8 md:w-1/2 w-full h-full text-center">
            <img src={schoolLogo} alt="School Logo" className="w-32 h-32 object-contain mb-4 rounded-full shadow-lg border-4 border-indigo-200 dark:border-indigo-400 bg-white" />
            <h1 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-2">School Management System</h1>
            <div className="mt-4">
              <ModernSchoolIllustration />
            </div>
          </div>
          {/* Login Form Section */}
          {/* Ensured h-full for the login form on md+ screens */}
          <div className="flex-1 flex flex-col justify-center p-8 md:p-12 w-full md:w-1/2 h-full">
            <div className="mx-auto w-full max-w-sm">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Sign in to your account</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">Enter your credentials below.</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">User ID</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      id="userId"
                      name="userId"
                      type="text"
                      autoComplete="username"
                      required
                      value={userId}
                      onChange={(e) => setUserId(e.target.value.toUpperCase())}
                      className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                      placeholder="STU-0001"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                      placeholder="••••••••"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                {error && (
                  <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;