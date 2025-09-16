import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';

const Sidebar = ({ user }) => {
    const { url } = usePage();
    const [isCollapsed, setIsCollapsed] = useState(() => {
        // Initialize from localStorage, default to false if not set
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved ? JSON.parse(saved) : false;
    });

    // Save to localStorage whenever isCollapsed changes
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    const evaluatorMenuItems = [
        { name: 'Dashboard', href: '/evaluator/dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
        { name: 'Exams', href: '/evaluator/exams', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { name: 'Results', href: '/evaluator/results', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { name: 'Students', href: '/evaluator/students', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
        { name: 'Profile', href: '/evaluator/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    ];

    const evaluatorMenuGroups = [
        {
            title: 'Overview',
            items: [
                { name: 'Dashboard', href: '/evaluator/dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' }
            ]
        },
        {
            title: 'Exam Management',
            items: [
                { name: 'Department Exams', href: '/evaluator/department-exams', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                { name: 'Question Bank', href: '/evaluator/question-bank', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
            ]
        },
        {
            title: 'Results & Analysis',
            items: [
                { name: 'Department Exam Results', href: '/evaluator/exam-results', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                { name: 'Academic Exam Results', href: '/evaluator/student-results', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
            ]
        },
        // {
        //     title: 'Account',
        //     items: [
        //         { name: 'Profile', href: '/evaluator/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
        //     ]
        // }
    ];

    // Reorganized guidance menu items with logical groups
    const guidanceMenuGroups = [
        {
            title: 'Overview',
            items: [
                { name: 'Dashboard', href: '/guidance/dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' }
            ]
        },
        {
            title: 'Content Management',
            items: [
                { name: 'Question Bank', href: '/guidance/question-bank', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                { name: 'Courses', href: '/guidance/course-management', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
                { name: 'Personality Tests', href: '/guidance/personality-test-management', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
            ]
        },
        {
            title: 'Exam Management',
            items: [
                { name: 'Exam Management', href: '/guidance/exam-management', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                { name: 'Exam Registration', href: '/guidance/exam-registration-management', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                { name: 'Exam Results', href: '/guidance/exam-results', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
            ]
        },
        {
            title: 'AI & Intelligence',
            items: [
                { name: 'Recommendation Rules', href: '/guidance/recommendation-rules-management', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                // Item removed: Student Recommendations page deprecated
            ]
        },
        {
            title: 'Administration',
            items: [
                { name: 'Evaluator Management', href: '/guidance/evaluator-management', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' }
            ]
        }
    ];

    const menuItems = user?.role === 'evaluator' ? evaluatorMenuGroups : null;

    return (
        <div className={`bg-gradient-to-b from-blue-800 to-blue-900 text-white transition-all duration-300 ease-in-out ${isCollapsed ? 'w-22' : 'w-64'} h-full flex flex-col`}>
            <div className="p-4 flex-1 overflow-y-auto">
                {/* Header with collapse button */}
                <div className="flex items-center justify-between mb-8" >
                    {!isCollapsed && (
                        <div className="text-lg font-semibold text-white">
                            {user?.role === 'evaluator' ? 'Evaluator Panel' : 'Guidance Panel'}
                        </div>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none"
                        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                    >
                        <svg
                            className="h-5 w-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {isCollapsed ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                    {user?.role === 'evaluator' ? (
                        // Evaluator menu (grouped)
                        menuItems.map((group, groupIndex) => (
                            <div key={group.title} className="space-y-2">
                                {/* Group Header */}
                                {!isCollapsed && (
                                    <div className="px-4 py-2">
                                        <h3 className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                                            {group.title}
                                        </h3>
                                    </div>
                                )}
                                
                                {/* Group Items */}
                                {group.items.map((item) => {
                                    const isActive = url.startsWith(item.href);
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                                                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                                                }`}
                                            title={isCollapsed ? item.name : ''}
                                        >
                                            <svg
                                                className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d={item.icon}
                                                />
                                            </svg>
                                            {!isCollapsed && (
                                                <span className="truncate">{item.name}</span>
                                            )}
                                        </Link>
                                    );
                                })}
                                
                                {/* Separator between groups (except for last group) */}
                                {groupIndex < menuItems.length - 1 && !isCollapsed && (
                                    <div className="border-t border-blue-700 my-2"></div>
                                )}
                            </div>
                        ))
                    ) : (
                        // Guidance menu (grouped)
                        guidanceMenuGroups.map((group, groupIndex) => (
                            <div key={group.title} className="space-y-2">
                                {/* Group Header */}
                                {!isCollapsed && (
                                    <div className="px-4 py-2">
                                        <h3 className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                                            {group.title}
                                        </h3>
                                    </div>
                                )}
                                
                                {/* Group Items */}
                                {group.items.map((item) => {
                                    const isActive = url.startsWith(item.href);
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                                                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                                                }`}
                                            title={isCollapsed ? item.name : ''}
                                        >
                                            <svg
                                                className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d={item.icon}
                                                />
                                            </svg>
                                            {!isCollapsed && (
                                                <span className="truncate">{item.name}</span>
                                            )}
                                        </Link>
                                    );
                                })}
                                
                                {/* Separator between groups (except for last group) */}
                                {groupIndex < guidanceMenuGroups.length - 1 && !isCollapsed && (
                                    <div className="border-t border-blue-700 my-2"></div>
                                )}
                            </div>
                        ))
                    )}
                </nav>
            </div>
        </div>
    );
};

export default Sidebar; 