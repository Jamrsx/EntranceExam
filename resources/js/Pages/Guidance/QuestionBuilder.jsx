import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import Layout from '../../Components/Layout';

const QuestionBuilder = ({ user, categories = [] }) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState({
        question: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        option5: '',
        correct_answer: 'A',
        category: '',
        direction: '',
        image: null,
        option1_image: null,
        option2_image: null,
        option3_image: null,
        option4_image: null,
        option5_image: null
    });
    const [showPreview, setShowPreview] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (field, value) => {
        setCurrentQuestion(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleImageUpload = (field, file) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setCurrentQuestion(prev => ({
                    ...prev,
                    [field]: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (field) => {
        setCurrentQuestion(prev => ({
            ...prev,
            [field]: null
        }));
    };

    const addQuestion = () => {
        if (!currentQuestion.question.trim() || !currentQuestion.category.trim()) {
            alert('Please fill in the question text and category');
            return;
        }

        const newQuestion = {
            ...currentQuestion,
            id: Date.now() // Temporary ID for local management
        };

        setQuestions(prev => [...prev, newQuestion]);
        setCurrentQuestion({
            question: '',
            option1: '',
            option2: '',
            option3: '',
            option4: '',
            option5: '',
            correct_answer: 'A',
            category: '',
            direction: '',
            image: null,
            option1_image: null,
            option2_image: null,
            option3_image: null,
            option4_image: null,
            option5_image: null
        });
    };

    const removeQuestion = (questionId) => {
        setQuestions(prev => prev.filter(q => q.id !== questionId));
    };

    const editQuestion = (question) => {
        setCurrentQuestion(question);
        removeQuestion(question.id);
    };

    const submitQuestions = async () => {
        if (questions.length === 0) {
            alert('Please add at least one question');
            return;
        }

        setIsSubmitting(true);
        
        try {
            const formData = new FormData();
            formData.append('questions', JSON.stringify(questions));

            router.post('/guidance/questions/bulk-create', formData, {
                onSuccess: () => {
                    window.showAlert(`${questions.length} questions created successfully`, 'success');
                    setQuestions([]);
                    setCurrentQuestion({
                        question: '',
                        option1: '',
                        option2: '',
                        option3: '',
                        option4: '',
                        option5: '',
                        correct_answer: 'A',
                        category: '',
                        direction: '',
                        image: null,
                        option1_image: null,
                        option2_image: null,
                        option3_image: null,
                        option4_image: null,
                        option5_image: null
                    });
                },
                onError: (errors) => {
                    window.showAlert('Failed to create questions', 'error');
                    console.error('Errors:', errors);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                }
            });
        } catch (error) {
            console.error('Error submitting questions:', error);
            setIsSubmitting(false);
        }
    };

    const clearAll = () => {
        if (confirm('Are you sure you want to clear all questions?')) {
            setQuestions([]);
            setCurrentQuestion({
                question: '',
                option1: '',
                option2: '',
                option3: '',
                option4: '',
                option5: '',
                correct_answer: 'A',
                category: '',
                direction: '',
                image: null,
                option1_image: null,
                option2_image: null,
                option3_image: null,
                option4_image: null,
                option5_image: null
            });
        }
    };

    return (
        <Layout user={user}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-4 text-white animate-fadeIn">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Question Builder</h1>
                            <p className="mt-1 text-green-100">Create multiple exam questions directly in the web interface</p>
                            <div className="mt-3 flex items-center space-x-4">
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm">{questions.length} questions created</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <a
                                href="/guidance/question-bank"
                                className="bg-white bg-opacity-20 backdrop-blur-sm text-black px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all duration-200 font-medium flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Question Bank
                            </a>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Question Form */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Create New Question
                            </h2>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Question Text */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Question Text *
                                </label>
                                <textarea
                                    value={currentQuestion.question}
                                    onChange={(e) => handleInputChange('question', e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    rows="4"
                                    placeholder="Enter your question here..."
                                    required
                                />
                            </div>

                            {/* Question Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Question Image (Optional)
                                </label>
                                <div className="flex items-center space-x-3">
                                    {currentQuestion.image && (
                                        <img 
                                            src={currentQuestion.image} 
                                            alt="Question" 
                                            className="w-20 h-20 object-cover rounded border"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload('image', e.target.files[0])}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                    </div>
                                    {currentQuestion.image && (
                                        <button
                                            type="button"
                                            onClick={() => removeImage('image')}
                                            className="text-sm text-red-600 hover:text-red-800 px-3 py-1 border border-red-200 rounded hover:bg-red-50"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Answer Options */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Answer Options *
                                </label>
                                <div className="space-y-4">
                                    {['option1', 'option2', 'option3', 'option4', 'option5'].map((optionKey, index) => (
                                        <div key={optionKey} className="space-y-2">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-sm font-medium text-gray-600 w-6">
                                                    {String.fromCharCode(65 + index)}.
                                                </span>
                                                <input
                                                    value={currentQuestion[optionKey]}
                                                    onChange={(e) => handleInputChange(optionKey, e.target.value)}
                                                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                                    required
                                                />
                                            </div>
                                            
                                            {/* Option Image */}
                                            <div className="flex items-center space-x-3 ml-9">
                                                {currentQuestion[`${optionKey}_image`] && (
                                                    <img 
                                                        src={currentQuestion[`${optionKey}_image`]} 
                                                        alt={`Option ${String.fromCharCode(65 + index)}`} 
                                                        className="w-16 h-16 object-cover rounded border"
                                                    />
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(`${optionKey}_image`, e.target.files[0])}
                                                    className="flex-1 text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                                                />
                                                {currentQuestion[`${optionKey}_image`] && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(`${optionKey}_image`)}
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

                            {/* Correct Answer */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Correct Answer *
                                </label>
                                <select
                                    value={currentQuestion.correct_answer}
                                    onChange={(e) => handleInputChange('correct_answer', e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                    <option value="E">E</option>
                                </select>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <div className="relative">
                                    <input
                                        value={currentQuestion.category}
                                        onChange={(e) => handleInputChange('category', e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter category (e.g., Mathematics, Science, etc.)"
                                        list="category-suggestions"
                                        required
                                    />
                                    {categories.length > 0 && (
                                        <datalist id="category-suggestions">
                                            {categories.map((category, index) => (
                                                <option key={index} value={category} />
                                            ))}
                                        </datalist>
                                    )}
                                </div>
                                {categories.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500 mb-1">Existing categories:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {categories.slice(0, 5).map((category, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => handleInputChange('category', category)}
                                                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                                                >
                                                    {category}
                                                </button>
                                            ))}
                                            {categories.length > 5 && (
                                                <span className="text-xs text-gray-400">+{categories.length - 5} more</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Direction */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Direction (Optional)
                                </label>
                                <textarea
                                    value={currentQuestion.direction}
                                    onChange={(e) => handleInputChange('direction', e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    rows="2"
                                    placeholder="Enter any special instructions for this question..."
                                />
                            </div>

                            {/* Add Question Button */}
                            <div className="pt-4 border-t border-gray-200">
                                <button
                                    onClick={addQuestion}
                                    className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add Question
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Questions List */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    Created Questions ({questions.length})
                                </h2>
                                {questions.length > 0 && (
                                    <button
                                        onClick={clearAll}
                                        className="text-sm text-red-600 hover:text-red-800 px-3 py-1 border border-red-200 rounded hover:bg-red-50"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="p-6">
                            {questions.length === 0 ? (
                                <div className="text-center py-8">
                                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    <p className="text-gray-500">No questions created yet</p>
                                    <p className="text-sm text-gray-400">Add your first question using the form on the left</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {questions.map((question, index) => (
                                        <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-sm font-medium text-gray-600">Q{index + 1}</span>
                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                            {question.category}
                                                        </span>
                                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                            Answer: {question.correct_answer}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-900 mb-2 line-clamp-2">
                                                        {question.question}
                                                    </p>
                                                    <div className="text-xs text-gray-500">
                                                        {question.image && <span className="mr-3">📷 Has image</span>}
                                                        {[1,2,3,4,5].some(i => question[`option${i}_image`]) && <span>📷 Has option images</span>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 ml-4">
                                                    <button
                                                        onClick={() => editQuestion(question)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => removeQuestion(question.id)}
                                                        className="text-red-600 hover:text-red-800 text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        {questions.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={submitQuestions}
                                    disabled={isSubmitting}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating Questions...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Create {questions.length} Question{questions.length !== 1 ? 's' : ''}
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
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
                    .line-clamp-2 {
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                `}</style>
            </div>
        </Layout>
    );
};

export default QuestionBuilder;
