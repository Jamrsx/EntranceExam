import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Layout from '../../Components/Layout';

export default function ExamResults({ user, evaluator, department, examResults, availableExams, stats, filters }) {

    const [searchTerm, setSearchTerm] = useState(filters?.student_name || '');
    const [selectedExam, setSelectedExam] = useState(filters?.exam_id || '');
    const [showModal, setShowModal] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailData, setDetailData] = useState(null);

    // Add safety checks for null/undefined data
    const safeExamResults = examResults || { data: [], links: [] };
    const rows = Array.isArray(safeExamResults?.data)
        ? safeExamResults.data
        : (Array.isArray(safeExamResults) ? safeExamResults : []);
    const safeStats = stats || {};
    const safeAvailableExams = availableExams || [];

    const handleSearch = () => {
        router.get('/evaluator/exam-results', {
            student_name: searchTerm,
            exam_id: selectedExam
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleReset = () => {
        setSearchTerm('');
        setSelectedExam('');
        router.get('/evaluator/exam-results', {}, {
            preserveState: true,
            replace: true
        });
    };

    const openDetails = async (id) => {
        try {
            setDetailLoading(true);
            setShowModal(true);
            const res = await fetch(`/evaluator/exam-results/${id}?as=json`);
            const data = await res.json();
            setDetailData(data);
        } catch (e) {
            console.error('Failed to load details', e);
            setDetailData({ error: 'Failed to load details' });
        } finally {
            setDetailLoading(false);
        }
    };

    const printDetails = () => {
        if (!detailData?.result?.id) return;
        window.open(`/evaluator/exam-results/${detailData.result.id}/export`, '_blank');
    };

    return (
        <>
            <Head title={`${department || evaluator?.Department || 'Department'} - Exam Results`} />
            
            <Layout user={user} routes={[]}>
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                {department || evaluator?.Department || 'Department'} - Exam Results
                            </h2>
                            <p className="text-purple-100 text-sm md:text-base">
                                View departmental exam results for students in {department || evaluator?.Department || 'your department'}.
                            </p>
                            
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Total Results</p>
                                        <p className="text-2xl font-semibold text-gray-900">{safeStats.total_results || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Students Passed</p>
                                        <p className="text-2xl font-semibold text-gray-900">{safeStats.passed_count || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Average Score</p>
                                        <p className="text-2xl font-semibold text-gray-900">{safeStats.average_score || 0}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Pass Rate</p>
                                        <p className="text-2xl font-semibold text-gray-900">{safeStats.pass_rate || 0}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Search by student name..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Exam</label>
                                    <select
                                        value={selectedExam}
                                        onChange={(e) => setSelectedExam(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">All Exams</option>
                                        {safeAvailableExams.map((exam) => (
                                            <option key={exam.id} value={exam.id}>
                                                {exam.exam_ref_no} - {exam.exam_title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-end space-x-2">
                                    <button
                                        onClick={handleSearch}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        Search
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={() => {
                                            const params = new URLSearchParams({
                                                student_name: searchTerm || '',
                                                exam_id: selectedExam || ''
                                            });
                                            window.open(`/evaluator/exam-results-export?${params.toString()}`, '_blank');
                                        }}
                                        className="group inline-flex items-center px-3.5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-transform duration-150 ease-out hover:scale-110"
                                    >
                                        <span className="sr-only">Download All (PDF)</span>
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                            <polyline points="7 10 12 15 17 10"/>
                                            <line x1="12" y1="15" x2="12" y2="3"/>
                                        </svg>
                                        <span className="hidden group-hover:inline-block ml-2 whitespace-nowrap">Download Reports</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Departmental Exam Results</h3>
                            {rows && rows.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {rows.map((result) => (
                                                <tr key={result.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.student_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div>
                                                            <div className="font-medium">{result.exam_ref_no}</div>
                                                            <div className="text-xs text-gray-400">{result.exam_title}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{result.score_percentage}%</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.correct_answers}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.total_items}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                                                            result.remarks === 'Pass' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {result.remarks}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div>
                                                            <div>{result.date_taken}</div>
                                                            <div className="text-xs text-gray-400">{result.time_taken}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                        <button
                                                            onClick={() => openDetails(result.id)}
                                                            className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 hover:bg-purple-200"
                                                        >
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No exam results found for {department || evaluator?.Department || 'your department'}.</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {safeExamResults.links && (
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing {safeExamResults.from || 0} to {safeExamResults.to || 0} of {safeExamResults.total || 0} results
                                    </div>
                                    <div className="flex space-x-2">
                                        {safeExamResults.links.map((link, index) => (
                                            link.url ? (
                                                <a
                                                    key={index}
                                                    href={link.url}
                                                    className={`px-3 py-2 text-sm rounded-md ${
                                                        link.active
                                                            ? 'bg-purple-600 text-white'
                                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ) : (
                                                <span
                                                    key={index}
                                                    className="px-3 py-2 text-sm rounded-md opacity-50 cursor-not-allowed bg-white text-gray-700 border border-gray-300"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Layout>

            {/* Details Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/40">
                    {/* Right-side drawer */}
                    <div className="fixed right-0 top-0 h-full w-full sm:w-[380px] md:w-[520px] lg:w-[680px] bg-white shadow-xl overflow-hidden" id="dept-exam-details">
                        <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                            <h3 className="text-lg font-semibold">Exam Result Details</h3>
                            <button onClick={() => { setShowModal(false); setDetailData(null); }} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <div className="p-6 h-[calc(100%-112px)] overflow-y-auto">
                            {detailLoading && (
                                <div className="text-center text-gray-500">Loading…</div>
                            )}
                            {!detailLoading && detailData && detailData.error && (
                                <div className="text-red-600 text-sm">{detailData.error}</div>
                            )}
                            {!detailLoading && detailData && !detailData.error && (
                                <div>
                                    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 rounded p-4">
                                            <div className="text-sm text-gray-500">Student</div>
                                            <div className="font-semibold">{detailData.result?.student_name}</div>
                                        </div>
                                        <div className="bg-gray-50 rounded p-4">
                                            <div className="text-sm text-gray-500">Exam</div>
                                            <div className="font-semibold">{detailData.result?.exam_ref_no} — {detailData.result?.exam_title}</div>
                                        </div>
                                        <div className="bg-gray-50 rounded p-4">
                                            <div className="text-sm text-gray-500">Score</div>
                                            <div className="font-semibold">{detailData.result?.score_percentage}% ({detailData.result?.correct_answers}/{detailData.result?.total_items})</div>
                                        </div>
                                        <div className="bg-gray-50 rounded p-4">
                                            <div className="text-sm text-gray-500">Remarks</div>
                                            <div className="font-semibold">{detailData.result?.remarks}</div>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-md font-semibold">Answers</h4>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span className="inline-flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-green-500"></span> Correct</span>
                                                <span className="inline-flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-red-500"></span> Incorrect</span>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Answer</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {(detailData.answers || []).map((a, idx) => {
                                                        const isCorrect = !!a.is_correct;
                                                        return (
                                                            <tr key={`${a.question_id}-${idx}`} className={isCorrect ? 'bg-green-50/40' : 'bg-red-50/40'}>
                                                                <td className="px-4 py-2 text-sm text-gray-700">{idx + 1}</td>
                                                                <td className="px-4 py-2 text-sm text-gray-900">{a.question}</td>
                                                                <td className={`px-4 py-2 text-sm inline-flex items-center gap-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                                                    {isCorrect ? (
                                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                                                                    ) : (
                                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                                                    )}
                                                                    <span>{a.student_answer}</span>
                                                                </td>
                                                                <td className="px-4 py-2 text-sm text-gray-700">{a.correct_answer}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center sticky bottom-0">
                            <div className="flex gap-2">
                                <button onClick={printDetails} className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm">Download PDF</button>
                            </div>
                            <button onClick={() => { setShowModal(false); setDetailData(null); }} className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
