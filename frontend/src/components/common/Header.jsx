import { Fragment, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { Bars3Icon, MagnifyingGlassIcon, BellIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { useDarkMode } from '../../context/DarkModeContext';
import DarkModeToggle from './DarkModeToggle';


function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Function to generate a title from the pathname
const getTitleFromPathname = (pathname) => {
  if (pathname === '/admin' || pathname === '/teacher' || pathname === '/student') {
    return 'Dashboard';
  }
  const path = pathname.split('/').pop();
  return path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};


const Header = ({ setSidebarOpen}) => {
  const location = useLocation();
  const pageTitle = getTitleFromPathname(location.pathname);


  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center justify-between bg-white dark:bg-gray-800 px-4 sm:px-6 lg:px-8 shadow-sm">
      {/* Hamburger menu for mobile */}
      <button type="button" className="text-gray-500 lg:hidden" onClick={() => setSidebarOpen(true)}>
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Page Title - Hidden on mobile, shown on desktop */}
      <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 hidden lg:block">{pageTitle}</h1>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-x-3">
        <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <BellIcon className="h-6 w-6" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        <DarkModeToggle />
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700">
          <UserCircleIcon className="h-8 w-8 text-blue-500" />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Admin User</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">admin@school.edu</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;