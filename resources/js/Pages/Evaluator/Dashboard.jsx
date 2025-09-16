import React from 'react';
import { Head, Link } from '@inertiajs/react';
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

export default function EvaluatorDashboard({ user, evaluator, routes, stats, activities = [], recentResults = [], departmentExams = [] }) {
    // Calculate analytics data
    const averageScore = recentResults?.length > 0 
        ? Math.round(recentResults.reduce((sum, r) => sum + (r.score || 0), 0) / recentResults.length) 
        : 0;
    const passRate = recentResults?.length > 0 
        ? Math.round((recentResults.filter(r => (r.score || 0) >= 10).length / recentResults.length) * 100) 
        : 0;

    const getScoreColor = (score) => {
        if (score >= 85) return 'text-green-600';
        if (score >= 70) return 'text-blue-600';
        if (score >= 10) return 'text-yellow-600';
        return 'text-red-600';
    };

    // Charts datasets
    const passCount = (recentResults || []).filter(r => (r.score || 0) >= 10).length;
    const failCount = Math.max((recentResults || []).length - passCount, 0);

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

    const recentScores = (recentResults || []).slice(0, 10).reverse();
    const lineData = {
        labels: recentScores.map(r => r.student_name || 'Student'),
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

    const activeExams = (departmentExams || []).filter(e => Number(e.status) === 1).length;
    const inactiveExams = Math.max((departmentExams || []).length - activeExams, 0);
    const barData = {
        labels: ['Active', 'Inactive'],
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
        <>
            <Head title="Evaluator Dashboard" />
            
            <Layout user={user} routes={routes}>
                {/* Welcome Section */}
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6 transform transition-all duration-300 hover:shadow-lg">
                    <div className="p-6 bg-gradient-to-r from-green-600 to-teal-600">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                            Welcome back, {evaluator?.name || user.username}!
                        </h2>
                        <p className="text-green-100 text-sm md:text-base">
                            Manage exams, evaluate results, and oversee student assessments.
                        </p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg transform transition-all duration-300 hover:shadow-lg hover:scale-105">
                        <div className="p-4 md:p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Active Exams</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats?.activeExams ?? 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg transform transition-all duration-300 hover:shadow-lg hover:scale-105">
                        <div className="p-4 md:p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Total Students</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats?.totalStudents ?? 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg transform transition-all duration-300 hover:shadow-lg hover:scale-105">
                        <div className="p-4 md:p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Average Score</p>
                                    <p className={`text-2xl font-semibold ${getScoreColor(averageScore)}`}>{averageScore}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg transform transition-all duration-300 hover:shadow-lg hover:scale-105">
                        <div className="p-4 md:p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Pass Rate</p>
                                    <p className="text-2xl font-semibold text-gray-900">{passRate}%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Charts */}
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Analytics Dashboard</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                    <ChartCard title="Pass vs Fail" subtitle="Department exam results">
                        <div style={{ height: 260 }}>
                            <Doughnut data={passFailData} options={{ ...chartOptions, scales: {} }} />
                        </div>
                    </ChartCard>
                    <ChartCard title="Recent Scores" subtitle="Student performance trend">
                        <div style={{ height: 260 }}>
                            <Line data={lineData} options={chartOptions} />
                        </div>
                    </ChartCard>
                    <ChartCard title="Exam Status" subtitle="Active vs Inactive exams">
                        <div style={{ height: 260 }}>
                            <Bar data={barData} options={chartOptions} />
                        </div>
                    </ChartCard>
                </div>

                {/* Department Overview & Recent Activity */}
                <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    <ChartCard
                        title="Department Overview"
                        subtitle="At-a-glance metrics for your department"
                    >
                        {/* Enhanced metrics display */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-3">                            
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Total Students</p>
                                            <p className="text-xs text-gray-500">Recommended to department</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-green-600">{Number(stats?.totalStudents) || 0}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Completed Results</p>
                                            <p className="text-xs text-gray-500">Department exam results</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-purple-600">{Number(stats?.completedResults) || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ChartCard>

                    <ChartCard
                        title="Recent Activity"
                        subtitle={activities?.length ? `${activities.length} items` : 'No recent activity'}
                    >
                        <div className="space-y-3 max-h-40 overflow-auto pr-1">
                            {activities?.length ? (
                                activities.map((a, idx) => (
                                    <div key={idx} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                                        <div className={`w-2 h-2 rounded-full ${a.kind === 'exam_created' ? 'bg-green-500' : 'bg-indigo-500'}`}></div>
                                        <span className="text-sm text-gray-700">{a.label}</span>
                                        <span className="text-xs text-gray-400 ml-auto">{new Date(a.time).toLocaleString()}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-gray-500">Nothing to show yet.</div>
                            )}
                        </div>
                    </ChartCard>
                </div>
            </Layout>
        </>
    );
} 