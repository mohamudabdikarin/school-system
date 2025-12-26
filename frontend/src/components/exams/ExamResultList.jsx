// src/components/exam-results/ExamResultList.jsx
import React, { useEffect, useState, useMemo } from 'react';
import axios from '../../api/axios';
import { ChartBarIcon, TrashIcon, MagnifyingGlassIcon, ChevronDownIcon, ChevronUpIcon, PrinterIcon, ViewColumnsIcon, UserGroupIcon, PencilSquareIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, HeadingLevel, AlignmentType, WidthType, ShadingType, VerticalAlign, TextRun, Header, Footer, PageNumber, ImageRun } from 'docx';
import DataTable from '../common/DataTable';
import ConfirmationModal from '../common/ConfirmationModal';
import ExamResultFormModal from './ExamResultFormModal';
import { useAuth } from '../../context/AuthContext';
import schoolLogo from '../../assets/school-Logo.png';

// Function to convert image URL/path to Base64 (utility function)
const getBase64Image = async (imgUrl) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL.split(',')[1]);
        };
        img.onerror = error => reject(error);
        img.src = imgUrl;
    });
};

const SCHOOL_INFO = {
    name: "Learn Ease",
    address: "Km4, Mogadishu, Somalia",
    phone: "+252 61 1234567",
    logoPath: schoolLogo,
    logoBase64: null,
};

