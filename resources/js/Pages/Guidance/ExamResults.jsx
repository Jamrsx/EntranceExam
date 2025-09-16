import React, { useState } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import ChartCard from '../../Components/ChartCard';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
    Filler,
);

const ExamResults = ({ user, results, years = [], filters = {} }) => {
    const [selectedExam, setSelectedExam] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedYear, setSelectedYear] = useState(filters.year || '');
    const [includeArchived, setIncludeArchived] = useState(!!filters.include_archived);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState('');
    const [detailData, setDetailData] = useState(null);
    const [answerFilter, setAnswerFilter] = useState('all'); // all | correct | incorrect
    const [searchText, setSearchText] = useState('');
    const [compactView, setCompactView] = useState(true);

    const openDetails = async (resultId) => {
        setDetailOpen(true);
        setDetailLoading(true);
        setDetailError('');
        setDetailData(null);
        try {
            const { data } = await axios.get(`/guidance/exam-results/${resultId}/details`);
            if (data?.success) {
                setDetailData(data.data);
            } else {
                setDetailError(data?.message || 'Failed to load details');
            }
        } catch (e) {
            setDetailError('Failed to load details');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleDownload = async (result) => {
        try {
            const { data } = await axios.get(`/guidance/exam-results/${result.resultId || result.id}/details`);
            const d = data?.data || {};
            const studentName = result.examinee?.name || d?.examinee?.name || 'Student';
            const examRef = result.exam?.['exam-ref-no'] || d?.exam_ref_no || 'Exam';
            const semester = d.semester || result.semester || '';

            const answersRows = (d.answers || [])
                .map(a => `<tr>
                    <td>${a.no}</td>
                    <td>${a.question?.replace(/</g,'&lt;')}</td>
                    <td>${a.student_answer ?? ''}</td>
                    <td>${a.correct_answer ?? ''}</td>
                    <td>${a.is_correct ? '✔' : '✖'}</td>
                </tr>`).join('');

            const recCourses = (d.recommended_courses || result.recommended_courses || [])
                .map((c) => `<li><b>${c.course_code || ''}</b> ${c.course_name || ''}</li>`)
                .join('');

            const styles = `
                @media print { @page { margin: 16mm; } }
                body { font-family: Inter, Arial, sans-serif; color:#111827; }
                .header { display:flex; align-items:center; gap:12px; }
                .logo { height:56px; width:56px; }
                .muted { color:#6b7280; }
                .badge { display:inline-block; padding:2px 8px; background:#eef2ff; color:#3730a3; border-radius:999px; font-size:12px; }
                .card { border:1px solid #e5e7eb; border-radius:8px; padding:12px; }
                .grid { display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:12px; }
                table { width:100%; border-collapse:collapse; font-size:12px; }
                th, td { border:1px solid #e5e7eb; padding:6px; text-align:left; }
                thead th { background:#f9fafb; }
            `;

            const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${studentName} - ${examRef} Result</title>
                <style>${styles}</style></head>
                <body>
                    <div class="header">
                        <img src="/OCC logo.png" alt="OCC" class="logo"/>
                        <div>
                            <div style="font-size:18px; font-weight:700;">Opol Community College</div>
                            <div class="muted" style="font-size:13px;">Guidance Office • Examination Result</div>
                        </div>
                    </div>
                    <hr style="margin:12px 0; border:none; border-top:1px solid #e5e7eb;"/>

                    <div class="grid">
                        <div class="card"><div class="muted">Student</div><div style="font-weight:700;">${studentName}</div></div>
                        <div class="card"><div class="muted">Exam Ref</div><div style="font-weight:700;">${examRef}</div></div>
                        <div class="card"><div class="muted">Date</div><div style="font-weight:700;">${new Date(d.created_at || result.created_at).toLocaleString()}</div></div>
                    </div>

                    <div class="grid" style="margin-top:12px;">
                        <div class="card"><div class="muted">Score</div><div style="font-weight:700;">${Math.round((d.score ?? result.score ?? result.percentage ?? 0) * 10) / 10}%</div></div>
                        <div class="card"><div class="muted">Correct</div><div style="font-weight:700;">${(result.correct_answers ?? d.correct_answers ?? result.correct ?? '-')}/${result.total_questions ?? d.total_questions ?? result.total_items ?? '-'}</div></div>
                        <div class="card"><div class="muted">Time</div><div style="font-weight:700;">${d.time_taken_seconds ? (Math.floor(d.time_taken_seconds/60)+":"+String(d.time_taken_seconds%60).padStart(2,'0')) : 'N/A'}</div></div>
                    </div>

                    ${semester ? `<div style="margin-top:8px;" class="badge">Semester: ${semester}</div>` : ''}

                    ${recCourses ? `<div style="margin-top:16px;" class="card"><div style="font-weight:600; margin-bottom:6px;">Recommended Courses</div><ul>${recCourses}</ul></div>` : ''}

                    ${answersRows ? `<div style="margin-top:16px;">
                        <div style="font-weight:600; margin-bottom:6px;">Answers</div>
                        <table>
                            <thead><tr>
                                <th>#</th>
                                <th>Question</th>
                                <th>Your Answer</th>
                                <th>Correct</th>
                                <th>Result</th>
                            </tr></thead>
                            <tbody>${answersRows}</tbody>
                        </table>
                    </div>` : ''}

                    <div class="muted" style="margin-top:12px;font-size:11px;">Generated • ${new Date().toLocaleString()}</div>
                </body></html>`;

            const w = window.open('', '_blank');
            if (!w) { window?.showAlert?.('Popup blocked. Please allow popups to export PDF.', 'error'); return; }
            w.document.open();
            w.document.write(html);
            w.document.close();
            w.onload = () => { w.focus(); w.print(); };
        } catch (e) {
            window?.showAlert?.('Failed to download result', 'error');
        }
    };

    const handleDownloadAllPdf = () => {
        // Compile filtered results and summary stats
        const items = results.data.filter(result => {
            if (selectedExam && result.exam && result.exam['exam-ref-no'] !== selectedExam) return false;
            if (selectedStatus && result.status !== selectedStatus) return false;
            return true;
        });
        const total = items.length;
        const pass = items.filter(r => (r.score ?? 0) >= 10).length;
        const fail = Math.max(total - pass, 0);
        const avg = total > 0 ? Math.round(items.reduce((s, r) => s + (r.score ?? 0), 0) / total) : 0;

        const rows = items.map((r, idx) => {
            const recs = (r.recommended_courses || []).map(c => `${c.course_code || ''}`).join(', ');
            return `<tr>
                <td style="padding:6px;border:1px solid #e5e7eb;">${idx + 1}</td>
                <td style="padding:6px;border:1px solid #e5e7eb;">${(r.examinee?.name || '—').replace(/</g,'&lt;')}</td>
                <td style="padding:6px;border:1px solid #e5e7eb;">${r.exam ? (r.exam['exam-ref-no'] || 'N/A') : 'N/A'}</td>
                <td style=\"padding:6px;border:1px solid #e5e7eb;\">${r.semester || '—'}</td>
                <td style="padding:6px;border:1px solid #e5e7eb;">${r.score ?? 0}%</td>
                <td style="padding:6px;border:1px solid #e5e7eb;">${r.correct_answers ?? r.correct ?? '-'} / ${r.total_questions ?? r.total_items ?? '-'}</td>
                <td style="padding:6px;border:1px solid #e5e7eb;">${(r.time_taken ? (Math.floor(r.time_taken/60)+":"+String(r.time_taken%60).padStart(2,'0')) : 'N/A')}</td>
                <td style="padding:6px;border:1px solid #e5e7eb;">${new Date(r.created_at).toLocaleDateString()}</td>
                <td style="padding:6px;border:1px solid #e5e7eb;">${recs}</td>
            </tr>`;
        }).join('');

        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>OCC Guidance - Exam Results Report</title>
            <style>
                @media print { @page { margin: 18mm; } }
                body { font-family: Arial, sans-serif; color:#111827; }
                .muted { color:#6b7280; }
                .card { border:1px solid #e5e7eb; border-radius:8px; padding:12px; }
                .grid { display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:12px; }
                .table { border-collapse: collapse; width:100%; font-size:12px; }
                .table th { text-align:left; background:#f9fafb; border:1px solid #e5e7eb; padding:6px; }
            </style>
        </head>
        <body>
            <div style="display:flex; align-items:center; gap:12px;">
                <img src="/OCC logo.png" alt="OCC" style="height:56px;width:56px;"/>
                <div>
                    <div style="font-size:18px; font-weight:700;">Opol Community College</div>
                    <div class="muted" style="font-size:13px;">Guidance Office • Examination Results Report</div>
                </div>
            </div>
            <hr style="margin:12px 0; border:none; border-top:1px solid #e5e7eb;"/>

            <div class="grid" style="margin-bottom:12px;">
                <div class="card"><div class="muted">Total Results</div><div style="font-size:20px;font-weight:700;">${total}</div></div>
                <div class="card"><div class="muted">Passed (≥10%)</div><div style="font-size:20px;font-weight:700;color:#059669;">${pass}</div></div>
                <div class="card"><div class="muted">Average Score</div><div style="font-size:20px;font-weight:700;color:#7c3aed;">${avg}%</div></div>
            </div>

            <h3 style="margin:6px 0 8px;">Detailed Results</h3>
            <table class="table"> 
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Student</th>
                        <th>Exam</th>
                        <th>Semester</th>
                        <th>Score</th>
                        <th>Correct</th>
                        <th>Time</th>
                        <th>Date</th>
                        <th>Recommended Courses</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>

            <div class="muted" style="margin-top:12px;font-size:11px;">Generated by OCC Guidance Office • ${new Date().toLocaleString()}</div>
        </body></html>`;

        const w = window.open('', '_blank');
        if (!w) { window?.showAlert?.('Popup blocked. Please allow popups to export PDF.', 'error'); return; }
        w.document.open();
        w.document.write(html);
        w.document.close();
        // Defer print to allow images to load
        w.onload = () => { w.focus(); w.print(); };
    };

    const filteredResults = results.data.filter(result => {
        if (selectedExam && result.exam && result.exam['exam-ref-no'] !== selectedExam) {
            return false;
        }
        if (selectedStatus && result.status !== selectedStatus) {
            return false;
        }
        return true;
    });

    const uniqueExams = [...new Set(results.data.map(result => result.exam ? result.exam['exam-ref-no'] : null).filter(Boolean))];
    const statuses = ['completed', 'in_progress', 'pending'];

    // Charts data
    const passCount = filteredResults.filter(r => (r.score || 0) >= 10).length;
    const failCount = Math.max(filteredResults.length - passCount, 0);
    const averageScore = filteredResults.length > 0
        ? Math.round(filteredResults.reduce((sum, r) => sum + (r.score || 0), 0) / filteredResults.length)
        : 0;

    const passFailData = {
        labels: ['Passed', 'Failed'],
        datasets: [
            {
                label: 'Results',
                data: [passCount, failCount],
                backgroundColor: ['#10B981', '#EF4444'],
                borderColor: ['#10B981', '#EF4444'],
                borderWidth: 1,
            },
        ],
    };

    const recent = filteredResults.slice(0, 20).reverse();
    const lineData = {
        labels: recent.map(r => r.exam ? r.exam['exam-ref-no'] : 'Exam'),
        datasets: [
            {
                label: 'Score %',
                data: recent.map(r => r.score || 0),
                borderColor: '#14B8A6',
                backgroundColor: 'rgba(20, 184, 166, 0.2)',
                fill: true,
                tension: 0.3,
                pointRadius: 3,
            },
        ],
    };

    // Score buckets for distribution chart
    const buckets = [0, 20, 40, 60, 80, 100];
    const bucketLabels = ['0-19', '20-39', '40-59', '60-79', '80-100'];
    const bucketCounts = [0, 0, 0, 0, 0];
    filteredResults.forEach(r => {
        const s = r.score || 0;
        if (s < 20) bucketCounts[0]++;
        else if (s < 40) bucketCounts[1]++;
        else if (s < 60) bucketCounts[2]++;
        else if (s < 80) bucketCounts[3]++;
        else bucketCounts[4]++;
    });
    const distributionData = {
        labels: bucketLabels,
        datasets: [
            {
                label: 'Count',
                data: bucketCounts,
                backgroundColor: '#60A5FA',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12 } },
            tooltip: { mode: 'index', intersect: false },
        },
        scales: {
            y: { beginAtZero: true },
        },
    };

    console.log('[ExamResults] Chart data', { passCount, failCount, averageScore, bucketCounts, total: filteredResults.length });

    const handleProcessResults = () => {
        router.post('/guidance/process-results', {}, {
            onSuccess: () => {
                window.showAlert('Results processed and recommendations generated successfully', 'success');
            },
            onError: (errors) => {
                window.showAlert('Failed to process results', 'error');
            }
        });
    };

    const applyServerFilters = (yearValue = selectedYear, include = includeArchived) => {
        router.get('/guidance/exam-results', {
            year: yearValue || undefined,
            include_archived: include ? 'true' : 'false',
        }, { preserveState: true, preserveScroll: true });
    };

    const handleArchiveAll = async () => {
        try {
            await axios.post('/guidance/exam-results/archive-all');
            window.showAlert('All results archived', 'success');
            applyServerFilters(selectedYear, includeArchived);
        } catch (e) {
            window.showAlert('Failed to archive all results', 'error');
        }
    };

    // Unarchive-by-year moved to Archived page

    return (
        <Layout user={user}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                {!compactView && (
                <div className="mb-8 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg p-6 text-white animate-fadeIn">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Exam Results</h1>
                            <p className="mt-2 text-teal-100">View and analyze student exam performance</p>
                            <div className="mt-4 flex items-center space-x-6">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm">Results: {results.total || 0} examinees</span>
                                </div>
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                    </svg>
                                    <span className="text-sm">Pass Rate: {results.data.length > 0 ? Math.round((results.data.filter(r => r.score >= 60).length / results.data.length) * 100) : 0}%</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right hidden md:block">
                            <div className="text-2xl font-bold">{results.data.length > 0 ? Math.round(results.data.reduce((sum, r) => sum + r.score, 0) / results.data.length) : 0}%</div>
                            <div className="text-teal-100">Average Score</div>
                        </div>
                    </div>
                </div>
                )}

                {/* Filters and Actions */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border-l-4 border-teal-500 animate-fadeIn">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input type="checkbox" className="h-4 w-4" checked={compactView} onChange={(e)=>setCompactView(e.target.checked)} />
                                Compact view
                                </label>
                            <div className="hidden sm:flex items-center gap-2">
                                <select value={selectedExam} onChange={(e)=>setSelectedExam(e.target.value)} className="border-2 border-gray-300 rounded-lg shadow-sm focus:ring-4 focus:ring-teal-100 focus:border-teal-500 min-w-[150px]">
                                    <option value="">All Exams</option>
                                    {Array.from(new Set(results.data.map(r => r.exam ? r.exam['exam-ref-no'] : null).filter(Boolean))).map(ex => (
                                        <option key={ex} value={ex}>{ex}</option>
                                    ))}
                                </select>
                                <select value={selectedStatus} onChange={(e)=>setSelectedStatus(e.target.value)} className="border-2 border-gray-300 rounded-lg shadow-sm focus:ring-4 focus:ring-teal-100 focus:border-teal-500 min-w-[150px]">
                                    <option value="">All Statuses</option>
                                    {['completed','in_progress','pending'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
    
                            <div className="hidden md:flex items-center gap-2">
                                <select value={selectedYear} onChange={(e)=>{ setSelectedYear(e.target.value); applyServerFilters(e.target.value, includeArchived); }} className="border-2 border-gray-300 rounded-lg shadow-sm focus:ring-4 focus:ring-teal-100 focus:border-teal-500 min-w-[120px]">
                                    <option value="">All Years</option>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input type="checkbox" className="h-4 w-4" checked={includeArchived} onChange={(e)=>{ setIncludeArchived(e.target.checked); applyServerFilters(selectedYear, e.target.checked); }} />
                                    Include archived
                                </label>
                            </div>
                            <button onClick={handleDownloadAllPdf} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">Download All (PDF)</button>
                            <a href="/guidance/exam-results/archived" className="bg-slate-700 text-white px-4 py-2 rounded-md hover:bg-slate-800 text-sm">View Archived</a>
                            <button onClick={handleArchiveAll} className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 text-sm">Archive All</button>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                {!compactView && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-all duration-200 transform hover:scale-105 animate-fadeIn">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-700">Total Results</h3>
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-blue-600">{results.total || 0}</p>
                        <p className="text-sm text-gray-500 mt-1">Examinees tested</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-all duration-200 transform hover:scale-105 animate-fadeIn">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-700">Passed</h3>
                            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-green-600">
                            {results.data.filter(r => (r.score ?? r.percentage ?? 0) >= 10).length}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Score ≥ 10%</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-all duration-200 transform hover:scale-105 animate-fadeIn">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-700">Failed</h3>
                            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-red-600">
                            {results.data.filter(r => r.score < 60).length}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Score {'<'} 60%</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-all duration-200 transform hover:scale-105 animate-fadeIn">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-700">Average Score</h3>
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-purple-600">
                            {results.data.length > 0 ? Math.round(results.data.reduce((sum, r) => sum + r.score, 0) / results.data.length) : 0}%
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Overall performance</p>
                    </div>
                </div>
                )}

                {/* Charts */}
                {!compactView && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <ChartCard title="Pass vs Fail" subtitle={`Filtered (${filteredResults.length})`}>
                        <div style={{ height: 260 }}>
                            <Doughnut data={passFailData} options={{ ...chartOptions, scales: {} }} />
                        </div>
                    </ChartCard>
                    <ChartCard title="Recent Scores" subtitle="Last 20 entries">
                        <div style={{ height: 260 }}>
                            <Line data={lineData} options={chartOptions} />
                        </div>
                    </ChartCard>
                    <ChartCard title="Score Distribution" subtitle="Buckets">
                        <div style={{ height: 260 }}>
                            <Bar data={distributionData} options={chartOptions} />
                        </div>
                    </ChartCard>
                </div>
                )}

                {/* Results Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-fadeIn">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Exam Results</h3>
                                    <p className="text-sm text-gray-600">{compactView ? 'Compact list' : 'Detailed examination performance data'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">Showing {results.data.filter(r=>{
                                    if (selectedExam && r.exam && r.exam['exam-ref-no'] !== selectedExam) return false;
                                    if (selectedStatus && r.status !== selectedStatus) return false;
                                    return true;
                                }).length} of {results.total} results</p>
                                <p className="text-xs text-gray-500">Filtered view</p>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam & Recommendations</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3" />
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {results.data.filter(result => {
                                    if (selectedExam && result.exam && result.exam['exam-ref-no'] !== selectedExam) return false;
                                    if (selectedStatus && result.status !== selectedStatus) return false;
                                    return true;
                                }).map((result) => (
                                    <tr key={result.id} className="hover:bg-gray-50 transition-colors duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                    <span className="text-blue-600 text-xs font-medium">
                                                        {result.examinee?.name ? result.examinee.name.charAt(0).toUpperCase() : 'U'}
                                                    </span>
                                                </div>
                                                {result.examinee ? result.examinee.name : 'Unknown Student'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                                    <span className="text-xs font-bold text-gray-600">#</span>
                                                </div>
                                                {result.exam ? result.exam['exam-ref-no'] : 'N/A'}
                                            </div>
                                            {Array.isArray(result.recommended_courses) && result.recommended_courses.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {result.recommended_courses.map((c) => (
                                                        <span key={c.course_id || c.id} className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            {c.course_code || c.course_name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full gap-1 ${
                                                result.score >= 60 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d={result.score >= 60 ? "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" : "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"} />
                                                </svg>
                                                {result.score}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {result.correct_answers} / {result.total_questions}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {result.semester || '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full gap-1 ${
                                                result.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                                result.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                <div className={`w-2 h-2 rounded-full ${
                                                    result.status === 'completed' ? 'bg-green-500' : 
                                                    result.status === 'in_progress' ? 'bg-yellow-500' : 
                                                    'bg-gray-500'
                                                }`}></div>
                                                {result.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {result.time_taken ? `${Math.floor(result.time_taken / 60)}:${String(result.time_taken % 60).padStart(2, '0')}` : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {new Date(result.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                            <button onClick={() => openDetails(result.resultId || result.id)} className="px-3 py-1 text-sm rounded-md bg-teal-600 text-white hover:bg-teal-700">View</button>
                                            <button onClick={() => handleDownload(result)} className="px-3 py-1 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">Download</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {results.data.length === 0 && (
                        <div className="text-center py-10 text-sm text-gray-500">No exam results found.</div>
                    )}
                </div>
                {/* end Results Table */}

                {/* Details Drawer */}
                {detailOpen && (
                    <div className="fixed inset-0 z-50">
                        <div className="absolute inset-0 bg-clear bg-opacity-20 backdrop-blur-sm flex" onClick={() => setDetailOpen(false)} />
                        <div className="absolute top-0 right-0 h-full w-full sm:w-[520px] bg-white shadow-xl flex flex-col animate-slideInRight border-2 border-black">
                            <div className="px-5 py-4 border-b flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">Exam Details</h3>
                                    {detailData && (
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500">
                                                {detailData.examinee?.name} • {detailData.exam_ref_no} • {new Date(detailData.created_at).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Score: <span className="font-medium">{detailData.score?.toFixed(1)}%</span>
                                                {detailData.time_taken_seconds && (
                                                    <span className="ml-3">
                                                        Time: <span className="font-medium">{Math.floor(detailData.time_taken_seconds / 60)}:{String(detailData.time_taken_seconds % 60).padStart(2, '0')}</span>
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <button className="text-gray-500 hover:text-gray-700" onClick={() => setDetailOpen(false)}>✕</button>
                </div>

                            {/* Recommended Courses Section */}
                            {detailData?.recommended_courses && detailData.recommended_courses.length > 0 && (
                                <div className="px-5 py-3 bg-blue-50 border-b">
                                    <h4 className="text-sm font-medium text-blue-900 mb-2">Recommended Courses</h4>
                                    <div className="space-y-2">
                                        {detailData.recommended_courses.map((course, index) => (
                                            <div key={course.course_id || index} className="text-xs bg-white rounded p-2 border border-blue-200">
                                                <div className="font-medium text-blue-800">{course.course_name}</div>
                                                <div className="text-blue-600 mt-1">{course.course_description}</div>
                                                <div className="text-blue-500 mt-1">
                                                    Score Range: {course.score_range} • Passing Rate: {course.passing_rate}%
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="p-4 border-b flex items-center gap-3">
                                <select value={answerFilter} onChange={(e) => setAnswerFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
                                    <option value="all">All</option>
                                    <option value="correct">Correct</option>
                                    <option value="incorrect">Incorrect</option>
                                </select>
                                <input
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    placeholder="Search question..."
                                    className="flex-1 border rounded px-3 py-1 text-sm"
                                />
                                {detailData && (
                                    <span className="text-xs text-gray-500">Score: {detailData.score}%</span>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {detailLoading && (
                                    <div className="p-6 text-center text-gray-500 text-sm">Loading...</div>
                                )}
                                {detailError && (
                                    <div className="p-6 text-center text-red-600 text-sm">{detailError}</div>
                                )}
                                {detailData && (
                                    <div className="p-4 space-y-3">
                                        {detailData.answers
                                            .filter(a => answerFilter === 'all' ? true : answerFilter === 'correct' ? a.is_correct : !a.is_correct)
                                            .filter(a => a.question.toLowerCase().includes(searchText.toLowerCase()))
                                            .map((a) => (
                                                <div key={a.question_id} className={`border rounded p-3 ${a.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                                    <div className="text-xs text-gray-500 mb-1">Question {a.no}</div>
                                                    <div className="text-sm font-medium text-gray-900 mb-2">{a.question}</div>
                                                    <div className="text-xs text-gray-700">
                                                        <span className="mr-4">Your answer: <b className={a.is_correct ? 'text-green-600' : 'text-red-600'}>{a.student_answer || '—'}</b></span>
                                                        <span>Correct: <b className="text-gray-900">{a.correct_answer}</b></span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

    <style>{`
        @keyframes slideInRight {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideInRight {
            animation: slideInRight 0.3s ease-out;
                }
            `}</style>
        </Layout>
    );
};

export default ExamResults;