import { useContext } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { DarkModeContext } from '../../context/DarkModeContext';

const DarkModeToggle = ({ className = '' }) => {
    const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);

    return (
        <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${className}`}
            aria-label="Toggle dark mode"
        >
            {isDarkMode ? (
                <SunIcon className="w-6 h-6 text-yellow-400" />
            ) : (
                <MoonIcon className="w-6 h-6 text-gray-700" />
            )}
        </button>
    );
};

export default DarkModeToggle; 