import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '../../Components/Layout';

export default function StudentResults({ user, evaluator, recommendations, stats, personalityDistribution, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.student_name || '');
    const [courseFilter, setCourseFilter] = useState(filters?.course || '');
    const [personalityFilter, setPersonalityFilter] = useState(filters?.personality_type || '');

    // Add safety checks for null/undefined data
    const safeRecommendations = recommendations || { data: [], links: [] };
    const safeStats = stats || {};
    const safePersonalityDistribution = personalityDistribution || [];

    const handleSearch = () => {
        router.get('/evaluator/student-results', {
            student_name: searchTerm,
            course: courseFilter,
            personality_type: personalityFilter
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleExport = () => {
        const params = new URLSearchParams({
            student_name: searchTerm,
            course: courseFilter,
            personality_type: personalityFilter
        });
        window.open(`/evaluator/student-results/export?${params.toString()}`, '_blank');
    };

    const handleVerify = async (id) => {
        try {
            const response = await fetch(`/evaluator/student-results/${id}/verify`);
            const result = await response.json();
            alert(`Verification Result:\nStudent: ${result.student_name}\nCourse: ${result.recommended_course}\nAcademic Passed: ${result.academic_passed ? 'Yes' : 'No'}\nPersonality Suitable: ${result.personality_suitable ? 'Yes' : 'No'}\nOverall Eligible: ${result.overall_eligible ? 'Yes' : 'No'}`);
        } catch (error) {
            console.error('Error verifying student:', error);
            alert('Error verifying student eligibility');
        }
    };

    return (
        <>
                         <Head title={`${evaluator?.Department || 'Department'} - Passed Students`} />
            
            <Layout user={user} routes={[]}>
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                 {evaluator?.Department || 'Department'} - Passed Students
                            </h2>
                            <p className="text-indigo-100 text-sm md:text-base">
                                 View students who passed the academic exam and were recommended for {evaluator?.Department || 'your department'}.
                            </p>
                        </div>
                    </div>

                                         {/* Statistics Cards */}
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                         <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                             <div className="p-6">
                                 <div className="flex items-center">
                                     <div className="flex-shrink-0">
                                         <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                             </svg>
                                         </div>
                                     </div>
                                     <div className="ml-4">
                                         <p className="text-sm font-medium text-gray-500">Total Passed Students</p>
                                         <p className="text-2xl font-semibold text-gray-900">{safeStats.total_recommendations || 0}</p>
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
                                         <p className="text-sm font-medium text-gray-500">{evaluator?.Department || 'Department'} Students</p>
                                         <p className="text-2xl font-semibold text-gray-900">{safeStats.department_recommendations || 0}</p>
                                     </div>
                                 </div>
                             </div>
                         </div>

                         <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                             <div className="p-6">
                                 <div className="flex items-center">
                                     <div className="flex-shrink-0">
                                         <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                                             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                             </svg>
                                         </div>
                                     </div>
                                     <div className="ml-4">
                                         <p className="text-sm font-medium text-gray-500">Average Score</p>
                                         <p className="text-2xl font-semibold text-gray-900">{safeStats.average_academic_score || 0}</p>
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Search by student name..."
                                    />
                                </div>
                                                                 <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-2">Course (within {evaluator?.Department || 'Department'})</label>
                                     <input
                                         type="text"
                                         value={courseFilter}
                                         onChange={(e) => setCourseFilter(e.target.value)}
                                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                         placeholder={`Filter by ${evaluator?.Department || 'department'} course...`}
                                     />
                                 </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Personality Type</label>
                                    <input
                                        type="text"
                                        value={personalityFilter}
                                        onChange={(e) => setPersonalityFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Filter by personality type..."
                                    />
                                </div>
                                <div className="flex items-end space-x-2">
                                    <button
                                        onClick={handleSearch}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        Search
                                    </button>
                                    <button
                                        onClick={handleExport}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        Export
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                                                         <h3 className="text-lg font-medium text-gray-900 mb-4">Passed Students for {evaluator?.Department || 'Department'}</h3>
                            {safeRecommendations.data && safeRecommendations.data.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Ref</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Recommended</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {safeRecommendations.data.map((r) => (
                                                <tr key={r.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.exam_ref_no}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.recommended_course}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.score}%</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.correct}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.semester || '—'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.time}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.date}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                                                 <div className="text-center py-8">
                                     <p className="text-gray-500">No passed students found for {evaluator?.Department || 'your department'}.</p>
                                 </div>
                            )}

                            {/* Pagination */}
                            {safeRecommendations.links && (
                                <div className="mt-6 flex items-center justify-between">
                                                                         <div className="text-sm text-gray-700">
                                         Showing {safeRecommendations.from || 0} to {safeRecommendations.to || 0} of {safeRecommendations.total || 0} results
                                     </div>
                                    <div className="flex space-x-2">
                                        {safeRecommendations.links.map((link, index) => (
                                            link.url ? (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    className={`px-3 py-2 text-sm rounded-md ${
                                                        link.active
                                                            ? 'bg-indigo-600 text-white'
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
        </>
    );
}