const ExamResultList = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [viewMode, setViewMode] = useState('grouped');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);
    const [search, setSearch] = useState('');
    const [examTypeFilter, setExamTypeFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [expandedStudentIds, setExpandedStudentIds] = useState(new Set());

    // Print functionality state
    const [printFilter, setPrintFilter] = useState('all'); // 'all', 'byClass', 'byStudent'
    const [selectedClassForPrint, setSelectedClassForPrint] = useState('');
    const [selectedStudentForPrint, setSelectedStudentForPrint] = useState('');
    const [selectedDateForPrint, setSelectedDateForPrint] = useState('');
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

    const { user } = useAuth();

    const fetchResults = async () => {
        setLoading(true);
        setError('');
        try {
            let response;
            if (user && user.role === 'ROLE_STUDENT') {
                response = await axios.get('/exam-results/mine');
            } else {
                response = await axios.get('/exam-results');
            }
            // Ensure we always have an array, even if API returns null/undefined
            setResults(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch exam results.');
            setResults([]); // On error, ensure results is an empty array
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
        // Initialize logo
        if (SCHOOL_INFO.logoPath) {
            getBase64Image(SCHOOL_INFO.logoPath).then(base64 => {
                SCHOOL_INFO.logoBase64 = base64;
            }).catch(err => console.error('Failed to load logo:', err));
        }
    }, []);

    // Get unique classes and students for print filters
    const uniqueClasses = useMemo(() => {
        if (!Array.isArray(results)) return [];
        return Array.from(new Set(results.map(r => r.className).filter(Boolean)));
    }, [results]);

    const uniqueStudents = useMemo(() => {
        if (!Array.isArray(results)) return [];
        return Array.from(new Set(results.map(r => r.studentName).filter(Boolean)));
    }, [results]);

    const openDeleteModal = (result) => {
        setSelectedResult(result);
        setIsConfirmOpen(true);
    };

    const openEditModal = (result) => {
        setSelectedResult(result);
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setSelectedResult(null);
    };

    const handleSuccess = () => {
        handleFormClose();
        fetchResults(); // Refresh data on success
    };

    const handleConfirmDelete = async () => {
        if (!selectedResult) return;
        try {
            await axios.delete(`/exam-results/${selectedResult.id}`);
            fetchResults();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete result.');
        } finally {
            setIsConfirmOpen(false);
            setSelectedResult(null);
        }
    };

    const toggleStudent = (studentId) => {
        setExpandedStudentIds(prevIds => {
            const newIds = new Set(prevIds);
            if (newIds.has(studentId)) {
                newIds.delete(studentId);
            } else {
                newIds.add(studentId);
            }
            return newIds;
        });
    };

    // --- FIX: Made all useMemo hooks more defensive ---

    const filteredResults = useMemo(() => {
        // Start with a guard clause to ensure results is an array
        if (!Array.isArray(results)) return [];

        return results.filter(r => {
            // Check if 'r' is a valid object before accessing its properties
            if (!r) return false;

            const searchTerm = search.toLowerCase();
            const matchesSearch = !search ||
                (r.studentName?.toLowerCase().includes(searchTerm)) ||
                (r.className?.toLowerCase().includes(searchTerm)) ||
                (r.courseName?.toLowerCase().includes(searchTerm));

            const matchesExamType = !examTypeFilter || r.examType === examTypeFilter;

            const matchesDate = !dateFilter || (r.examDate && new Date(r.examDate).toLocaleDateString() === dateFilter);

            return matchesSearch && matchesExamType && matchesDate;
        });
    }, [results, search, examTypeFilter, dateFilter]);

    const groupedByStudent = useMemo(() => {
        if (viewMode !== 'grouped' || !Array.isArray(filteredResults)) return [];

        const map = new Map();
        filteredResults.forEach(result => {
            // Use student.id from the student object, fallback to studentName if not available
            const studentId = result.student?.id || result.studentName;
            if (!studentId) return; // Skip if no identifier

            if (!map.has(studentId)) {
                map.set(studentId, {
                    studentId,
                    studentName: result.studentName,
                    className: result.className,
                    results: [],
                });
            }
            map.get(studentId).results.push(result);
        });
        return Array.from(map.values());
    }, [filteredResults, viewMode]);

    const examTypes = useMemo(() => Array.isArray(results) ? Array.from(new Set(results.map(r => r.examType).filter(Boolean))) : [], [results]);
    const examDates = useMemo(() => Array.isArray(results) ? Array.from(new Set(results.map(r => r.examDate ? new Date(r.examDate).toLocaleDateString() : null).filter(Boolean))) : [], [results]);

    const createActions = (result) => {
        if (user && user.role === 'ROLE_STUDENT') return null;
        return (
            <div className="flex items-center justify-center gap-x-2">
                <button onClick={() => openEditModal(result)} className="p-1.5 rounded text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-700" title="Edit">
                    <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button onClick={() => openDeleteModal(result)} className="p-1.5 rounded text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-700" title="Delete">
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
        );
    };

    const flatColumns = useMemo(() => [
        { header: 'Student', accessor: 'studentName', sortable: true },
        { header: 'Class', accessor: 'className', sortable: true },
        { header: 'Course', accessor: 'courseName', sortable: true },
        { header: 'Exam Type', accessor: 'examType', sortable: true },
        { header: 'Date', accessor: 'examDate', render: row => new Date(row.examDate).toLocaleDateString(), sortable: true },
        { header: 'Marks', accessor: 'marksObtained', sortable: true },
        { header: 'Grade', accessor: 'grade', sortable: true },
        { header: 'Actions', render: createActions },
    ], []);

    // Get data for printing based on filters
    const getPrintData = () => {
        let dataToPrint = filteredResults;

        if (printFilter === 'byClass' && selectedClassForPrint) {
            dataToPrint = dataToPrint.filter(r => r.className === selectedClassForPrint);
        } else if (printFilter === 'byStudent' && selectedStudentForPrint) {
            dataToPrint = dataToPrint.filter(r => r.studentName === selectedStudentForPrint);
        }

        // Apply date filter if selected
        if (selectedDateForPrint) {
            dataToPrint = dataToPrint.filter(r => {
                const resultDate = new Date(r.examDate).toLocaleDateString();
                return resultDate === selectedDateForPrint;
            });
        }

        return dataToPrint;
    };

    const generatePdf = (dataToPrint, title = "Exam Results Report") => {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const headerAndFooterHeight = 40;

        doc.autoTable({
            head: [['Student', 'Class', 'Course', 'Exam Type', 'Date', 'Marks', 'Grade']],
            body: dataToPrint.map(row => [
                row.studentName,
                row.className,
                row.courseName,
                row.examType,
                row.examDate ? new Date(row.examDate).toLocaleDateString() : 'N/A',
                row.marksObtained,
                row.grade
            ]),
            theme: 'grid',
            headStyles: { fillColor: [243, 244, 246], textColor: [17, 24, 39], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            styles: { fontSize: 9, cellPadding: 2.5 },
            margin: { top: headerAndFooterHeight },

            didDrawPage: (data) => {
                if (SCHOOL_INFO.logoBase64) {
                    doc.addImage(SCHOOL_INFO.logoBase64, 'PNG', 14, 8, 20, 20);
                }
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text(title, 38, 20);
                doc.setFontSize(12);
                doc.setFont('helvetica', 'normal');

                let subtitle = '';
                if (printFilter === 'byClass' && selectedClassForPrint) {
                    subtitle = `Class: ${selectedClassForPrint}`;
                } else if (printFilter === 'byStudent' && selectedStudentForPrint) {
                    subtitle = `Student: ${selectedStudentForPrint}`;
                }

                if (subtitle) {
                    doc.text(subtitle, 38, 27);
                }

                doc.line(14, 29, 200, 29);

                const pageCount = doc.internal.getNumberOfPages();
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`${SCHOOL_INFO.name} | Generated on: ${new Date().toLocaleDateString()}`, 14, pageHeight - 10);
                doc.text(`Page ${data.pageNumber} of ${pageCount}`, doc.internal.pageSize.width - 35, pageHeight - 10);
            },
        });

        const filename = printFilter === 'byClass' && selectedClassForPrint
            ? `${selectedClassForPrint.replace(/\s+/g, '_')}_exam_results.pdf`
            : printFilter === 'byStudent' && selectedStudentForPrint
                ? `${selectedStudentForPrint.replace(/\s+/g, '_')}_exam_results.pdf`
                : 'exam_results.pdf';

        doc.save(filename);
    };

    const generateDocx = async (dataToPrint, title = "Exam Results Report") => {
        try {
            const tableHeader = new TableRow({
                children: ['Student', 'Class', 'Course', 'Exam Type', 'Date', 'Marks', 'Grade'].map(col => new TableCell({
                    children: [new Paragraph({ text: col, style: 'tableHeader' })],
                    shading: { type: ShadingType.CLEAR, fill: "F3F4F6" },
                    verticalAlign: VerticalAlign.CENTER,
                })),
                tableHeader: true,
            });

            const tableDataRows = dataToPrint.map(r => new TableRow({
                children: [
                    r.studentName,
                    r.className,
                    r.courseName,
                    r.examType,
                    r.examDate ? new Date(r.examDate).toLocaleDateString() : 'N/A',
                    r.marksObtained,
                    r.grade
                ].map(cell => new TableCell({
                    children: [new Paragraph(String(cell ?? ''))],
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
                        new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
                        ...(printFilter === 'byClass' && selectedClassForPrint ? [new Paragraph({ text: `Class: ${selectedClassForPrint}`, heading: HeadingLevel.HEADING_2 })] : []),
                        ...(printFilter === 'byStudent' && selectedStudentForPrint ? [new Paragraph({ text: `Student: ${selectedStudentForPrint}`, heading: HeadingLevel.HEADING_2 })] : []),
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
            const filename = printFilter === 'byClass' && selectedClassForPrint
                ? `${selectedClassForPrint.replace(/\s+/g, '_')}_exam_results.docx`
                : printFilter === 'byStudent' && selectedStudentForPrint
                    ? `${selectedStudentForPrint.replace(/\s+/g, '_')}_exam_results.docx`
                    : 'exam_results.docx';
            saveAs(blob, filename);
        } catch (err) {
            console.error("Failed to generate DOCX:", err);
            setError('Failed to generate DOCX file. Please try again.');
        }
    };

    const handlePrint = (type) => {
        const dataToPrint = getPrintData();
        if (dataToPrint.length === 0) {
            setError('No data available for printing with the selected filters.');
            return;
        }

        let title = "Exam Results Report";

        if (printFilter === 'byClass' && selectedClassForPrint) {
            title = `${selectedClassForPrint} Exam Results`;
        } else if (printFilter === 'byStudent' && selectedStudentForPrint) {
            title = `${selectedStudentForPrint} Exam Results`;
        }

        // Add date filter to title if selected
        if (selectedDateForPrint) {
            title += ` - ${selectedDateForPrint}`;
        }

        if (type === 'pdf') {
            generatePdf(dataToPrint, title);
        } else if (type === 'docx') {
            generateDocx(dataToPrint, title);
        }

        setIsPrintModalOpen(false);
    };

    const openPrintModal = () => {
        setIsPrintModalOpen(true);
    };

    const renderContent = () => {
        if (loading) {
            return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading results...</div>;
        }

        if (error) {
            return <div className="p-8 text-center text-red-500">{error}</div>;
        }

        if (filteredResults.length === 0) {
            return (
                <div className="text-center py-16">
                    <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-200">No Exam Results Found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters, or add a new result.</p>
                </div>
            );
        }

        return (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {groupedByStudent.map(group => (
                    <div key={group.studentId}>
                        <button
                            className="w-full flex items-center justify-between px-3 sm:px-4 py-3 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            onClick={() => toggleStudent(group.studentId)}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center text-left min-w-0 flex-1">
                                    <span className="font-semibold text-base sm:text-lg text-gray-800 dark:text-gray-100 truncate">{group.studentName}</span>
                                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">| Class: {group.className}</span>
                                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">| Student ID: {group.studentId || 'N/A'}</span>
                                <span className="text-xs sm:text-sm text-indigo-800 dark:text-indigo-200">| Results: {group.results.length}</span>
                            </div>
                            {expandedStudentIds.has(group.studentId) ? <ChevronUpIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 flex-shrink-0" /> : <ChevronDownIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 flex-shrink-0" />}
                        </button>
                        {expandedStudentIds.has(group.studentId) && (
                            <div className="bg-white dark:bg-gray-800 p-2 sm:p-4">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-xs sm:text-sm">
                                        <thead>
                                            <tr>
                                                {['Course', 'Exam Type', 'Date', 'Marks', 'Grade', 'Actions'].map(header => (
                                                    <th key={header} className="px-2 sm:px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{header}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {group.results.map(result => (
                                                <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-2 sm:px-3 py-2 sm:py-3 text-gray-700 dark:text-gray-300">{result.courseName}</td>
                                                    <td className="px-2 sm:px-3 py-2 sm:py-3 text-gray-700 dark:text-gray-300">{result.examType}</td>
                                                    <td className="px-2 sm:px-3 py-2 sm:py-3 text-gray-700 dark:text-gray-300">{new Date(result.examDate).toLocaleDateString()}</td>
                                                    <td className="px-2 sm:px-3 py-2 sm:py-3 font-medium text-gray-800 dark:text-gray-200">{result.marksObtained}</td>
                                                    <td className="px-2 sm:px-3 py-2 sm:py-3 text-gray-700 dark:text-gray-300">{result.grade}</td>
                                                    <td className="px-2 sm:px-3 py-2 sm:py-3">{createActions(result)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="p-3 sm:p-4 lg:p-6">
            <div className="mb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        {user && user.role !== 'ROLE_STUDENT' && (
                        <button onClick={() => { setSelectedResult(null); setIsFormOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg shadow-sm flex items-center justify-center gap-2 text-sm">
                            <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span>Add Result</span>
                        </button>
                        )}
                        {/* Print button only for admin */}
                        {user && user.role === 'ROLE_ADMIN' && (
                        <Menu as="div" className="relative inline-block text-left w-full sm:w-auto">
                            <div>
                                <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-3 sm:px-4 py-2 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    <PrinterIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                    Print
                                    <ChevronDownIcon className="-mr-1 ml-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                                </Menu.Button>
                            </div>
                            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                    <div className="py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button onClick={() => { setPrintFilter('all'); setSelectedClassForPrint(''); setSelectedStudentForPrint(''); setSelectedDateForPrint(''); handlePrint('pdf'); }} className={`${active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-200'} group flex rounded-md items-center w-full px-4 py-2 text-sm`}>
                                                    Export All as PDF
                                                </button>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button onClick={() => { setPrintFilter('all'); setSelectedClassForPrint(''); setSelectedStudentForPrint(''); setSelectedDateForPrint(''); handlePrint('docx'); }} className={`${active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-200'} group flex rounded-md items-center w-full px-4 py-2 text-sm`}>
                                                    Export All as DOCX
                                                </button>
                                            )}
                                        </Menu.Item>
                                        <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button onClick={openPrintModal} className={`${active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-200'} group flex rounded-md items-center w-full px-4 py-2 text-sm`}>
                                                    <FunnelIcon className="w-4 h-4 mr-2" />
                                                    Print with Filters
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                            <UserGroupIcon className="h-4 w-4 inline mr-1" />
                            Grouped View
                        </span>
                    </div>
                </div>
                <div className="mt-4 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="relative lg:col-span-2">
                        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by student, class, or course..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <select
                            value={examTypeFilter}
                            onChange={e => setExamTypeFilter(e.target.value)}
                            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Exam Types</option>
                            {examTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                        <select
                            value={dateFilter}
                            onChange={e => setDateFilter(e.target.value)}
                            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Dates</option>
                            {examDates.map(date => <option key={date} value={date}>{date}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="mt-4 bg-white dark:bg-gray-800/50 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    {renderContent()}
                </div>
            </div>

            {/* Also, do not render ExamResultFormModal or ConfirmationModal for students */}
            {user && user.role !== 'STUDENT' && (
                <>
                    <ExamResultFormModal
                        isOpen={isFormOpen}
                        onClose={handleFormClose}
                        onSuccess={handleSuccess}
                        editData={selectedResult}
                    />
                    <ConfirmationModal
                        isOpen={isConfirmOpen}
                        onClose={() => setIsConfirmOpen(false)}
                        onConfirm={handleConfirmDelete}
                        title="Delete Exam Result"
                        message="Are you sure you want to delete this result? This action is permanent."
                    />
                </>
            )}

            {/* Print Modal */}
            {isPrintModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Print Exam Results</h3>
                                <button
                                    onClick={() => setIsPrintModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Print Filter
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="printFilter"
                                                value="all"
                                                checked={printFilter === 'all'}
                                                onChange={(e) => setPrintFilter(e.target.value)}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                            />
                                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">All Results</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="printFilter"
                                                value="byClass"
                                                checked={printFilter === 'byClass'}
                                                onChange={(e) => setPrintFilter(e.target.value)}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                            />
                                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">By Class</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="printFilter"
                                                value="byStudent"
                                                checked={printFilter === 'byStudent'}
                                                onChange={(e) => setPrintFilter(e.target.value)}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                            />
                                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">By Student</span>
                                        </label>
                                    </div>
                                </div>

                                {printFilter === 'byClass' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Select Class
                                        </label>
                                        <select
                                            value={selectedClassForPrint}
                                            onChange={(e) => setSelectedClassForPrint(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">Select a class...</option>
                                            {uniqueClasses.map(className => (
                                                <option key={className} value={className}>{className}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {printFilter === 'byStudent' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Select Student
                                        </label>
                                        <select
                                            value={selectedStudentForPrint}
                                            onChange={(e) => setSelectedStudentForPrint(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">Select a student...</option>
                                            {uniqueStudents.map(studentName => (
                                                <option key={studentName} value={studentName}>{studentName}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Date Filter - applies to all print types */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Filter by Exam Date (Optional)
                                    </label>
                                    <select
                                        value={selectedDateForPrint}
                                        onChange={(e) => setSelectedDateForPrint(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">All Dates</option>
                                        {examDates.map(date => (
                                            <option key={date} value={date}>{date}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        onClick={() => setIsPrintModalOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handlePrint('pdf')}
                                        disabled={
                                            (printFilter === 'byClass' && !selectedClassForPrint) ||
                                            (printFilter === 'byStudent' && !selectedStudentForPrint)
                                        }
                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        Export PDF
                                    </button>
                                    <button
                                        onClick={() => handlePrint('docx')}
                                        disabled={
                                            (printFilter === 'byClass' && !selectedClassForPrint) ||
                                            (printFilter === 'byStudent' && !selectedStudentForPrint)
                                        }
                                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        Export DOCX
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamResultList;