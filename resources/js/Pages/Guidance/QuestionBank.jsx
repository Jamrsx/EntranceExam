import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import Layout from '../../Components/Layout';

const QuestionBank = ({ user, questions, categories, categoryCounts, currentFilters }) => {
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showImagePreviewModal, setShowImagePreviewModal] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(currentFilters?.category || '');
    const [sortOrder, setSortOrder] = useState(currentFilters?.sort || 'latest');
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(currentFilters?.per_page || 20);
    const [isTableMinimized, setIsTableMinimized] = useState(() => {
        // Get saved state from localStorage
        const saved = localStorage.getItem('questionBankTableMinimized');
        return saved ? JSON.parse(saved) : false;
    });

    // Helper function to render formatted text
    const renderFormattedText = (text, formattedText) => {
        console.log('renderFormattedText called:', { text, formattedText });
        
        // Prioritize formatted text if it exists and contains HTML formatting
        if (formattedText && formattedText.trim() !== '' && formattedText.includes('<')) {
            console.log('Using formatted text with HTML:', formattedText);
            return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
        }
        // Fallback to raw text if no formatted text or no HTML formatting
        if (text && text.trim() !== '') {
            console.log('Using raw text:', text);
            return <div>{text}</div>;
        }
        console.log('Using fallback:', formattedText || text || '');
        return <div>{formattedText || text || ''}</div>;
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('csv_file', file);

        router.post('/guidance/questions/upload', formData, {
            onSuccess: () => {
                setShowUploadModal(false);
                window.showAlert('Questions uploaded successfully', 'success');
            },
            onError: (errors) => {
                window.showAlert('Failed to upload questions', 'error');
            }
        });
    };

    const handleEdit = (question) => {
        setEditingQuestion(question);
    };

    const handleImagePreview = (imageSrc, title = 'Image Preview') => {
        setPreviewImage({ src: imageSrc, title });
        setShowImagePreviewModal(true);
    };

    const handleUpdate = (questionId) => {
        const formData = {
            question: editingQuestion.question,
            option1: editingQuestion.option1,
            option1_image: editingQuestion.option1_image,
            option2: editingQuestion.option2,
            option2_image: editingQuestion.option2_image,
            option3: editingQuestion.option3,
            option3_image: editingQuestion.option3_image,
            option4: editingQuestion.option4,
            option4_image: editingQuestion.option4_image,
            option5: editingQuestion.option5,
            option5_image: editingQuestion.option5_image,
            correct_answer: editingQuestion.correct_answer,
            category: editingQuestion.category,
            direction: editingQuestion.direction,
            image: editingQuestion.image
        };

        router.put(`/guidance/questions/${questionId}`, formData, {
            onSuccess: () => {
                setEditingQuestion(null);
                window.showAlert('Question updated successfully', 'success');
                // Force page refresh to show updated data
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            },
            onError: (errors) => {
                window.showAlert('Failed to update question', 'error');
            }
        });
    };



    const handleArchive = (questionId) => {
        if (confirm('Are you sure you want to archive this question?')) {
            router.put(`/guidance/questions/${questionId}/archive`, {}, {
                onSuccess: () => {
                    window.showAlert('Question archived successfully', 'success');
                },
                onError: (errors) => {
                    window.showAlert('Failed to archive question', 'error');
                }
            });
        }
    };

    const handleBulkArchive = () => {
        if (selectedQuestions.length === 0) {
            window.showAlert('Please select questions to archive', 'warning');
            return;
        }

        if (confirm(`Are you sure you want to archive ${selectedQuestions.length} questions?`)) {
            router.post('/guidance/questions/bulk-archive', { questionIds: selectedQuestions }, {
                onSuccess: () => {
                    setSelectedQuestions([]);
                    setSelectAll(false);
                    window.showAlert(`${selectedQuestions.length} questions archived successfully`, 'success');
                },
                onError: (errors) => {
                    window.showAlert('Failed to archive questions', 'error');
                }
            });
        }
    };

    const handleSelectQuestion = (questionId) => {
        setSelectedQuestions(prev =>
            prev.includes(questionId)
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        );
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedQuestions([]);
        } else {
            setSelectedQuestions(questions.data.map(q => q.questionId));
        }
        setSelectAll(!selectAll);
    };



    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        updateURL({ category, page: 1 });
    };

    const handleSortChange = (order) => {
        setSortOrder(order);
        updateURL({ sort: order, page: 1 });
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        updateURL({ per_page: newItemsPerPage, page: 1 });
    };

    const updateURL = (params) => {
        const url = new URL(window.location);
        
        // Update or remove parameters
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                url.searchParams.set(key, value);
            } else {
                url.searchParams.delete(key);
            }
        });
        
        // Navigate to new URL
        window.location.href = url.toString();
    };

    const clearFilters = () => {
        setSelectedCategory('');
        setSortOrder('latest');
        setItemsPerPage(20);
        updateURL({ category: null, sort: 'latest', per_page: 20, page: 1 });
    };

    const hasActiveFilters = selectedCategory || sortOrder !== 'latest' || itemsPerPage !== 20;

    // Get category counts for dynamic items per page
    const getCategoryCount = (category) => {
        if (!category) return questions.total;
        return categoryCounts[category] || 0;
    };

    const currentCategoryCount = getCategoryCount(selectedCategory);

    // Save table minimized state to localStorage
    const toggleTableMinimized = () => {
        const newState = !isTableMinimized;
        setIsTableMinimized(newState);
        localStorage.setItem('questionBankTableMinimized', JSON.stringify(newState));
    };
    
    // Dynamic items per page options based on category count
    const getDynamicItemsPerPageOptions = () => {
        const count = currentCategoryCount;
        const options = [10, 20, 30, 50, 100];
        
        // Add options that make sense for the current count
        const relevantOptions = options.filter(option => option <= count || option === 100);
        
        // Always include "All" option
        relevantOptions.push(-1);
        
        return relevantOptions;
    };

    return (
        <Layout user={user}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-4 text-white animate-fadeIn">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Question Bank</h1>
                            <p className="mt-1 text-blue-100">Manage exam questions and categories</p>
                            <div className="mt-3 flex items-center space-x-4">
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm">{questions.total || 0} questions</span>
                                </div>
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M19 11H5m14-4H3m16 8H9m-2 2l3-3-3-3" />
                                    </svg>
                                    <span className="text-sm">{categories.length} categories</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                            <a
                                href="/guidance/questions/builder"
                                className="bg-white bg-opacity-20 backdrop-blur-sm text-black px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all duration-200 font-medium flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Make Exam Question
                            </a>
                            <a
                                href="/guidance/archived-questions"
                                className="bg-white bg-opacity-20 backdrop-blur-sm text-black px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all duration-200 font-medium flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6m-6 0l6-6m2-3h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z" />
                                </svg>
                                Archived
                            </a>
                        </div>
                    </div>
                </div>



                {/* Templates & Upload Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6 shadow-lg animate-fadeIn">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-blue-800">Templates & Upload</h2>
                                <p className="text-sm text-blue-600">Download templates and import questions</p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <div className="relative">
                                <button
                                    onClick={() => setShowDownloadModal(!showDownloadModal)}
                                    className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium flex items-center gap-2 text-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download
                                    <svg className={`w-4 h-4 transition-transform ${showDownloadModal ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {/* Download Dropdown */}
                                {showDownloadModal && (
                                    <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-black p-3 w-64 z-50 backdrop-blur-sm">
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => {
                                                    window.open('/guidance/questions/template', '_blank');
                                                    setShowDownloadModal(false);
                                                }}
                                                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                                            >
                                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Excel Template</p>
                                                    <p className="text-sm text-gray-500">Download .xlsx format</p>
                                                </div>
                                            </button>
                                            
                                            <button
                                                onClick={() => {
                                                    window.open('/sample_questions_template.csv', '_blank');
                                                    setShowDownloadModal(false);
                                                }}
                                                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                                            >
                                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">CSV Template</p>
                                                    <p className="text-sm text-gray-500">Download .csv format</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="relative">
                                <button
                                    onClick={() => setShowUploadModal(!showUploadModal)}
                                    className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-all duration-200 font-medium flex items-center gap-2 text-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    Upload
                                    <svg className={`w-4 h-4 transition-transform ${showUploadModal ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {/* Upload Dropdown */}
                                {showUploadModal && (
                                    <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-black p-3 w-64 z-50 backdrop-blur-sm">
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Supported: CSV, Excel (.xlsx, .xls)
                                            </label>
                                            <p className="text-xs text-gray-500 mb-3">
                                                CSV: question,option1,option2,option3,option4,correct_answer,category,image
                                            </p>
                                            <input
                                                type="file"
                                                accept=".csv,.xlsx,.xls"
                                                onChange={handleFileUpload}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Combined Filters & Questions Container */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-full animate-fadeIn">
                    {/* Header with Filters and Minimize Toggle */}
                    <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.5a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Filters & Questions</h2>
                                    <p className="text-sm text-gray-600">Find and manage questions</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleTableMinimized}
                                className="flex items-center gap-2 px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors duration-200 text-sm"
                            >
                                {isTableMinimized ? (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                        Show Table
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                        </svg>
                                        Hide Table
                                    </>
                                )}
                            </button>
                        </div>
                        
                        {/* Filters Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            {/* Category Filter */}
                            <div className="flex flex-col space-y-1">
                                <label className="text-xs font-medium text-gray-700">Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    className="border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 text-sm"
                                >
                                    <option value="">All ({questions.total})</option>
                                    {categories.map((category) => {
                                        const categoryCount = categoryCounts[category] || 0;
                                        return (
                                            <option key={category} value={category}>
                                                {category} ({categoryCount})
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {/* Sort Order */}
                            <div className="flex flex-col space-y-1">
                                <label className="text-xs font-medium text-gray-700">Sort</label>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 text-sm"
                                >
                                    <option value="latest">Latest</option>
                                    <option value="oldest">Oldest</option>
                                </select>
                            </div>

                            {/* Items per page */}
                            <div className="flex flex-col space-y-1">
                                <label className="text-xs font-medium text-gray-700">Per Page</label>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                                    className="border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 text-sm"
                                >
                                    {getDynamicItemsPerPageOptions().map((option) => (
                                        <option key={option} value={option}>
                                            {option === -1 ? 'All' : option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        {/* Results Summary */}
                        <div className="pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-700">
                                        {questions.data.length} of {currentCategoryCount} questions
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-100 hover:bg-indigo-200 px-2 py-1 rounded transition-colors duration-200"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Questions Table - Conditionally Rendered */}
                    {!isTableMinimized && (
                        <>
                            {/* Table Header */}
                            <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">Questions</h3>
                                            <p className="text-sm text-gray-600">Manage exam questions</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 relative">
                                        <input
                                            type="checkbox"
                                            checked={selectAll}
                                            onChange={handleSelectAll}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-blue-800">Select All</span>
                                        
                                        {/* Bulk Operations Modal */}
                                        {selectedQuestions.length > 0 && (
                                            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-64 animate-fadeIn">
                                                <div className="p-3 border-b border-gray-100">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {selectedQuestions.length} selected
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-3 space-y-2">
                                                    <button
                                                        onClick={handleBulkArchive}
                                                        className="w-full bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6m-6 0l6-6m2-3h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z" />
                                                        </svg>
                                                        Archive Selected
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedQuestions([])}
                                                        className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                                                    >
                                                        Clear Selection
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto max-w-full">
                        <table className="w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                                        <input
                                            type="checkbox"
                                            checked={selectAll}
                                            onChange={handleSelectAll}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Question
                                        </div>
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Image
                                        </div>
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                            </svg>
                                            Options
                                        </div>
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Answer
                                        </div>
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            Category
                                        </div>
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Direction
                                        </div>
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                            </svg>
                                            Actions
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {questions.data.map((question) => (
                                    <tr key={question.questionId} className="hover:bg-gray-50 transition-colors duration-200">
                                        <td className="px-3 py-4 whitespace-nowrap w-8">
                                            <input
                                                type="checkbox"
                                                checked={selectedQuestions.includes(question.questionId)}
                                                onChange={() => handleSelectQuestion(question.questionId)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-3 py-4 whitespace-normal text-xs sm:text-sm text-gray-900 w-1/3">
                                            {renderFormattedText(question.question, question.question_formatted)}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 w-24">
                                            <div>
                                                {question.image ? (
                                                    <img 
                                                        src={question.image.startsWith('data:') ? question.image : `data:image/jpeg;base64,${question.image}`} 
                                                        alt="Question" 
                                                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                                        onClick={() => {
                                                            const imageSrc = question.image.startsWith('data:') ? question.image : `data:image/jpeg;base64,${question.image}`;
                                                            handleImagePreview(imageSrc, 'Question Image');
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="text-center">
                                                        <span className="text-gray-400 text-xs">No image</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 whitespace-normal text-xs sm:text-sm text-gray-500 w-2/5">
                                            <div className="space-y-2">
                                                <div className="flex items-start space-x-2">
                                                    <span className="font-medium text-gray-700">A.</span>
                                                    <div className="flex-1">
                                                        <div className="text-sm">{renderFormattedText(question.option1, question.option1_formatted)}</div>
                                                        {question.option1_image && (
                                                            <img 
                                                                src={question.option1_image.startsWith('data:') ? question.option1_image : `data:image/jpeg;base64,${question.option1_image}`} 
                                                                alt="Option A" 
                                                                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded mt-1 cursor-pointer hover:opacity-80 transition-opacity"
                                                                onClick={() => {
                                                                    const imageSrc = question.option1_image.startsWith('data:') ? question.option1_image : `data:image/jpeg;base64,${question.option1_image}`;
                                                                    handleImagePreview(imageSrc, 'Option A Image');
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-start space-x-2">
                                                    <span className="font-medium text-gray-700">B.</span>
                                                    <div className="flex-1">
                                                        <div className="text-sm">{renderFormattedText(question.option2, question.option2_formatted)}</div>
                                                        {question.option2_image && (
                                                            <img 
                                                                src={question.option2_image.startsWith('data:') ? question.option2_image : `data:image/jpeg;base64,${question.option2_image}`} 
                                                                alt="Option B" 
                                                                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded mt-1 cursor-pointer hover:opacity-80 transition-opacity"
                                                                onClick={() => {
                                                                    const imageSrc = question.option2_image.startsWith('data:') ? question.option2_image : `data:image/jpeg;base64,${question.option2_image}`;
                                                                    handleImagePreview(imageSrc, 'Option B Image');
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-start space-x-2">
                                                    <span className="font-medium text-gray-700">C.</span>
                                                    <div className="flex-1">
                                                        <div className="text-sm">{renderFormattedText(question.option3, question.option3_formatted)}</div>
                                                        {question.option3_image && (
                                                            <img 
                                                                src={question.option3_image.startsWith('data:') ? question.option3_image : `data:image/jpeg;base64,${question.option3_image}`} 
                                                                alt="Option C" 
                                                                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded mt-1 cursor-pointer hover:opacity-80 transition-opacity"
                                                                onClick={() => {
                                                                    const imageSrc = question.option3_image.startsWith('data:') ? question.option3_image : `data:image/jpeg;base64,${question.option3_image}`;
                                                                    handleImagePreview(imageSrc, 'Option C Image');
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-start space-x-2">
                                                    <span className="font-medium text-gray-700">D.</span>
                                                    <div className="flex-1">
                                                        <div className="text-sm">{renderFormattedText(question.option4, question.option4_formatted)}</div>
                                                        {question.option4_image && (
                                                            <img 
                                                                src={question.option4_image.startsWith('data:') ? question.option4_image : `data:image/jpeg;base64,${question.option4_image}`} 
                                                                alt="Option D" 
                                                                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded mt-1 cursor-pointer hover:opacity-80 transition-opacity"
                                                                onClick={() => {
                                                                    const imageSrc = question.option4_image.startsWith('data:') ? question.option4_image : `data:image/jpeg;base64,${question.option4_image}`;
                                                                    handleImagePreview(imageSrc, 'Option D Image');
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-start space-x-2">
                                                    <span className="font-medium text-gray-700">E.</span>
                                                    <div className="flex-1">
                                                        <div className="text-sm">{renderFormattedText(question.option5, question.option5_formatted)}</div>
                                                        {question.option5_image && (
                                                            <img 
                                                                src={question.option5_image.startsWith('data:') ? question.option5_image : `data:image/jpeg;base64,${question.option5_image}`} 
                                                                alt="Option E" 
                                                                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded mt-1 cursor-pointer hover:opacity-80 transition-opacity"
                                                                onClick={() => {
                                                                    const imageSrc = question.option5_image.startsWith('data:') ? question.option5_image : `data:image/jpeg;base64,${question.option5_image}`;
                                                                    handleImagePreview(imageSrc, 'Option E Image');
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 w-16">
                                            <span className="font-semibold text-green-600">{question.correct_answer}</span>
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 w-24">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {question.category}
                                            </span>
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 w-32">
                                            <div className="max-w-xs truncate text-xs">
                                                {question.direction || 'No direction'}
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium w-24">
                                            <div className="space-x-2">
                                                <button
                                                    onClick={() => handleEdit(question)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleArchive(question.questionId)}
                                                    className="text-orange-600 hover:text-orange-900"
                                                >
                                                    Archive
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
                )}
                </div>

                {/* Pagination */}
                {questions.links && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            {questions.prev_page_url && (
                                <a 
                                    href={(() => {
                                        const url = new URL(questions.prev_page_url);
                                        if (selectedCategory) url.searchParams.set('category', selectedCategory);
                                        if (sortOrder) url.searchParams.set('sort', sortOrder);
                                        if (itemsPerPage) url.searchParams.set('per_page', itemsPerPage);
                                        return url.toString();
                                    })()} 
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Previous
                                </a>
                            )}
                            {questions.next_page_url && (
                                <a 
                                    href={(() => {
                                        const url = new URL(questions.next_page_url);
                                        if (selectedCategory) url.searchParams.set('category', selectedCategory);
                                        if (sortOrder) url.searchParams.set('sort', sortOrder);
                                        if (itemsPerPage) url.searchParams.set('per_page', itemsPerPage);
                                        return url.toString();
                                    })()} 
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Next
                                </a>
                            )}
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{questions.from || 0}</span> to <span className="font-medium">{questions.to || 0}</span> of{' '}
                                    <span className="font-medium">{questions.total}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    {questions.links.map((link, index) => {
                                        // Add current filters to pagination links
                                        let url = link.url;
                                        if (url) {
                                            const linkUrl = new URL(url);
                                            if (selectedCategory) linkUrl.searchParams.set('category', selectedCategory);
                                            if (sortOrder) linkUrl.searchParams.set('sort', sortOrder);
                                            if (itemsPerPage) linkUrl.searchParams.set('per_page', itemsPerPage);
                                            url = linkUrl.toString();
                                        }
                                        
                                        return (
                                        <a
                                            key={index}
                                                href={url}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                link.active
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                        );
                                    })}
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
            {/* Edit Question Modal */}
            {editingQuestion && (
                <div className="fixed inset-0 bg-clear bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl mx-4 border border-black max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Quick Edit Question
                            </h2>
                            <button
                                onClick={() => setEditingQuestion(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={(e) => { e.preventDefault(); handleUpdate(editingQuestion.questionId); }} className="space-y-6">
                            {/* Question Section */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Question Details
                                </h3>
                                <div className="space-y-3">

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Question Text
                                        </label>
                                        <textarea
                                            value={editingQuestion.question || ''}
                                            onChange={(e) => setEditingQuestion({
                                                ...editingQuestion,
                                                question: e.target.value
                                            })}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                                            rows="4"
                                            placeholder="Enter the question text..."
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-800 mb-1">
                                            Question Image
                                        </label>
                                        <div className="flex items-center space-x-3">
                                            {editingQuestion.image && (
                                                <img 
                                                    src={editingQuestion.image} 
                                                    alt="Question" 
                                                    className="w-16 h-16 object-cover rounded border"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onload = (e) => {
                                                                setEditingQuestion({
                                                                    ...editingQuestion,
                                                                    image: e.target.result
                                                                });
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                    className="w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                />
                                            </div>
                                            {editingQuestion.image && (
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingQuestion({
                                                        ...editingQuestion,
                                                        image: null
                                                    })}
                                                    className="text-xs text-red-600 hover:text-red-800 px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Options Section */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    Answer Options
                                </h3>
                                <div className="space-y-3">
                                    {['option1', 'option2', 'option3', 'option4', 'option5'].map((optionKey, index) => (
                                        <div key={optionKey} className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium text-gray-600 w-6">
                                                    {String.fromCharCode(65 + index)}.
                                                </span>
                                                <input
                                                    value={editingQuestion[optionKey]}
                                                    onChange={(e) => setEditingQuestion({
                                                        ...editingQuestion,
                                                        [optionKey]: e.target.value
                                                    })}
                                                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                                    required
                                                />
                                            </div>
                                            
                                            {/* Option Image */}
                                            <div className="flex items-center space-x-2 ml-6">
                                                {editingQuestion[`${optionKey}_image`] && (
                                                    <img 
                                                        src={editingQuestion[`${optionKey}_image`]} 
                                                        alt={`Option ${String.fromCharCode(65 + index)}`} 
                                                        className="w-12 h-12 object-cover rounded border"
                                                    />
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onload = (e) => {
                                                                setEditingQuestion({
                                                                    ...editingQuestion,
                                                                    [`${optionKey}_image`]: e.target.result
                                                                });
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                    className="flex-1 text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                                                />
                                                {editingQuestion[`${optionKey}_image`] && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingQuestion({
                                                            ...editingQuestion,
                                                            [`${optionKey}_image`]: null
                                                        })}
                                                        className="text-xs text-red-600 hover:text-red-800 px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Settings Section */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Question Settings
                                </h3>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-800 mb-1">
                                                Correct Answer
                                            </label>
                                            <select
                                                value={editingQuestion.correct_answer}
                                                onChange={(e) => setEditingQuestion({
                                                    ...editingQuestion,
                                                    correct_answer: e.target.value
                                                })}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                required
                                            >
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                                <option value="E">E</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Category
                                            </label>
                                            <input
                                                value={editingQuestion.category}
                                                onChange={(e) => setEditingQuestion({
                                                    ...editingQuestion,
                                                    category: e.target.value
                                                })}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Direction (Optional)
                                        </label>
                                        <textarea
                                            value={editingQuestion.direction}
                                            onChange={(e) => setEditingQuestion({
                                                ...editingQuestion,
                                                direction: e.target.value
                                            })}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            rows="2"
                                            placeholder="Enter direction for this question..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setEditingQuestion(null)}
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {showImagePreviewModal && previewImage && (
                <div className="fixed inset-0 bg-clear bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-4xl mx-4 border border-black">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {previewImage.title}
                            </h2>
                            <button
                                onClick={() => setShowImagePreviewModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="flex justify-center">
                            <img 
                                src={previewImage.src} 
                                alt={previewImage.title}
                                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                            />
                        </div>
                        
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setShowImagePreviewModal(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default QuestionBank; 