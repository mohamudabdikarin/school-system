// src/pages/AdminReports.jsx
import { useState, useEffect } from 'react';
import axios from '../api/axios';

export default function AdminReports() {
    const [reportType, setReportType] = useState('class'); // 'class' or 'student'
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch classes and students for dropdowns
    useEffect(() => {
        axios.get('/api/v1/classes').then(res => setClasses(res.data));
        axios.get('/api/v1/students').then(res => setStudents(res.data));
    }, []);

    const handleGenerateReport = () => {
        if (!selectedId) return;
        setLoading(true);
        const url = reportType === 'class' 
            ? `/api/v1/reports/by-class/${selectedId}`
            : `/api/v1/reports/by-student/${selectedId}`;
        
        axios.get(url)
            .then(res => setResults(res.data))
            .finally(() => setLoading(false));
    };
    
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-6">
            <style>
                {`
                    @media print {
                        body * { visibility: hidden; }
                        #print-section, #print-section * { visibility: visible; }
                        #print-section { position: absolute; left: 0; top: 0; width: 100%; }
                        .no-print { display: none; }
                    }
                `}
            </style>

            <h1 className="text-2xl font-bold mb-4 no-print">Exam Reports</h1>
            
            {/* --- Filters --- */}
            <div className="p-4 bg-gray-100 rounded-lg mb-6 flex items-end gap-4 no-print">
                <div>
                    <label className="block text-sm font-medium">Report Type</label>
                    <select value={reportType} onChange={e => setReportType(e.target.value)} className="p-2 border rounded-md">
                        <option value="class">By Class</option>
                        <option value="student">By Student</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">{reportType === 'class' ? 'Select Class' : 'Select Student'}</label>
                    <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="p-2 border rounded-md w-64">
                        <option value="">-- Select --</option>
                        {(reportType === 'class' ? classes : students).map(item => (
                            <option key={item.id} value={item.id}>
                                {reportType === 'class' ? item.name : `${item.firstName} ${item.lastName}`}
                            </option>
                        ))}
                    </select>
                </div>
                <button onClick={handleGenerateReport} className="px-4 py-2 bg-blue-600 text-white rounded-md">Generate</button>
            </div>

            {/* --- Report Display --- */}
            <div id="print-section">
                {results.length > 0 && (
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Report Results</h2>
                        <button onClick={handlePrint} className="px-4 py-2 bg-green-600 text-white rounded-md no-print">Print Report</button>
                    </div>
                )}
                
                {loading && <p>Loading report...</p>}

                {!loading && results.length > 0 && (
                    <table className="min-w-full bg-white border">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="py-2 px-4 border">Student</th>
                                <th className="py-2 px-4 border">Subject</th>
                                <th className="py-2 px-4 border">Exam Type</th>
                                <th className="py-2 px-4 border">Date</th>
                                <th className="py-2 px-4 border">Marks</th>
                                <th className="py-2 px-4 border">Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map(res => (
                                <tr key={res.id}>
                                    <td className="py-2 px-4 border">{res.studentName}</td>
                                    <td className="py-2 px-4 border">{res.subjectName}</td>
                                    <td className="py-2 px-4 border">{res.examType}</td>
                                    <td className="py-2 px-4 border">{new Date(res.examDate).toLocaleDateString()}</td>
                                    <td className="py-2 px-4 border">{res.marksObtained}</td>
                                    <td className="py-2 px-4 border">{res.grade}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}