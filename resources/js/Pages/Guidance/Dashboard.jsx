import React from 'react';
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

const GuidanceDashboard = ({ user, guidanceCounselor, stats, recent_exams, recent_results }) => {
    // Calculate analytics data
    console.log('[Dashboard] Props:', { user, stats, recent_exams, recent_results });
    const averageScore = recent_results?.length > 0 
        ? Math.round(recent_results.reduce((sum, r) => sum + (r.score || 0), 0) / recent_results.length) 
        : 0;
    const passRate = recent_results?.length > 0 
        ? Math.round((recent_results.filter(r => (r.score || 0) >= 10).length / recent_results.length) * 100) 
        : 0;

    const getScoreColor = (score) => {
        if (score >= 85) return 'text-green-600';
        if (score >= 70) return 'text-blue-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getPassRateColor = (rate) => {
        if (rate >= 80) return 'text-green-600';
        if (rate >= 60) return 'text-blue-600';
        if (rate >= 40) return 'text-yellow-600';
        return 'text-red-600';
    };

    // Charts datasets
    const passCount = (recent_results || []).filter(r => (r.score || 0) >= 10).length;
    const failCount = Math.max((recent_results || []).length - passCount, 0);

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

    const recentScores = (recent_results || []).slice(0, 10).reverse();
    const lineData = {
        labels: recentScores.map(r => r.examinee?.name || 'Student'),
        datasets: [
            {
                label: 'Score %',
                data: recentScores.map(r => r.score || 0),
                borderColor: '#6366F1',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                fill: true,
                tension: 0.3,
                pointRadius: 3,
            },
        ],
    };

    const activeExams = (recent_exams || []).filter(e => e.status === 'active').length;
    const inactiveExams = Math.max((recent_exams || []).length - activeExams, 0);
    const barData = {
        labels: ['Active', 'Other'],
        datasets: [
            {
                label: 'Exams',
                data: [activeExams, inactiveExams],
                backgroundColor: ['#3B82F6', '#A78BFA'],
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
            y: { beginAtZero: true, ticks: { stepSize: 20 } },
        },
    };

    return (
        <Layout user={user}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 animate-fadeIn">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Guidance Dashboard</h1>
                            <p className="mt-1 text-sm text-gray-500">Overview of current exams and student performance</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            <div className="hidden md:flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2">
                                <span className="text-sm font-semibold text-indigo-700">{stats?.active_exams || 0}</span>
                                <span className="text-xs text-indigo-700">Active exams</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fadeIn">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Questions</h3>
                                <p className="text-3xl font-bold text-gray-900">{stats?.total_questions || 0}</p>
                                <div className="flex items-center mt-1">
                                    <span className="text-xs text-blue-600 font-medium">Available in bank</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fadeIn">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Exams</h3>
                                <p className="text-3xl font-bold text-gray-900">{stats?.active_exams || 0}</p>
                                <div className="flex items-center mt-1">
                                    <span className="text-xs text-green-600 font-medium">Currently running</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fadeIn">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Students</h3>
                                <p className="text-3xl font-bold text-gray-900">{stats?.total_students ?? 0}</p>
                                <div className="flex items-center mt-1">
                                    <span className="text-xs text-purple-600 font-medium">Registered users</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fadeIn">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Average Score</h3>
                                <p className={`text-3xl font-bold ${getScoreColor(averageScore)}`}>{averageScore}%</p>
                                <div className="flex items-center mt-1">
                                    <span className="text-xs text-orange-600 font-medium">Overall performance</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-green-500 animate-fadeIn">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-700">Pass Rate</h3>
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className={`text-4xl font-bold ${getPassRateColor(passRate)} mb-2`}>{passRate}%</div>
                            <p className="text-sm text-gray-500">Students passing exams</p>
                            <div className="mt-3 bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-green-500 h-2 rounded-full transition-all duration-1000" 
                                    style={{ width: `${Math.min(passRate, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-blue-500 animate-fadeIn">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-700">Total Courses</h3>
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600 mb-2">{stats?.total_courses || 0}</div>
                            <p className="text-sm text-gray-500">Available courses</p>
                            <div className="mt-3 flex items-center justify-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-purple-500 animate-fadeIn">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-700">Personality Tests</h3>
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-purple-600 mb-2">{stats?.total_personality_tests || 0}</div>
                            <p className="text-sm text-gray-500">MBTI questions</p>
                            <div className="mt-3 flex items-center justify-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    Ready
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Charts</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                    <ChartCard title="Pass vs Fail" subtitle="Last 10 results">
                        <div style={{ height: 260 }}>
                            <Doughnut data={passFailData} options={{ ...chartOptions, scales: {} }} />
                        </div>
                    </ChartCard>
                    <ChartCard title="Recent Scores" subtitle="Trend">
                        <div style={{ height: 260 }}>
                            <Line data={lineData} options={chartOptions} />
                        </div>
                    </ChartCard>
                    <ChartCard title="Exams Status" subtitle="Recent exams">
                        <div style={{ height: 260 }}>
                            <Bar data={barData} options={chartOptions} />
                        </div>
                    </ChartCard>
                </div>

                {/* Recent Activity */}
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 animate-fadeIn">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <div className="w-7 h-7 bg-green-50 rounded-lg border border-green-100 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                Recent Exams
                            </h3>
                          
                        </div>
                        <div className="space-y-2">
                            {(recent_exams || []).slice(0, 5).map((exam, index) => (
                                <div key={exam.examId} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center text-green-700 text-xs font-semibold">
                                                {index + 1}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{exam['exam-ref-no']}</p>
                                            <p className="text-xs text-gray-500">{exam.status}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${exam.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{exam.status}</span>
                                </div>
                            ))}
                            {(!recent_exams || recent_exams.length === 0) && (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <p className="text-sm text-gray-500 mt-2">No exams created yet</p>
                                    <p className="text-xs text-gray-400">Create your first exam to get started</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200 animate-fadeIn">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <div className="w-7 h-7 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                Recent Results
                            </h3>
                           
                        </div>
                        <div className="space-y-2">
                            {(recent_results || []).slice(0, 5).map((result, index) => (
                                <div key={result.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${result.score >= 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{index + 1}</div>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{result.examinee?.name || 'Unknown Student'}</p>
                                            <p className="text-xs text-gray-500">{result.exam?.['exam-ref-no'] || 'Unknown Exam'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-semibold ${getScoreColor(result.score)}`}>{result.score}%</p>
                                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${result.score >= 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{result.score >= 10 ? 'Passed' : 'Failed'}</span>
                                    </div>
                                </div>
                            ))}
                            {(!recent_results || recent_results.length === 0) && (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <p className="text-sm text-gray-500 mt-2">No results available yet</p>
                                    <p className="text-xs text-gray-400">Results will appear here once students take exams</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </Layout>
    );
};

export default GuidanceDashboard;