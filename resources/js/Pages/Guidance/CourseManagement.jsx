import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Layout from '../../Components/Layout';

const CourseManagement = ({ user, courses }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [isTableMinimized, setIsTableMinimized] = useState(false);
    const [formData, setFormData] = useState({
        course_code: '',
        course_name: '',
        description: '',
        passing_rate: ''
    });
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
    const [showPreferenceSaved, setShowPreferenceSaved] = useState(false);

    // Load table minimization state from localStorage on component mount
    useEffect(() => {
        const savedTableState = localStorage.getItem('courseManagement_tableMinimized');
        if (savedTableState !== null) {
            setIsTableMinimized(JSON.parse(savedTableState));
        }
    }, []);

    // Save table minimization state to localStorage whenever it changes
    const handleTableMinimizationToggle = () => {
        const newState = !isTableMinimized;
        setIsTableMinimized(newState);
        localStorage.setItem('courseManagement_tableMinimized', JSON.stringify(newState));
        
        // Show brief "saved" notification
        setShowPreferenceSaved(true);
        setTimeout(() => setShowPreferenceSaved(false), 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Create the course using Inertia router
            router.post('/guidance/courses', formData, {
                onSuccess: () => {
                    // If course creation is successful and there's a description, store it
                    if (formData.description && formData.description.trim()) {
                        fetch('/guidance/course-descriptions/store', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                            },
                            body: JSON.stringify({
                                course_name: formData.course_name,
                                description: formData.description,
                                is_manual: true
                            })
                        });
                    }

                    setShowCreateModal(false);
                    setFormData({
                        course_code: '',
                        course_name: '',
                        description: '',
                        passing_rate: ''
                    });
                    window.showAlert('Course created successfully', 'success');
                },
                onError: (errors) => {
                    console.error('Error creating course:', errors);
                    window.showAlert('Failed to create course', 'error');
                }
            });
        } catch (error) {
            console.error('Error creating course:', error);
            window.showAlert('Failed to create course', 'error');
        }
    };

    const handleEdit = (course) => {
        setEditingCourse(course);
        setFormData({
            course_code: course.course_code,
            course_name: course.course_name,
            description: course.description || '',
            passing_rate: course.passing_rate || 80
        });
    };

    const handleUpdate = async (courseId) => {
        try {
            // Update the course using Inertia router
            router.put(`/guidance/courses/${courseId}`, formData, {
                onSuccess: () => {
                    // If course update is successful and there's a description, store it
                    if (formData.description && formData.description.trim()) {
                        fetch('/guidance/course-descriptions/store', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                            },
                            body: JSON.stringify({
                                course_name: formData.course_name,
                                description: formData.description,
                                is_manual: true
                            })
                        });
                    }

                    setEditingCourse(null);
                    setFormData({
                        course_code: '',
                        course_name: '',
                        description: '',
                        passing_rate: 80
                    });
                    window.showAlert('Course updated successfully', 'success');
                },
                onError: (errors) => {
                    console.error('Error updating course:', errors);
                    window.showAlert('Failed to update course', 'error');
                }
            });
        } catch (error) {
            console.error('Error updating course:', error);
            window.showAlert('Failed to update course', 'error');
        }
    };

    const handleDelete = (courseId) => {
        if (confirm('Are you sure you want to delete this course?')) {
            router.delete(`/guidance/courses/${courseId}`, {
                onSuccess: () => {
                    window.showAlert('Course deleted successfully', 'success');
                },
                onError: (errors) => {
                    window.showAlert('Failed to delete course', 'error');
                }
            });
        }
    };

    const getPassingRateColor = (rate) => {
        if (rate >= 85) return 'bg-green-100 text-green-800';
        if (rate >= 75) return 'bg-blue-100 text-blue-800';
        if (rate >= 65) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    const openCreateModal = () => {
        setFormData({
            course_code: '',
            course_name: '',
            description: '',
            passing_rate: ''
        });
        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
        setFormData({
            course_code: '',
            course_name: '',
            description: '',
            passing_rate: ''
        });
    };

    const generateDescription = async () => {
        if (!formData.course_name.trim()) {
            window.showAlert('Please enter a course name first', 'error');
            return;
        }

        setIsGeneratingDescription(true);
        try {
            const response = await fetch('/guidance/course-descriptions/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({
                    course_name: formData.course_name
                })
            });

            const data = await response.json();
            
            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    description: data.description
                }));
                
                window.showAlert('New description generated! Click again for more variations.', 'success');
            } else {
                window.showAlert('Failed to generate description', 'error');
            }
        } catch (error) {
            console.error('Error generating description:', error);
            window.showAlert('Error generating description', 'error');
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    return (
        <Layout user={user}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Course Management</h1>
                            <p className="mt-2 text-blue-100">Manage available courses for student recommendations</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold">{courses.length}</div>
                            <div className="text-blue-100">Total Courses</div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-3">
                        <button
                            onClick={openCreateModal}
                            className="px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 bg-blue-600 text-white hover:bg-blue-700 shadow-lg flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add New Course
                        </button>
                        
                        <button
                            onClick={handleTableMinimizationToggle}
                            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 group relative"
                            title="Toggle table view (preference will be saved)"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isTableMinimized ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} />
                            </svg>
                            {isTableMinimized ? 'Expand Table' : 'Minimize Table'}
                            <svg className="w-4 h-4 text-green-500 ml-1 opacity-60" fill="currentColor" viewBox="0 0 24 24" title="Preference saved">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                    </div>
                    
                    {courses.length > 0 && (
                        <div className="text-sm text-gray-600">
                            Showing {courses.length} course{courses.length !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>

                {/* Preference Saved Notification */}
                {showPreferenceSaved && (
                    <div className="mb-4 flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm animate-fadeIn">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Table view preference saved</span>
                    </div>
                )}

                {/* Courses List */}
                {!isTableMinimized && (
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-fadeIn">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Available Courses
                                </h3>
                                <div className="text-sm text-gray-600">
                                    {courses.length} course{courses.length !== 1 ? 's' : ''} available
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passing Rate</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {courses.map((course) => (
                                        <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {course.course_code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {course.course_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 max-w-xs">
                                                <div className="truncate" title={course.description || 'No description'}>
                                                    {course.description || 'No description'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPassingRateColor(course.passing_rate || 80)}`}>
                                                    {course.passing_rate || 80}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(course.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(course)}
                                                        className="text-blue-600 hover:text-blue-900 transition-colors flex items-center gap-1"
                                                        title="Edit course"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(course.id)}
                                                        className="text-red-600 hover:text-red-900 transition-colors flex items-center gap-1"
                                                        title="Delete course"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {courses.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
                                <p className="mt-1 text-sm text-gray-500">Get started by creating a new course.</p>
                                <div className="mt-6">
                                    <button
                                        onClick={openCreateModal}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add Course
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Minimized Table View */}
                {isTableMinimized && courses.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-4 animate-fadeIn">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Course Summary</h3>
                            <button
                                onClick={() => setIsTableMinimized(false)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                Expand to see full details
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {courses.map((course) => (
                                <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {course.course_code}
                                        </span>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPassingRateColor(course.passing_rate || 80)}`}>
                                            {course.passing_rate || 80}%
                                        </span>
                                    </div>
                                    <h4 className="font-medium text-gray-900 mb-1">{course.course_name}</h4>
                                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                                        {course.description || 'No description available'}
                                    </p>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(course)}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course.id)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Create Course Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-clear bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl  mx-4 border-2 border-black">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add New Course
                            </h2>
                            <button
                                onClick={closeCreateModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Course Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.course_code}
                                        onChange={(e) => setFormData({...formData, course_code: e.target.value})}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="e.g., BSIT"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Course Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.course_name}
                                        onChange={(e) => setFormData({...formData, course_name: e.target.value})}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="e.g., Bachelor of Science in Information Technology"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {!formData.course_name.trim() && (
                                            <span className="text-xs text-gray-400 italic">Enter course name to enable AI generation</span>
                                        )}
                                        {formData.course_name.trim() && (
                                            <button
                                                type="button"
                                                onClick={generateDescription}
                                                disabled={isGeneratingDescription}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                title="Generate AI-powered course description"
                                                aria-label="Generate AI description for course"
                                            >
                                                {isGeneratingDescription ? (
                                                    <>
                                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        <span>Generating...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
                                                        </svg>
                                                        <span>AI Generate</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    rows="4"
                                    placeholder="Describe the course content, career opportunities, and key features..."
                                />
                                <div className="flex items-start gap-2 mt-2">
                                    <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
                                    </svg>
                                    <p className="text-xs text-gray-600">
                                        Detailed descriptions help the AI recommendation system provide better matches. Click "AI Generate" to get intelligent suggestions based on the course name.
                                    </p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Passing Rate (%) *
                                </label>
                                <input
                                    type="number"
                                    value={formData.passing_rate}
                                    onChange={(e) => setFormData({...formData, passing_rate: parseInt(e.target.value)})}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    min="10"
                                    max="100"
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-1">Passing rate range: 10% - 100%</p>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeCreateModal}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Add Course
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Course Modal */}
            {editingCourse && (
                <div className="fixed inset-0 bg-clear bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl mx-4 border-2 border-black">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Course: {editingCourse.course_code}
                            </h2>
                            <button
                                onClick={() => {
                                    setEditingCourse(null);
                                    setFormData({
                                        course_code: '',
                                        course_name: '',
                                        description: '',
                                        passing_rate: ''
                                    });
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={(e) => { e.preventDefault(); handleUpdate(editingCourse.id); }} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Course Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.course_code}
                                        onChange={(e) => setFormData({...formData, course_code: e.target.value})}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Course Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.course_name}
                                        onChange={(e) => setFormData({...formData, course_name: e.target.value})}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {!formData.course_name.trim() && (
                                            <span className="text-xs text-gray-400 italic">Enter course name to enable AI generation</span>
                                        )}
                                        {formData.course_name.trim() && (
                                            <button
                                                type="button"
                                                onClick={generateDescription}
                                                disabled={isGeneratingDescription}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                                title="Generate AI-powered course description"
                                                aria-label="Generate AI description for course"
                                            >
                                                {isGeneratingDescription ? (
                                                    <>
                                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        <span>Generating...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
                                                        </svg>
                                                        <span>AI Generate</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 transition-colors"
                                    rows="4"
                                />
                                <div className="flex items-start gap-2 mt-2">
                                    <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
                                    </svg>
                                    <p className="text-xs text-gray-600">
                                        Click "AI Generate" to get intelligent suggestions based on the course name for better recommendations.
                                    </p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Passing Rate (%) *
                                </label>
                                <input
                                    type="number"
                                    value={formData.passing_rate}
                                    onChange={(e) => setFormData({...formData, passing_rate: parseInt(e.target.value)})}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 transition-colors"
                                    min="10"
                                    max="100"
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-1">Passing rate range: 10% - 100%</p>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingCourse(null);
                                        setFormData({
                                            course_code: '',
                                            course_name: '',
                                            description: '',
                                            passing_rate: ''
                                        });
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Update Course
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </Layout>
    );
};

export default CourseManagement; 