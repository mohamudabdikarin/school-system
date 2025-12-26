import React from 'react';
import { TableCellsIcon } from '@heroicons/react/24/outline';

const DataTable = ({ title, columns, data, loading, error, actions }) => {
  // Helper to get nested properties from an object based on a string path
  const getNestedValue = (obj, path) => {
    if (!path) return '';
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 sm:mb-0">{title}</h2>
        <div className="flex items-center gap-4">
          {actions}
        </div>
      </div>

      {loading && (
        <div className="text-center p-10">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading data...</p>
        </div>
      )}

      {!loading && error && (
        <div className="text-center p-10">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {columns.map((col, index) => (
                  <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {data.length > 0 ? (
                data.map((row, rowIndex) => (
                  <tr key={row.id || rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {col.render ? col.render(row) : getNestedValue(row, col.accessor)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-10">
                    <TableCellsIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No data available</h3>
                    <p className="mt-1 text-sm text-gray-500">There are no records to display at this time.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DataTable;