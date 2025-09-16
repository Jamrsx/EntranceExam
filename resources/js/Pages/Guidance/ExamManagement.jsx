import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import Layout from '../../Components/Layout';

const ExamManagement = ({ user, exams, categories, questions, personalityDichotomies, personalityQuestions }) => {
    // Add safety checks for props
    const safeExams = exams?.data || exams || [];
    const safeCategories = categories || [];
    const safeQuestions = questions || [];
    const safePersonalityDichotomies = personalityDichotomies || [];
    const safePersonalityQuestions = personalityQuestions || [];
    
    // Debug: Log exam data to console
    console.log('ExamManagement - Received data:', {
        exams: safeExams,
        firstExam: safeExams[0],
        firstExamPersonalityQuestions: safeExams[0]?.personalityQuestions,
        firstExamPersonalityCount: safeExams[0]?.personalityQuestions?.length
    });
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [examType, setExamType] = useState('manual');
    const [personalityExamType, setPersonalityExamType] = useState('manual');
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        // Get per_page from URL parameters, default to 20
        const urlParams = new URLSearchParams(window.location.search);
        const perPage = urlParams.get('per_page');
        return perPage ? parseInt(perPage) : 20;
    });
    const [formData, setFormData] = useState({
        time_limit: 60,
        exam_type: 'manual',
        question_ids: [],
        category_counts: {},
        include_personality_test: false,
        personality_exam_type: 'manual',
        personality_question_ids: [],
        personality_category_counts: {}
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const submitData = {
            time_limit: formData.time_limit,
            exam_type: formData.exam_type,
            include_personality_test: formData.include_personality_test
        };

        if (formData.exam_type === 'manual') {
            submitData.question_ids = formData.question_ids;
        } else {
            submitData.category_counts = formData.category_counts;
        }

        if (formData.include_personality_test) {
            submitData.personality_exam_type = formData.personality_exam_type;
            
            if (formData.personality_exam_type === 'manual') {
                submitData.personality_question_ids = formData.personality_question_ids;
            } else {
                submitData.personality_category_counts = formData.personality_category_counts;
            }
        }

        // Debug log
        console.log('Submitting exam data:', submitData);

        router.post('/guidance/exams', submitData, {
            onSuccess: () => {
                setShowCreateForm(false);
                setFormData({
                    time_limit: 60,
                    exam_type: 'manual',
                    question_ids: [],
                    category_counts: {},
                    include_personality_test: false,
                    personality_exam_type: 'manual',
                    personality_question_ids: [],
                    personality_category_counts: {}
                });
                window.showAlert('Exam created successfully', 'success');
            },
            onError: (errors) => {
                window.showAlert('Failed to create exam', 'error');
            }
        });
    };

    const handleQuestionToggle = (questionId) => {
        const newQuestionIds = formData.question_ids.includes(questionId)
            ? formData.question_ids.filter(id => id !== questionId)
            : [...formData.question_ids, questionId];
        
        setFormData({
            ...formData,
            question_ids: newQuestionIds
        });
    };

    const handleCategoryCountChange = (category, count) => {
        setFormData({
            ...formData,
            category_counts: {
                ...formData.category_counts,
                [category]: parseInt(count) || 0
            }
        });
    };

    const handlePersonalityQuestionToggle = (questionId) => {
        const newQuestionIds = formData.personality_question_ids.includes(questionId)
            ? formData.personality_question_ids.filter(id => id !== questionId)
            : [...formData.personality_question_ids, questionId];
        
        setFormData({
            ...formData,
            personality_question_ids: newQuestionIds
        });
    };

    const handlePersonalityCategoryCountChange = (dichotomy, count) => {
        setFormData({
            ...formData,
            personality_category_counts: {
                ...formData.personality_category_counts,
                [dichotomy]: parseInt(count) || 0
            }
        });
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        // Reset to first page when changing items per page
        const url = new URL(window.location);
        url.searchParams.set('per_page', newItemsPerPage);
        url.searchParams.delete('page'); // Reset to first page
        window.location.href = url.toString();
    };

    const questionsByCategory = safeQuestions.reduce((acc, question) => {
        if (!acc[question.category]) {
            acc[question.category] = [];
        }
        acc[question.category].push(question);
        return acc;
    }, {});

    const personalityQuestionsByDichotomy = safePersonalityQuestions.reduce((acc, question) => {
        if (!acc[question.dichotomy]) {
            acc[question.dichotomy] = [];
        }
        acc[question.dichotomy].push(question);
        return acc;
    }, {});

    return (
        <Layout user={user}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg p-6 text-white animate-fadeIn">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Exam Management</h1>
                            <p className="mt-2 text-emerald-100">Create and manage exams with manual question selection or random generation</p>
                            <div className="mt-4 flex items-center space-x-6">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zM7 8a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm">Total: {safeExams.length} exams created</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right hidden md:block">
                            <div className="text-2xl font-bold">{safeExams.filter(exam => exam.status === 'active').length}</div>
                            <div className="text-emerald-100">Active Exams</div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                                showCreateForm 
                                    ? 'bg-gray-600 text-white hover:bg-gray-700' 
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg'
                            }`}
                        >
                            {showCreateForm ? (
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancel
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Create New Exam
                                </span>
                            )}
                        </button>
                    </div>
                    
                    {safeExams.length > 0 && (
                        <div className="text-sm text-gray-600">
                            Managing {safeExams.length} exam{safeExams.length !== 1 ? 's' : ''} • {safeExams.filter(exam => exam.status === 'active').length} active
                        </div>
                    )}
                </div>

                {/* Create Exam Form */}
                {showCreateForm && (
                    <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-emerald-500 mb-6 animate-fadeIn">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            Create New Exam
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Time Limit (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.time_limit}
                                        onChange={(e) => setFormData({...formData, time_limit: parseInt(e.target.value)})}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Personality Test (Step 1 - Optional) */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">Step 1: Personality Test (optional)</h3>
                                <div className="flex items-center mb-4">
                                    <input
                                        type="checkbox"
                                        id="include_personality_test"
                                        checked={formData.include_personality_test}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            include_personality_test: e.target.checked
                                        })}
                                        className="mr-2"
                                    />
                                    <label htmlFor="include_personality_test" className="text-md font-medium text-gray-900">
                                        Include Personality Test
                                    </label>
                                </div>

                                {formData.include_personality_test && (
                                    <div className="space-y-6">
                                        {/* Personality Test Type Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Personality Test Type
                                            </label>
                                            <div className="space-y-2">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        value="manual"
                                                        checked={personalityExamType === 'manual'}
                                                        onChange={(e) => {
                                                            setPersonalityExamType(e.target.value);
                                                            setFormData({...formData, personality_exam_type: e.target.value});
                                                        }}
                                                        className="mr-2"
                                                    />
                                                    Manual Selection - Choose specific personality questions
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        value="random"
                                                        checked={personalityExamType === 'random'}
                                                        onChange={(e) => {
                                                            setPersonalityExamType(e.target.value);
                                                            setFormData({...formData, personality_exam_type: e.target.value});
                                                        }}
                                                        className="mr-2"
                                                    />
                                                    Random Generation - Specify number of questions per dichotomy
                                                </label>
                                            </div>
                                        </div>

                                        {/* Manual Personality Question Selection */}
                                        {personalityExamType === 'manual' && (
                                            <div>
                                                <h3 className="text-md font-medium mb-4">Select Personality Test Questions</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {safePersonalityDichotomies.map((dichotomy) => (
                                                        <div key={dichotomy} className="border rounded-lg p-4 h-full">
                                                            <h4 className="font-medium text-gray-900 mb-3">{dichotomy}</h4>
                                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                                {personalityQuestionsByDichotomy[dichotomy]?.map((question) => (
                                                                    <label key={question.id} className="flex items-start space-x-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={formData.personality_question_ids.includes(question.id)}
                                                                            onChange={() => handlePersonalityQuestionToggle(question.id)}
                                                                            className="mt-1"
                                                                        />
                                                                        <span className="text-sm text-gray-700">
                                                                            {question.question.substring(0, 100)}...
                                                                        </span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-4 text-sm text-gray-600">
                                                    Selected: {formData.personality_question_ids.length} personality questions
                                                </div>
                                            </div>
                                        )}

                                        {/* Random Personality Question Generation */}
                                        {personalityExamType === 'random' && (
                                            <div>
                                                <h3 className="text-md font-medium mb-4">Personality Questions per Dichotomy</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                                                    {safePersonalityDichotomies.map((dichotomy) => (
                                                        <div key={dichotomy} className="border rounded-lg p-4 h-full">
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                {dichotomy}
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={formData.personality_category_counts[dichotomy] || 0}
                                                                onChange={(e) => handlePersonalityCategoryCountChange(dichotomy, e.target.value)}
                                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                                min="0"
                                                                max={personalityQuestionsByDichotomy[dichotomy]?.length || 0}
                                                            />
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Available: {personalityQuestionsByDichotomy[dichotomy]?.length || 0} questions
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-4 text-sm text-gray-600">
                                                    Total personality questions: {Object.values(formData.personality_category_counts).reduce((sum, count) => sum + (count || 0), 0)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Academic Exam (Step 2) */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Step 2: Academic Exam</h3>
                                {/* Exam Type Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Exam Type
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="manual"
                                                checked={examType === 'manual'}
                                                onChange={(e) => {
                                                    setExamType(e.target.value);
                                                    setFormData({...formData, exam_type: e.target.value});
                                                }}
                                                className="mr-2"
                                            />
                                            Manual Selection - Choose specific questions
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="random"
                                                checked={examType === 'random'}
                                                onChange={(e) => {
                                                    setExamType(e.target.value);
                                                    setFormData({...formData, exam_type: e.target.value});
                                                }}
                                                className="mr-2"
                                            />
                                            Random Generation - Specify number of questions per category
                                        </label>
                                    </div>
                                </div>

                                {/* Manual Question Selection */}
                                {examType === 'manual' && (
                                    <div className="mt-6">
                                        <h3 className="text-md font-medium mb-4">Select Questions</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {safeCategories.map((category) => (
                                                <div key={category} className="border rounded-lg p-4 h-full">
                                                    <h4 className="font-medium text-gray-900 mb-3">{category}</h4>
                                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                                        {questionsByCategory[category]?.map((question) => (
                                                            <label key={question.questionId} className="flex items-start space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.question_ids.includes(question.questionId)}
                                                                    onChange={() => handleQuestionToggle(question.questionId)}
                                                                    className="mt-1"
                                                                />
                                                                <span className="text-sm text-gray-700">
                                                                    {question.question.substring(0, 100)}...
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 text-sm text-gray-600">
                                            Selected: {formData.question_ids.length} questions
                                        </div>
                                    </div>
                                )}

                                {/* Random Question Generation */}
                                {examType === 'random' && (
                                    <div className="mt-6">
                                        <h3 className="text-md font-medium mb-4">Questions per Category</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                                            {safeCategories.map((category) => (
                                                <div key={category} className="border rounded-lg p-4 h-full">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        {category}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={formData.category_counts[category] || 0}
                                                        onChange={(e) => handleCategoryCountChange(category, e.target.value)}
                                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                        min="0"
                                                        max={questionsByCategory[category]?.length || 0}
                                                    />
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Available: {questionsByCategory[category]?.length || 0} questions
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 text-sm text-gray-600">
                                            Total questions: {Object.values(formData.category_counts).reduce((sum, count) => sum + (count || 0), 0)}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Personality Test Section */}
                            <div className="border-t pt-6" style={{display:'none'}}>
                                <div className="flex items-center mb-4">
                                    <input
                                        type="checkbox"
                                        id="include_personality_test"
                                        checked={formData.include_personality_test}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            include_personality_test: e.target.checked
                                        })}
                                        className="mr-2"
                                    />
                                    <label htmlFor="include_personality_test" className="text-lg font-medium text-gray-900">
                                        Include Personality Test
                                    </label>
                                </div>

                                {formData.include_personality_test && (
                                    <div className="space-y-6">
                                        {/* Personality Test Type Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Personality Test Type
                                            </label>
                                            <div className="space-y-2">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        value="manual"
                                                        checked={personalityExamType === 'manual'}
                                                        onChange={(e) => {
                                                            setPersonalityExamType(e.target.value);
                                                            setFormData({...formData, personality_exam_type: e.target.value});
                                                        }}
                                                        className="mr-2"
                                                    />
                                                    Manual Selection - Choose specific personality questions
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        value="random"
                                                        checked={personalityExamType === 'random'}
                                                        onChange={(e) => {
                                                            setPersonalityExamType(e.target.value);
                                                            setFormData({...formData, personality_exam_type: e.target.value});
                                                        }}
                                                        className="mr-2"
                                                    />
                                                    Random Generation - Specify number of questions per dichotomy
                                                </label>
                                            </div>
                                        </div>

                                        {/* Manual Personality Question Selection */}
                                        {personalityExamType === 'manual' && (
                                            <div>
                                                <h3 className="text-lg font-medium mb-4">Select Personality Test Questions</h3>
                                                <div className="space-y-4">
                                                    {safePersonalityDichotomies.map((dichotomy) => (
                                                        <div key={dichotomy} className="border rounded-lg p-4">
                                                            <h4 className="font-medium text-gray-900 mb-3">{dichotomy}</h4>
                                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                                {personalityQuestionsByDichotomy[dichotomy]?.map((question) => (
                                                                    <label key={question.id} className="flex items-start space-x-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={formData.personality_question_ids.includes(question.id)}
                                                                            onChange={() => handlePersonalityQuestionToggle(question.id)}
                                                                            className="mt-1"
                                                                        />
                                                                        <span className="text-sm text-gray-700">
                                                                            {question.question.substring(0, 100)}...
                                                                        </span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-4 text-sm text-gray-600">
                                                    Selected: {formData.personality_question_ids.length} personality questions
                                                </div>
                                            </div>
                                        )}

                                        {/* Random Personality Question Generation */}
                                        {personalityExamType === 'random' && (
                                            <div>
                                                <h3 className="text-lg font-medium mb-4">Personality Questions per Dichotomy</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {safePersonalityDichotomies.map((dichotomy) => (
                                                        <div key={dichotomy} className="border rounded-lg p-4">
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                {dichotomy}
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={formData.personality_category_counts[dichotomy] || 0}
                                                                onChange={(e) => handlePersonalityCategoryCountChange(dichotomy, e.target.value)}
                                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                                min="0"
                                                                max={personalityQuestionsByDichotomy[dichotomy]?.length || 0}
                                                            />
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Available: {personalityQuestionsByDichotomy[dichotomy]?.length || 0} questions
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-4 text-sm text-gray-600">
                                                    Total personality questions: {Object.values(formData.personality_category_counts).reduce((sum, count) => sum + (count || 0), 0)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Create Exam
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Items per page selector */}
                <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-teal-500 mb-6 animate-fadeIn">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-700">Display Options</span>
                        </div>
                        <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Items per page:</label>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                                className="border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 px-3 py-1 bg-white text-sm"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                <option value={-1}>All</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Existing Exams */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-fadeIn">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                Existing Exams
                            </h3>
                            <div className="text-sm text-gray-600">
                                {safeExams.length} exam{safeExams.length !== 1 ? 's' : ''} • {safeExams.filter(exam => exam.status === 'active').length} active
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Reference</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Limit</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Results</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {safeExams.map((exam, index) => (
                                    <tr key={exam.examId} className="hover:bg-gray-50 transition-all duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-sm font-bold text-emerald-600">
                                                    {index + 1}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{exam['exam-ref-no']}</div>
                                                    <div className="text-xs text-gray-500">Exam #{exam.examId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <div>
                                                    <span className="text-sm text-gray-900">{exam.questions?.length || 0} questions</span>
                                                    {exam.include_personality_test && (
                                                        <div className="flex items-center mt-1">
                                                            <svg className="w-3 h-3 text-purple-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                            </svg>
                                                            <span className="text-xs text-purple-600 font-medium">{exam.personalityQuestions?.length || 0} personality</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-sm text-gray-900">{exam.time_limit} minutes</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                                                exam.status === 'active' ? 'bg-green-100 text-green-800' : 
                                                exam.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                <div className={`w-2 h-2 rounded-full mr-2 ${
                                                    exam.status === 'active' ? 'bg-green-500' : 
                                                    exam.status === 'inactive' ? 'bg-gray-500' : 
                                                    'bg-blue-500'
                                                }`}></div>
                                                {exam.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                                <span className="text-sm text-gray-900">{exam.results?.length || 0} results</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    router.put(`/guidance/exams/${exam.examId}/toggle-status`, {}, {
                                                        onSuccess: () => {
                                                            window.showAlert('Exam status updated successfully', 'success');
                                                        },
                                                        onError: () => {
                                                            window.showAlert('Failed to update exam status', 'error');
                                                        }
                                                    });
                                                }}
                                                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
                                                    exam.status === 'active' 
                                                        ? 'bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800' 
                                                        : 'bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800'
                                                }`}
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={
                                                        exam.status === 'active' 
                                                            ? "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                            : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    } />
                                                </svg>
                                                {exam.status === 'active' ? 'Set Inactive' : 'Set Active'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {safeExams.length === 0 && (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">No exams created yet</h3>
                            <p className="mt-2 text-sm text-gray-500">Get started by creating your first exam with manual question selection or random generation.</p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Create First Exam
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {(exams?.links || []).length > 0 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            {exams?.prev_page_url && (
                                <a href={exams?.prev_page_url} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                    Previous
                                </a>
                            )}
                            {exams?.next_page_url && (
                                <a href={exams?.next_page_url} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                    Next
                                </a>
                            )}
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{exams?.from || 0}</span> to <span className="font-medium">{exams?.to || 0}</span> of{' '}
                                    <span className="font-medium">{exams?.total || 0}</span> exams
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    {(exams?.links || []).map((link, index) => (
                                        <a
                                            key={index}
                                            href={link.url || '#'}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                link.active
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
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

export default ExamManagement; 