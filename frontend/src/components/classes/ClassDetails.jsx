// ClassDetails.jsx (Updated to retrieve student ID instead of sequential No.)

import { useEffect, useState, Fragment, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../../api/axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, HeadingLevel, AlignmentType, WidthType, ShadingType, VerticalAlign, TextRun, Header, Footer, PageNumber, ImageRun } from 'docx';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, ArrowLeftIcon, CogIcon, ArrowDownTrayIcon, ExclamationCircleIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import schoolLogo from '../../assets/school-Logo.png';
import { AuthContext } from '../../context/AuthContext';

// Function to convert image URL/path to Base64 (utility function)
const getBase64Image = async (imgUrl) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Required for loading images from different origins
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/png'); // or 'image/jpeg'
            resolve(dataURL.split(',')[1]); // Return base64 part only
        };
        img.onerror = error => reject(error);
        img.src = imgUrl;
    });
};

const DEFAULT_COLUMNS = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
];

const SCHOOL_INFO = {
    name: "Learn Ease",
    address: "Km4, Mogadishu, Somalia",
    phone: "+252 61 1234567",
    logoPath: schoolLogo,
    logoBase64: null,
};

// --- Component Definition ---
const ClassDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext); // <-- get user context
    const [classInfo, setClassInfo] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // UI State
    const [selectedColumns, setSelectedColumns] = useState(DEFAULT_COLUMNS.map(c => c.key));
    const [customColumns, setCustomColumns] = useState([]);
    const [newCustomCol, setNewCustomCol] = useState('');
    const [customColValues, setCustomColValues] = useState({});

    // Fetch initial data and convert logo to Base64
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [classRes, studentsRes] = await Promise.all([
                    axios.get(`/classes/${id}`),
                    axios.get(`/classes/${id}/students`),
                ]);
                setClassInfo(classRes.data);
                setStudents(studentsRes.data);

                if (SCHOOL_INFO.logoPath) {
                    const base64 = await getBase64Image(SCHOOL_INFO.logoPath);
                    SCHOOL_INFO.logoBase64 = base64;
                }

            } catch (err) {
                console.error("Failed to fetch data or convert logo:", err);
                setError('Failed to load class details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Synchronize custom values state when students or custom columns change
    useEffect(() => {
        setCustomColValues(vals => {
            const newVals = { ...vals };
            students.forEach(s => {
                newVals[s.id] = newVals[s.id] || {};
                customColumns.forEach(col => {
                    newVals[s.id][col] = newVals[s.id][col] || '';
                });
                Object.keys(newVals[s.id]).forEach(colKey => {
                    if (!customColumns.includes(colKey)) {
                        delete newVals[s.id][colKey];
                    }
                });
            });
            return newVals;
        });
    }, [customColumns, students]);

    // --- Event Handlers ---
    const handleColumnToggle = (key) => {
        setSelectedColumns(cols =>
            cols.includes(key) ? cols.filter(c => c !== key) : [...cols, key]
        );
    };

    const handleAddCustomColumn = () => {
        const sanitized = newCustomCol.trim()
            .replace(/<[^>]*>/g, '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

        if (sanitized && !customColumns.includes(sanitized)) {
            setCustomColumns(cols => [...cols, sanitized]);
            setSelectedColumns(cols => [...cols, sanitized]);
            setNewCustomCol('');
        }
    };

    const handleRemoveCustomColumn = (colToRemove) => {
        setCustomColumns(cols => cols.filter(c => c !== colToRemove));
        setSelectedColumns(cols => cols.filter(c => c !== colToRemove));
    };

    const handleCustomColChange = (studentId, col, value) => {
        setCustomColValues(vals => ({
            ...vals,
            [studentId]: { ...vals[studentId], [col]: value },
        }));
    };

    // --- Data Preparation for Export ---
    const getActiveColumns = () => [
        ...DEFAULT_COLUMNS.filter(c => selectedColumns.includes(c.key)),
        ...customColumns.filter(c => selectedColumns.includes(c)).map(c => ({ key: c, label: c })),
    ];

    const getStudentDataForExport = () => {
        return students.map((s) => {
            const rowData = {
                id: s.id,
                name: `${s.firstName} ${s.lastName}`,
            };
            customColumns.forEach(col => {
                rowData[col] = (customColValues[s.id] && customColValues[s.id][col]) || '';
            });
            return rowData;
        });
    };

    // --- Document Generation ---

    const generatePdf = (activeColumns, studentRows) => {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const headerAndFooterHeight = 40;

        doc.autoTable({
            head: [activeColumns.map(c => c.label)],
            body: studentRows.map(r => activeColumns.map(c => r[c.key])),
            theme: 'grid',
            headStyles: { fillColor: [243, 244, 246], textColor: [17, 24, 39], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            styles: { fontSize: 9, cellPadding: 2.5 },
            columnStyles: { 0: { cellWidth: 20 } }, // Adjusted 'ID' column width
            margin: { top: headerAndFooterHeight },

            didDrawPage: (data) => {
                if (SCHOOL_INFO.logoBase64) {
                    doc.addImage(SCHOOL_INFO.logoBase64, 'PNG', 14, 8, 20, 20);
                }
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text('Student Roster', 38, 20);
                doc.setFontSize(12);
                doc.setFont('helvetica', 'normal');
                doc.text(`Class: ${classInfo.name}`, 38, 27);
                doc.line(14, 29, 200, 29);

                const pageCount = doc.internal.getNumberOfPages();
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`${SCHOOL_INFO.name} | Generated on: ${new Date().toLocaleDateString()}`, 14, pageHeight - 10);
                doc.text(`Page ${data.pageNumber} of ${pageCount}`, doc.internal.pageSize.width - 35, pageHeight - 10);
            },
        });

        doc.save(`${classInfo.name.replace(/\s+/g, '_')}_students.pdf`);
    };

    const generateDocx = async (activeColumns, studentRows) => {
        try {
            const tableHeader = new TableRow({
                children: activeColumns.map(col => new TableCell({
                    children: [new Paragraph({ text: col.label, style: 'tableHeader' })],
                    shading: { type: ShadingType.CLEAR, fill: "F3F4F6" },
                    verticalAlign: VerticalAlign.CENTER,
                })),
                tableHeader: true,
            });

            const tableDataRows = studentRows.map(r => new TableRow({
                children: activeColumns.map(col => new TableCell({
                    children: [new Paragraph(String(r[col.key] ?? ''))],
                    verticalAlign: VerticalAlign.CENTER,
                })),
            }));

            const headerChildren = [
                new Paragraph({ style: 'schoolName', text: SCHOOL_INFO.name }),
                new Paragraph({ style: 'schoolContact', text: `${SCHOOL_INFO.address} | ${SCHOOL_INFO.phone}` }),
            ];

            if (SCHOOL_INFO.logoBase64) {
                headerChildren.unshift(new Paragraph({
                    children: [
                        new ImageRun({
                            data: SCHOOL_INFO.logoBase64,
                            transformation: {
                                width: 50,
                                height: 50,
                            },
                        }),
                    ],
                    alignment: AlignmentType.LEFT,
                }));
            }

            const doc = new Document({
                styles: {
                    paragraphStyles: [
                        { id: "tableHeader", name: "Table Header", run: { bold: true, size: 20 }, paragraph: { spacing: { before: 120, after: 120 } } },
                        { id: "schoolName", name: "School Name", run: { size: 24, bold: true }, paragraph: { alignment: AlignmentType.LEFT } },
                        { id: "schoolContact", name: "School Contact", run: { size: 18, color: "555555" }, paragraph: { alignment: AlignmentType.LEFT, spacing: { after: 200 } } }
                    ]
                },
                sections: [{
                    headers: {
                        default: new Header({
                            children: headerChildren,
                        }),
                    },
                    footers: {
                        default: new Footer({
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.RIGHT,
                                    children: [
                                        new TextRun("Page "),
                                        new TextRun({ children: [PageNumber.CURRENT] }),
                                        new TextRun(" of "),
                                        new TextRun({ children: [PageNumber.TOTAL_PAGES] }),
                                    ]
                                }),
                            ],
                        }),
                    },
                    children: [
                        new Paragraph({ text: 'Student Roster', heading: HeadingLevel.HEADING_1 }),
                        new Paragraph({ text: `Class: ${classInfo.name}`, heading: HeadingLevel.HEADING_2 }),
                        new Paragraph({ text: `Date: ${new Date().toLocaleDateString()}`, alignment: AlignmentType.RIGHT }),
                        new Paragraph({ text: "" }),
                        new Table({
                            rows: [tableHeader, ...tableDataRows],
                            width: { size: 100, type: WidthType.PERCENTAGE },
                        }),
                    ],
                }],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `${classInfo.name.replace(/\s+/g, '_')}_students.docx`);
        } catch (err) {
            console.error("Failed to generate DOCX:", err);
            setError('Failed to generate DOCX file. Please try again.');
        }
    };

    const handleDownload = (type) => {
        const activeColumns = getActiveColumns();
        const studentRows = getStudentDataForExport();

        if (type === 'pdf') {
            generatePdf(activeColumns, studentRows);
        } else if (type === 'docx') {
            generateDocx(activeColumns, studentRows);
        }
    };


    // --- Render Logic ---
    if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading class details...</div>;
    if (error) return (
        <div className="p-8 text-center text-red-100 bg-red-50 rounded-lg max-w-lg mx-auto mt-10 dark:bg-red-900 dark:text-red-100">
            <ExclamationCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-4 dark:text-red-300" />
            <h3 className="text-xl font-semibold text-red-800 dark:text-red-200">Error</h3>
            <p className="text-red-700 mt-2 dark:text-red-300">{error}</p>
        </div>
    );
    if (!classInfo) return <div className="p-8 text-center text-gray-700 dark:text-gray-300">Class not found.</div>;

    const currentColumns = getActiveColumns();

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Page Header */}
            <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{classInfo.name}</h1>
                    <Link to="/classes" className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium dark:text-indigo-400 dark:hover:text-indigo-600">
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back to Classes
                    </Link>
                </div>
                <div className="mt-2 flex items-center gap-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <span>Class ID: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded dark:bg-gray-700 dark:text-gray-200">{classInfo.id}</span></span>
                    <span className="flex items-center gap-2">
                        <UserGroupIcon className="w-4 h-4" />
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{students.length}</span> Students
                    </span>
                </div>
            </div>

            {/* Customization Panel */}
            <div className="p-6 border border-gray-200 rounded-lg mb-6 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                    <CogIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Customize & Export</h3>
                </div>

                <div className="mb-4">
                    <p className="font-medium mb-2 text-sm text-gray-700 dark:text-gray-300">Display Columns</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {DEFAULT_COLUMNS.filter(col => col.key === 'id' || col.key === 'name').map(col => (
                            <label key={col.key} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-indigo-500 dark:checked:border-indigo-500" checked={selectedColumns.includes(col.key)} onChange={() => handleColumnToggle(col.key)} />
                                {col.label}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Only show custom columns UI for admins and teachers */}
                {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') && (
                    <div>
                        <p className="font-medium mb-2 text-sm text-gray-700 dark:text-gray-300">Custom Columns</p>
                        <div className="flex flex-wrap gap-2 items-center mb-4">
                            {customColumns.map(col => (
                                <span key={col} className="inline-flex items-center py-1 pl-3 pr-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium dark:bg-indigo-900 dark:text-indigo-200">
                                    {col}
                                    <button type="button" className="ml-2 flex-shrink-0 h-5 w-5 rounded-full inline-flex items-center justify-center text-indigo-500 hover:bg-indigo-200 hover:text-indigo-600 focus:outline-none dark:text-indigo-400 dark:hover:bg-indigo-800 dark:hover:text-indigo-300" onClick={() => handleRemoveCustomColumn(col)} title={`Remove column "${col}"`}>
                                        <span className="sr-only">Remove</span>
                                        <svg className="h-3 w-3" stroke="currentColor" fill="none" viewBox="0 0 8 8"><path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" /></svg>
                                    </button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={newCustomCol}
                            onChange={e => setNewCustomCol(e.target.value)}
                            placeholder="Add new column (e.g., 'Final Grade')"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <button onClick={handleAddCustomColumn} className="mt-2 px-4 py-2 bg-gray-400 text-white rounded-md dark:bg-gray-600 dark:hover:bg-gray-500" disabled={!newCustomCol.trim()}>Add</button>
                    </div>
                )}
            </div>

            {/* Actions and Table */}
            <div className="flex items-center justify-end mb-4">
                <Menu as="div" className="relative inline-block text-left">
                    <div>
                        <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800">
                            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                            Export
                            <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                        </Menu.Button>
                    </div>
                    <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 dark:ring-gray-600">
                            <div className="py-1">
                                <Menu.Item>
                                    {({ active }) => <button onClick={() => handleDownload('pdf')} className={`${active ? 'bg-gray-100 text-gray-900 dark:bg-gray-600 dark:text-white' : 'text-gray-700 dark:text-gray-200'} group flex rounded-md items-center w-full px-4 py-2 text-sm`}>Export as PDF</button>}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => <button onClick={() => handleDownload('docx')} className={`${active ? 'bg-gray-100 text-gray-900 dark:bg-gray-600 dark:text-white' : 'text-gray-700 dark:text-gray-200'} group flex rounded-md items-center w-full px-4 py-2 text-sm`}>Export as DOCX</button>}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>

            <div className="overflow-x-auto shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            {currentColumns.map(col => <th key={col.key} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300">{col.label}</th>)}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                        {students.length > 0 ? students.map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                {currentColumns.map(col => (
                                    <td key={col.key} className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                        {customColumns.includes(col.key) ? (
                                            <input
                                                type="text"
                                                className="w-full px-1 py-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                value={customColValues[s.id]?.[col.key] || ''}
                                                onChange={e => handleCustomColChange(s.id, col.key, e.target.value)}
                                            />
                                        ) : (
                                            (() => {
                                                switch (col.key) {
                                                    case 'id': return s.id;
                                                    case 'name': return `${s.firstName} ${s.lastName}`;
                                                    default: return '';
                                                }
                                            })()
                                        )}
                                    </td>
                                ))}
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={currentColumns.length || 1} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                    <UserGroupIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                                    <p className="mt-2 font-semibold">No students in this class</p>
                                    <p className="text-sm">Add students to this class to see them here.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClassDetails;