import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="relative flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* 
              This is the mobile overlay. It appears when the sidebar is open on small screens.
              Clicking it will close the sidebar.
            */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-20 bg-black opacity-50 sm:hidden" 
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 transition-transform duration-300 ease-in-out transform sm:relative sm:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            </div>

            {/* Main content area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <Header setSidebarOpen={setSidebarOpen} />

                {/* Page content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;