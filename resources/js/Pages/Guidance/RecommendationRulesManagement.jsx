import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Layout from '../../Components/Layout';

const RecommendationRulesManagement = ({ user, rules, personalityTypes, courses }) => {
    // Add safety checks for props and ensure all data is sanitized
    const safeRules = (rules?.data || rules || []).map(rule => ({
        ...rule,
        personality_type: typeof rule.personality_type === 'object' ? rule.personality_type.type : String(rule.personality_type || ''),
        min_score: Number(rule.min_score || 0),
        max_score: Number(rule.max_score || 0),
        id: rule.id || 0,
        created_at: rule.created_at || null,
        recommended_course: rule.recommended_course ? {
            ...rule.recommended_course,
            course_code: String(rule.recommended_course.course_code || ''),
            course_name: String(rule.recommended_course.course_name || '')
        } : null
    }));
    const safePersonalityTypes = (personalityTypes || []).map(type => ({
        ...type,
        type: String(type.type || ''),
        title: String(type.title || ''),
        description: String(type.description || '')
    }));
    const safeCourses = (courses || []).map(course => ({
        ...course,
        id: course.id || 0,
        course_code: String(course.course_code || ''),
        course_name: String(course.course_name || '')
    }));
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [expandedPersonalities, setExpandedPersonalities] = useState({});
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [notificationData, setNotificationData] = useState({
        personalityTypes: [],
        courseCount: 0,
        message: ''
    });
    const [formData, setFormData] = useState({
        personality_type: '',
        min_score: 10, // Set default minimum to 10%
        max_score: 100,
        recommended_course_ids: [] // Changed to array for multiple courses
    });

    // Function to show notification modal
    const showNotification = (personalityTypes, courseCount, message) => {
        setNotificationData({
            personalityTypes,
            courseCount,
            message
        });
        setShowNotificationModal(true);
        
        // Auto-close after 30 seconds
        setTimeout(() => {
            setShowNotificationModal(false);
        }, 30000);
    };

    // Smart filtering function: Only show courses in score ranges where student can meet the minimum passing rate
    const isCourseCompatibleWithScoreRange = (coursePassingRate, minScore, maxScore) => {
        // Course can only appear in ranges where the student's minimum score meets or exceeds the course's passing rate
        return minScore >= coursePassingRate;
    };

    // Function to get compatible courses for a specific score range
    const getCompatibleCoursesForScoreRange = (courses, minScore, maxScore) => {
        return courses.filter(course => {
            const passingRate = course.passing_rate || 80;
            return isCourseCompatibleWithScoreRange(passingRate, minScore, maxScore);
        });
    };

    // Function to explain the smart filtering logic
    const getSmartFilteringExplanation = () => {
        return {
            title: "Smart Course-Score Compatibility",
            explanation: "The system automatically filters courses based on logical score requirements:",
            examples: [
                "BSIT (75% passing rate) → Can appear in 75%+ score ranges",
                "BSBA-FM (80% passing rate) → Can appear in 80%+ score ranges", 
                "BSN Nursing (90% passing rate) → Can ONLY appear in 90%+ score ranges"
            ],
            logic: "A course only appears in score ranges where the student's minimum score meets or exceeds the course's minimum passing rate requirement."
        };
    };

    // Detect when new rules are added and show notification modal
    useEffect(() => {
        // Check if we should show notifications for new rules
        const shouldShowNotifications = localStorage.getItem('showNewRuleNotifications') === 'true';
        const lastRuleCount = parseInt(localStorage.getItem('lastRuleCount') || '0');
        
        if (shouldShowNotifications && safeRules.length > lastRuleCount) {
            console.log('Detected new rules added, showing notification modal');
            console.log('Previous rule count:', lastRuleCount, 'Current rule count:', safeRules.length);
            
            // Get the current rule count per personality type
            const ruleCounts = {};
            safeRules.forEach(rule => {
                const personalityType = rule.personality_type;
                ruleCounts[personalityType] = (ruleCounts[personalityType] || 0) + 1;
            });
            
            console.log('Rule counts per personality type:', ruleCounts);
            
            // Find personality types with the most rules (likely the ones that got new content)
            const sortedTypes = Object.entries(ruleCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([type]) => type);
            
            console.log('Top 3 personality types by rule count (likely new):', sortedTypes);
            
            // Show notification modal with the detected personality types
            const newRulesCount = safeRules.length - lastRuleCount;
            showNotification(
                sortedTypes,
                newRulesCount,
                `New recommendation rules have been generated!`
            );
            
            // Clear the flag
            localStorage.removeItem('showNewRuleNotifications');
            localStorage.removeItem('lastRuleCount');
        }
    }, [safeRules, safePersonalityTypes]); // Run when rules or personality types change



    const handleSubmit = (e) => {
        e.preventDefault();
        
        router.post('/guidance/recommendation-rules', formData, {
            onSuccess: (response) => {
                setShowCreateModal(false);
                
                // Show notification modal for the new rule
                showNotification(
                    [formData.personality_type],
                    1,
                    `New recommendation rule created for ${formData.personality_type}!`
                );
                
                setFormData({
                    personality_type: '',
                    min_score: 75,
                    max_score: 100,
                    recommended_course_ids: []
                });
                window.showAlert('Recommendation rule created successfully', 'success');
            },
            onError: (errors) => {
                window.showAlert('Failed to create recommendation rule', 'error');
            }
        });
    };

    const handleEdit = (rule) => {
        setEditingRule(rule);
        setFormData({
            personality_type: rule.personality_type,
            min_score: rule.min_score,
            max_score: rule.max_score,
            recommended_course_ids: rule.recommended_course_id ? [rule.recommended_course_id] : []
        });
    };

    const handleUpdate = (ruleId) => {
        router.put(`/guidance/recommendation-rules/${ruleId}`, formData, {
            onSuccess: () => {
                // Show notification modal for the updated rule
                showNotification(
                    [formData.personality_type],
                    1,
                    `Recommendation rule updated for ${formData.personality_type}!`
                );
                
                closeEditModal();
                window.showAlert('Recommendation rule updated successfully', 'success');
            },
            onError: (errors) => {
                window.showAlert('Failed to update recommendation rule', 'error');
            }
        });
    };

    const handleDelete = (ruleId) => {
        if (confirm('Are you sure you want to delete this recommendation rule?')) {
            router.delete(`/guidance/recommendation-rules/${ruleId}`, {
                onSuccess: () => {
                    window.showAlert('Recommendation rule deleted successfully', 'success');
                },
                onError: (errors) => {
                    window.showAlert('Failed to delete recommendation rule', 'error');
                }
            });
        }
    };

    const togglePersonalityExpansion = (personalityType) => {
        setExpandedPersonalities(prev => ({
            ...prev,
            [personalityType]: !prev[personalityType]
        }));
    };

    const openEditModal = (rule) => {
        setEditingRule(rule);
        setFormData({
            personality_type: rule.personality_type,
            min_score: rule.min_score,
            max_score: rule.max_score,
            recommended_course_ids: rule.recommended_course_id ? [rule.recommended_course_id] : []
        });
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingRule(null);
        setFormData({
            personality_type: '',
            min_score: 10,
            max_score: 100,
            recommended_course_ids: []
        });
    };

    const openCreateModal = () => {
        setFormData({
            personality_type: '',
            min_score: 75,
            max_score: 100,
            recommended_course_ids: []
        });
        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
        setFormData({
            personality_type: '',
            min_score: 75,
            max_score: 100,
            recommended_course_ids: []
        });
    };

    return (
        <Layout user={user}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg p-6 text-white animate-fadeIn">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Recommendation Rules Management</h1>
                            <p className="mt-2 text-violet-100">Configure course recommendations based on personality types and exam scores</p>
                            <div className="mt-4 flex items-center space-x-6">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm">Total: {safeRules.length} rules</span>
                                </div>
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                    <span className="text-sm">Types: {safePersonalityTypes.length} personalities</span>
                                </div>
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.75 2.524z" />
                                    </svg>
                                    <span className="text-sm">Courses: {safeCourses.length} available</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right hidden md:block">
                            <div className="text-2xl font-bold">{Object.keys(safeRules.reduce((acc, rule) => ({ ...acc, [rule.personality_type]: true }), {})).length}</div>
                            <div className="text-violet-100">Active Types</div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mb-6 bg-white p-6 rounded-lg shadow-lg border-l-4 border-violet-500 animate-fadeIn">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Rule Management</h2>
                                <p className="text-sm text-gray-600">Create and manage recommendation rules</p>
                                <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-700">
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span><strong>Smart System:</strong> Courses only appear in score ranges where students can meet the minimum passing rate requirement</span>
                                    </div>
                                </div>
                                {/* <div className="flex items-center mt-2 space-x-3">
                                    <button
                                        onClick={() => {
                                            // Test the notification modal
                                            showNotification(
                                                ['ESFJ', 'ISFJ', 'ISFP'],
                                                15,
                                                'Test notification for new rules!'
                                            );
                                        }}
                                        className="text-xs text-indigo-500 hover:text-indigo-700 underline"
                                    >
                                        Test notification modal
                                    </button>
                                    <button
                                        onClick={() => {
                                            const explanation = getSmartFilteringExplanation();
                                            const message = `${explanation.title}\n\n${explanation.explanation}\n\n${explanation.examples.join('\n')}\n\n${explanation.logic}`;
                                            window.showAlert(message, 'info');
                                        }}
                                        className="text-xs text-emerald-500 hover:text-emerald-700 underline"
                                    >
                                        How smart filtering works
                                    </button>
                                </div> */}
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={openCreateModal}
                                className="px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center gap-2 bg-violet-600 text-white hover:bg-violet-700 shadow-lg"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add New Rule
                            </button>
                            <button
                                onClick={() => {
                                    router.post('/guidance/generate-all-rules', {}, {
                                        onSuccess: (response) => {
                                            console.log('Response received:', response);
                                            console.log('Response props:', response?.props);
                                            console.log('Response flash:', response?.props?.flash);
                                            console.log('Response errors:', response?.props?.errors);
                                            
                                            // Check if there are any flash messages indicating success
                                            if (response?.props?.flash?.success) {
                                                console.log('Success flash message:', response.props.flash.success);
                                                
                                                // Instead of marking all personality types, we'll use a smarter approach
                                                // We'll detect which personality types actually have new content by comparing
                                                // the current rules with what we had before
                                                window.showAlert('New recommendation rules added successfully', 'success');
                                                
                                                // Set a flag to indicate we should show notifications on next page load
                                                localStorage.setItem('showNewRuleNotifications', 'true');
                                                localStorage.setItem('lastRuleCount', safeRules.length.toString());
                                            } else {
                                                console.log('No success flash message, using fallback');
                                                window.showAlert('New recommendation rules added successfully', 'success');
                                            }
                                        },
                                        onError: (errors) => {
                                            window.showAlert('Failed to generate rules', 'error');
                                        }
                                    });
                                }}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Add Missing Rules
                            </button>
                        </div>
                    </div>
                </div>



                {/* Edit Rule Form */}
                {editingRule && (
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-l-4 border-green-500 animate-fadeIn">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Recommendation Rule
                        </h2>
                        <form onSubmit={(e) => { e.preventDefault(); handleUpdate(editingRule.id); }} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Personality Type
                                    </label>
                                    <select
                                        value={formData.personality_type}
                                        onChange={(e) => setFormData({...formData, personality_type: e.target.value})}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Select Personality Type</option>
                                        {safePersonalityTypes.map((type) => (
                                            <option key={type.type} value={type.type}>
                                                {type.type} - {type.title || ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Recommended Courses
                                    </label>
                                    <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                                        {safeCourses.map((course) => (
                                            <label key={course.id} className="flex items-center space-x-3 py-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.recommended_course_ids.includes(course.id.toString())}
                                                    onChange={(e) => {
                                                        const courseId = course.id.toString();
                                                        if (e.target.checked) {
                                                            setFormData({
                                                                ...formData,
                                                                recommended_course_ids: [...formData.recommended_course_ids, courseId]
                                                            });
                                                        } else {
                                                            setFormData({
                                                                ...formData,
                                                                recommended_course_ids: formData.recommended_course_ids.filter(id => id !== courseId)
                                                            });
                                                        }
                                                    }}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <span className="text-sm text-gray-900">
                                                {course.course_code || ''} - {course.course_name || ''}
                                                </span>
                                                <span className="text-xs text-green-600 font-medium">
                                                    ({course.passing_rate || 80}%)
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">Select courses to recommend for this personality type</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Minimum Score (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.min_score}
                                        onChange={(e) => setFormData({...formData, min_score: parseInt(e.target.value)})}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        min="10"
                                        max="100"
                                        required
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Minimum score range: 10% - 100%</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Maximum Score (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.max_score}
                                        onChange={(e) => setFormData({...formData, max_score: parseInt(e.target.value)})}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        min="0"
                                        max="100"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingRule(null);
                                        setFormData({
                                            personality_type: '',
                                            min_score: 10,
                                            max_score: 100,
                                            recommended_course_ids: []
                                        });
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    Update Rule
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Rules List - Grouped by Personality Type */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-fadeIn">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Recommendation Rules by Personality Type</h3>
                                <p className="text-sm text-gray-600 mt-1">Courses are grouped by personality type for easier management</p>
                            </div>
                        </div>
                    </div>
                    
                    {(() => {
                        // Group rules by personality type
                        const groupedRules = {};
                        safeRules.forEach(rule => {
                            const personalityType = typeof rule.personality_type === 'object' ? rule.personality_type.type : String(rule.personality_type || '');
                            if (!groupedRules[personalityType]) {
                                groupedRules[personalityType] = [];
                            }
                            groupedRules[personalityType].push(rule);
                        });

                                                return Object.keys(groupedRules).length > 0 ? (
                            <div className="p-6 space-y-4">
                                {Object.entries(groupedRules).map(([personalityType, rules]) => {
                                    const personalityTypeInfo = safePersonalityTypes.find(t => t.type === personalityType);
                                    const isExpanded = expandedPersonalities[personalityType];
                                    
                                    return (
                                        <div key={personalityType} className="border border-gray-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 animate-fadeIn">
                                            {/* Collapsible Personality Type Header */}
                                            <button
                                                onClick={() => togglePersonalityExpansion(personalityType)}
                                                className="w-full p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-200 flex items-center justify-between border-l-4 border-violet-500"
                                            >
                                                <div className="flex items-center">
                                                    <svg 
                                                        className={`w-5 h-5 text-gray-500 mr-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                    <div>
                                                        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                                                            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 mr-3">
                                                                {personalityType}
                                            </span>
                                                            {personalityTypeInfo?.title || 'Unknown Type'}
                                                        </h4>
                                                        {personalityTypeInfo?.description && (
                                                            <p className="text-sm text-gray-600 mt-1 text-left">
                                                                {personalityTypeInfo.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <div className="text-sm text-gray-500 flex items-center">
                                                        {rules.length} course{rules.length !== 1 ? 's' : ''} recommended
                                                    </div>
                                                    <svg 
                                                        className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </button>

                                            {/* Collapsible Content */}
                                            {isExpanded && (
                                                <div className="p-4 border-t border-gray-200">
                                                    {/* Score Range Groups */}
                                                {(() => {
                                                        const scoreGroups = {};
                                                        rules.forEach(rule => {
                                                            const scoreRange = `${rule.min_score}%-${rule.max_score}%`;
                                                            if (!scoreGroups[scoreRange]) {
                                                                scoreGroups[scoreRange] = [];
                                                            }
                                                            scoreGroups[scoreRange].push(rule);
                                                        });

                                                        return (
                                                            <div className="space-y-4">
                                                                {Object.entries(scoreGroups).map(([scoreRange, scoreRules]) => {
                                                                    // Extract min and max scores from the range string
                                                                    const [minScoreStr, maxScoreStr] = scoreRange.replace('%', '').split('-');
                                                                    const minScore = parseInt(minScoreStr);
                                                                    const maxScore = parseInt(maxScoreStr);
                                                                    
                                                                    // Filter rules to only show courses compatible with this score range
                                                                    const compatibleRules = scoreRules.filter(rule => {
                                                                        if (!rule.recommended_course) return false;
                                                                        const coursePassingRate = rule.recommended_course.passing_rate || 80;
                                                                        return isCourseCompatibleWithScoreRange(coursePassingRate, minScore, maxScore);
                                                                    });

                                                                    // Skip this score range if no compatible courses
                                                                    if (compatibleRules.length === 0) {
                                                                        return null;
                                                                    }

                                                                    return (
                                                                        <div key={scoreRange} className="bg-gray-50 rounded-lg p-4">
                                                                            <div className="flex items-center justify-between mb-3">
                                                                                <h5 className="font-medium text-gray-900">
                                                                                    Score Range: {scoreRange}
                                                                                </h5>
                                                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                                                    {compatibleRules.length} course{compatibleRules.length !== 1 ? 's' : ''}
                                                                                </span>
                                                                            </div>
                                                                            
                                                                            {/* Smart Compatibility Info */}
                                                                            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                                                                                <div className="flex items-center">
                                                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                    </svg>
                                                                                    <span>Only showing courses where student score ({minScore}%+) meets course minimum requirement</span>
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            {/* Courses Grid */}
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                                {compatibleRules.map((rule) => (
                                                                                    <div key={rule.id} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-xl transition-all duration-200 transform hover:scale-105 border-l-4 border-l-violet-400">
                                                                                        
                                                                                        <div className="flex items-start justify-between">
                                                                                            <div className="flex-1">
                                                                                                <div className="font-medium text-gray-900 text-sm">
                                                                                                    {rule.recommended_course?.course_code || 'N/A'}
                                                                                                </div>
                                                                                                <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                                                                    {rule.recommended_course?.course_name || 'N/A'}
                                                                                                </div>
                                                                                                <div className="flex items-center mt-2 space-x-2">
                                                                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                                                                        {rule.recommended_course?.passing_rate || 80}% passing rate
                                                                                                    </span>
                                                                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                                                                        {scoreRange}
                                                                                                    </span>
                                                                                                </div>
                                                                                                
                                                                                                {/* Smart Compatibility Indicator */}
                                                                                                <div className="mt-2">
                                                                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                                                                        ✅ Compatible: Student {minScore}%+ meets {rule.recommended_course?.passing_rate || 80}% requirement
                                                                    </span>
                                                                </div>
                                                                                            </div>
                                                                                            <div className="flex flex-col space-y-1 ml-2">
                                                                                                <button
                                                                                                    onClick={() => openEditModal(rule)}
                                                                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 transition-colors duration-200"
                                                                                                    title="Edit Rule"
                                                                                                >
                                                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                                                    </svg>
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={() => handleDelete(rule.id)}
                                                                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 transition-colors duration-200"
                                                                                                    title="Delete Rule"
                                                                                                >
                                                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                                    </svg>
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        );
                                                    })()}
                        </div>
                    )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                                                    <div className="text-center py-16">
                                <div className="flex justify-center mb-4">
                                    <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendation rules found</h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                    The system will analyze your courses and add missing recommendation rules for new courses without affecting existing ones.
                                </p>
                                <div className="mb-6">
                                    <button
                                        onClick={() => {
                                            router.post('/guidance/generate-all-rules', {}, {
                                                onSuccess: (response) => {
                                                    console.log('Response received (second button):', response);
                                                    console.log('Response props (second button):', response?.props);
                                                    console.log('Response flash (second button):', response?.props?.flash);
                                                    console.log('Response errors (second button):', response?.props?.errors);
                                                    
                                                    // Check if there are any flash messages indicating success
                                                    if (response?.props?.flash?.success) {
                                                        console.log('Success flash message (second button):', response.props.flash.success);
                                                        
                                                        // Instead of marking all personality types, we'll use a smarter approach
                                                        window.showAlert('New recommendation rules added successfully!', 'success');
                                                        
                                                        // Set a flag to indicate we should show notifications on next page load
                                                        localStorage.setItem('showNewRuleNotifications', 'true');
                                                        localStorage.setItem('lastRuleCount', safeRules.length.toString());
                                                    } else {
                                                        console.log('No success flash message (second button), using fallback');
                                                        window.showAlert('New recommendation rules added successfully!', 'success');
                                                    }
                                                },
                                                onError: (errors) => {
                                                    window.showAlert('Failed to generate rules', 'error');
                                                }
                                            });
                                        }}
                                        className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-sm font-medium rounded-lg text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Add Missing Rules
                                    </button>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
                                    <div className="text-xs text-gray-600 space-y-1">
                                        <div className="flex items-center">
                                            <svg className="w-3 h-3 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Analyzes course content and personality compatibility
                                        </div>
                                        <div className="flex items-center">
                                            <svg className="w-3 h-3 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Creates rules for multiple score ranges (75-84%, 85-94%, 95-100%)
                                        </div>
                                        <div className="flex items-center">
                                            <svg className="w-3 h-3 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Only generates rules for compatible personality types
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Edit Rule Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-clear bg-opacity-20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Edit Recommendation Rule</h3>
                                <button
                                    onClick={closeEditModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <form onSubmit={(e) => { e.preventDefault(); handleUpdate(editingRule.id); }} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Personality Type
                                        </label>
                                        <select
                                            value={formData.personality_type}
                                            onChange={(e) => setFormData({...formData, personality_type: e.target.value})}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select Personality Type</option>
                                            {safePersonalityTypes.map((type) => (
                                                <option key={type.type} value={type.type}>
                                                    {type.type} - {type.title || ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Recommended Courses
                                            <span className="text-xs text-gray-500 ml-2">
                                                ({formData.recommended_course_ids.length} selected)
                                            </span>
                                        </label>
                                        <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                                            {safeCourses.length > 0 ? (
                                                <div className="space-y-2">
                                                    {safeCourses.map((course) => (
                                                        <label key={course.id} className="flex items-center space-x-3 py-2 hover:bg-gray-50 rounded px-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.recommended_course_ids.includes(course.id.toString())}
                                                                onChange={(e) => {
                                                                    const courseId = course.id.toString();
                                                                    if (e.target.checked) {
                                                                        setFormData({
                                                                            ...formData,
                                                                            recommended_course_ids: [...formData.recommended_course_ids, courseId]
                                                                        });
                                                                    } else {
                                                                        setFormData({
                                                                            ...formData,
                                                                            recommended_course_ids: formData.recommended_course_ids.filter(id => id !== courseId)
                                                                        });
                                                                    }
                                                                }}
                                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-medium text-gray-900 truncate">
                                                                    {course.course_code || ''} - {course.course_name || ''}
                                                                </div>
                                                                <div className="text-xs text-gray-500 truncate">
                                                                    {course.description || 'No description available'}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                                                    ({course.passing_rate || 80}%)
                                                                </span>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-gray-500">
                                                    <p className="text-sm">No courses available</p>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Select courses that would be suitable for students with this personality type
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Minimum Score (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.min_score}
                                            onChange={(e) => setFormData({...formData, min_score: parseInt(e.target.value)})}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            min="50"
                                            max="100"
                                            required
                                        />
                                        <p className="text-sm text-gray-500 mt-1">Minimum score range: 50% - 100%</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Maximum Score (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.max_score}
                                            onChange={(e) => setFormData({...formData, max_score: parseInt(e.target.value)})}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            min="0"
                                            max="100"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                {/* Summary of what will be updated */}
                                {formData.personality_type && formData.recommended_course_ids.length > 0 && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-start">
                                            <svg className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <div>
                                                <h3 className="text-sm font-medium text-green-800">Update Summary</h3>
                                                <p className="text-sm text-green-700 mt-1">
                                                    This will update the recommendation rule for <strong>{formData.personality_type}</strong> personality type with score range <strong>{formData.min_score}% - {formData.max_score}%</strong>.
                                                </p>
                                                <div className="mt-2 text-xs text-green-600">
                                                    Selected courses: {formData.recommended_course_ids.map(id => {
                                                        const course = safeCourses.find(c => c.id.toString() === id);
                                                        return course ? course.course_code :'';
                                                    }).join(', ')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeEditModal}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!formData.personality_type || formData.recommended_course_ids.length === 0}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        Update Rule
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Rule Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-clear bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-4xl mx-4 border-2 border-black max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <svg className="w-6 h-6 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Recommendation Rule
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
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start">
                                <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h3 className="text-sm font-medium text-blue-800">How it works</h3>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Select a personality type and choose multiple courses that would be suitable for students with that personality. 
                                        The system will create separate rules for each course with the specified score range. Use "Add Missing Rules" to automatically add rules for new courses.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Personality Type
                                        {(() => {
                                            const personalityTypesWithRules = new Set(safeRules.map(rule => rule.personality_type));
                                            const missingPersonalityTypes = safePersonalityTypes.filter(type => !personalityTypesWithRules.has(type.type));
                                            
                                            if (missingPersonalityTypes.length > 0) {
                                                return (
                                                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        {missingPersonalityTypes.length} missing
                                                    </span>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </label>
                                    <select
                                        value={formData.personality_type}
                                        onChange={(e) => setFormData({...formData, personality_type: e.target.value})}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Select Personality Type</option>
                                        {(() => {
                                            // Find personality types that don't have any rules
                                            const personalityTypesWithRules = new Set(safeRules.map(rule => rule.personality_type));
                                            const missingPersonalityTypes = safePersonalityTypes.filter(type => !personalityTypesWithRules.has(type.type));
                                            const personalityTypesWithRulesList = safePersonalityTypes.filter(type => personalityTypesWithRules.has(type.type));
                                            
                                            return (
                                                <>
                                                    {/* Missing personality types at the top */}
                                                    {missingPersonalityTypes.length > 0 && (
                                                        <optgroup label="⚠️ Missing Rules - Add These First">
                                                            {missingPersonalityTypes.map((type) => (
                                                                <option key={type.type} value={type.type} className="text-red-600 font-semibold">
                                                                    🔴 {type.type} - {type.title} (No Rules)
                                                                </option>
                                                            ))}
                                                        </optgroup>
                                                    )}
                                                    
                                                    {/* Personality types that already have rules */}
                                                    {personalityTypesWithRulesList.length > 0 && (
                                                        <optgroup label="✅ Already Have Rules">
                                                            {personalityTypesWithRulesList.map((type) => (
                                                                <option key={type.type} value={type.type}>
                                                                    {type.type} - {type.title}
                                                                </option>
                                                            ))}
                                                        </optgroup>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </select>
                                    {(() => {
                                        const personalityTypesWithRules = new Set(safeRules.map(rule => rule.personality_type));
                                        const missingPersonalityTypes = safePersonalityTypes.filter(type => !personalityTypesWithRules.has(type.type));
                                        
                                        if (missingPersonalityTypes.length > 0) {
                                            return (
                                                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                    <div className="flex items-start">
                                                        <svg className="w-4 h-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                        </svg>
                                                        <div className="text-xs text-amber-700">
                                                            <strong>Tip:</strong> {missingPersonalityTypes.length} personality type{missingPersonalityTypes.length !== 1 ? 's' : ''} don't have any rules yet. 
                                                            Consider adding rules for these types first to ensure all students receive course recommendations.
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Recommended Courses
                                        <span className="text-xs text-gray-500 ml-2">
                                            ({formData.recommended_course_ids.length} selected)
                                        </span>
                                    </label>
                                    <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                                        {safeCourses.length > 0 ? (
                                            <div className="space-y-2">
                                                {safeCourses.map((course) => (
                                                    <label key={course.id} className="flex items-center space-x-3 py-2 hover:bg-gray-50 rounded px-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.recommended_course_ids.includes(course.id.toString())}
                                                            onChange={(e) => {
                                                                const courseId = course.id.toString();
                                                                if (e.target.checked) {
                                                                    setFormData({
                                                                        ...formData,
                                                                        recommended_course_ids: [...formData.recommended_course_ids, courseId]
                                                                    });
                                                                } else {
                                                                    setFormData({
                                                                        ...formData,
                                                                        recommended_course_ids: formData.recommended_course_ids.filter(id => id !== courseId)
                                                                    });
                                                                }
                                                            }}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-gray-900 truncate">
                                                                {course.course_code} - {course.course_name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 truncate">
                                                                {course.description || 'No description available'}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                                                {course.passing_rate || 80}%
                                                            </span>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-gray-500">
                                                <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                                <p className="text-sm">No courses available</p>
                                                <p className="text-xs text-gray-400">Add courses in Course Management first</p>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Select courses that would be suitable for students with this personality type
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Minimum Score (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.min_score}
                                        onChange={(e) => setFormData({...formData, min_score: parseInt(e.target.value)})}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        min="10"
                                        max="100"
                                        required
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Minimum score range: 10% - 100%</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Maximum Score (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.max_score}
                                        onChange={(e) => setFormData({...formData, max_score: parseInt(e.target.value)})}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        min="0"
                                        max="100"
                                        required
                                    />
                                </div>
                            </div>
                            {/* Summary of what will be created */}
                            {formData.personality_type && formData.recommended_course_ids.length > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <svg className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <h3 className="text-sm font-medium text-green-800">Summary</h3>
                                            <p className="text-sm text-green-700 mt-1">
                                                This will create <strong>{formData.recommended_course_ids.length} recommendation rule{formData.recommended_course_ids.length !== 1 ? 's' : ''}</strong> for 
                                                <strong> {formData.personality_type}</strong> personality type with score range <strong>{formData.min_score}% - {formData.max_score}%</strong>.
                                            </p>
                                            <div className="mt-2 text-xs text-green-600">
                                                Selected courses: {formData.recommended_course_ids.map(id => {
                                                    const course = safeCourses.find(c => c.id.toString() === id);
                                                    return course ? course.course_code : 'Unknown';
                                                }).join(', ')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeCreateModal}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!formData.personality_type || formData.recommended_course_ids.length === 0}
                                    className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Add {formData.recommended_course_ids.length > 0 ? `${formData.recommended_course_ids.length} Rule${formData.recommended_course_ids.length !== 1 ? 's' : ''}` : 'Rule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Notification Modal */}
            {showNotificationModal && (
                <div className="fixed top-4 right-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-lg shadow-2xl border-l-4 border-green-500 p-6 max-w-sm w-full">
                        {/* Header with close button */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">New Rules Added!</h3>
                            </div>
                            <button
                                onClick={() => setShowNotificationModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* Content */}
                        <div className="space-y-3">
                            <p className="text-gray-700">{notificationData.message}</p>
                            
                            <div className="bg-green-50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-green-800">Personality Types Updated:</span>
                                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                                        {notificationData.personalityTypes.length}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {notificationData.personalityTypes.map((type, index) => (
                                        <span 
                                            key={index}
                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                        >
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-blue-50 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-blue-800">Total New Rules:</span>
                                    <span className="text-lg font-bold text-blue-600">{notificationData.courseCount}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Auto-close indicator */}
                        <div className="mt-4 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Auto-closes in:</span>
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span>30 seconds</span>
                                </div>
                            </div>
                        </div>
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
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .animate-pulse {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                
                @keyframes bounce {
                    0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
                    50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
                }
                .animate-bounce {
                    animation: bounce 1s infinite;
                }
            `}</style>
        </Layout>
    );
};

export default RecommendationRulesManagement;