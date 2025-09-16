import React, { useState } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import Layout from '../../Components/Layout';

const ExamResultsArchived = ({ user, results, years = [], filters = {} }) => {
    const [selectedYear, setSelectedYear] = useState(filters.year || '');
    const [collapsed, setCollapsed] = useState({});

    const applyFilters = (yearVal) => {
        router.get('/guidance/exam-results/archived', { year: yearVal || undefined }, { preserveState: true, preserveScroll: true });
    };

    const handleUnarchive = async (id) => {
        try {
            await axios.post(`/guidance/exam-results/${id}/unarchive`);
            window.showAlert('Result unarchived', 'success');
            applyFilters(selectedYear);
        } catch (e) {
            window.showAlert('Failed to unarchive result', 'error');
        }
    };

    const handleUnarchiveYear = async (year) => {
        try {
            await axios.post('/guidance/exam-results/unarchive-year', { year });
            window.showAlert(`Unarchived results for ${year}`, 'success');
            applyFilters(selectedYear);
        } catch (e) {
            window.showAlert('Failed to unarchive year', 'error');
        }
    };

    // Group current page results by year to display like folders
    const groups = results.data.reduce((acc, r) => {
        const y = new Date(r.created_at).getFullYear();
        if (!acc[y]) acc[y] = [];
        acc[y].push(r);
        return acc;
    }, {});
    const groupYears = Object.keys(groups).sort((a, b) => Number(b) - Number(a));

    return (
        <Layout user={user}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border-l-4 border-slate-500">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-semibold text-slate-800">Archived Exam Results</h2>
                            <a href="/guidance/exam-results" className="text-sm text-slate-600 underline">Back to Results</a>
                        </div>
                        <div className="flex items-center gap-2">
                            <select value={selectedYear} onChange={(e)=>{ setSelectedYear(e.target.value); applyFilters(e.target.value); }} className="border-2 border-gray-300 rounded-lg shadow-sm focus:ring-4 focus:ring-slate-100 focus:border-slate-500 min-w-[120px]">
                                <option value="">All Years</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Year folders */}
                <div className="space-y-4">
                    {groupYears.map((y) => (
                        <div key={y} className="bg-white rounded-lg shadow border border-gray-200">
                            <div className="flex items-center justify-between px-4 py-3 border-b">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setCollapsed({ ...collapsed, [y]: !collapsed[y] })}
                                        className="w-6 h-6 rounded bg-slate-100 text-slate-700 flex items-center justify-center"
                                        aria-label="Toggle"
                                    >
                                        {collapsed[y] ? '▸' : '▾'}
                                    </button>
                                    <div className="font-semibold text-slate-800">{y}</div>
                                    <div className="text-xs text-slate-500">{groups[y].length} item(s)</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleUnarchiveYear(y)} className="px-3 py-1 rounded-md bg-slate-700 text-white hover:bg-slate-800 text-sm">Unarchive All ({y})</button>
                                </div>
                            </div>
                            {!collapsed[y] && (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3" />
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {groups[y].map((r) => (
                                                <tr key={r.resultId || r.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.examinee?.name || 'Unknown'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.exam ? r.exam['exam-ref-no'] : 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.score}%</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.semester || '—'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                        <button onClick={() => handleUnarchive(r.resultId || r.id)} className="px-3 py-1 rounded-md bg-slate-700 text-white hover:bg-slate-800">Unarchive</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}
                    {groupYears.length === 0 && (
                        <div className="text-center py-10 text-sm text-gray-500">No archived results found.</div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ExamResultsArchived;


