import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import Layout from '../../Components/Layout';

export default function EvaluatorManagement({ user, evaluators }) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        name: '',
        department: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        post('/guidance/evaluators', {
            onSuccess: () => {
                setShowCreateForm(false);
                setSuccessMessage('Evaluator account created successfully!');
                setShowSuccess(true);
                reset();
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    setShowSuccess(false);
                    setSuccessMessage('');
                }, 5000);
            },
            onError: (errors) => {
                // Handle specific error cases with detailed messages
                if (errors.email && errors.email.includes('unique')) {
                    setData('email', data.email);
                    // The error will be displayed automatically by Inertia
                }
                if (errors.username && errors.username.includes('unique')) {
                    setData('username', data.username);
                    // The error will be displayed automatically by Inertia
                }
            }
        });
    };

    const handleDelete = (evaluatorId) => {
        if (confirm('Are you sure you want to delete this evaluator account? This action cannot be undone.')) {
            router.delete(`/guidance/evaluators/${evaluatorId}`, {
                onSuccess: () => {
                    setSuccessMessage('Evaluator account deleted successfully!');
                    setShowSuccess(true);
                    
                    // Hide success message after 5 seconds
                    setTimeout(() => {
                        setShowSuccess(false);
                        setSuccessMessage('');
                    }, 5000);
                },
                onError: (errors) => {
                    console.error('Failed to delete evaluator:', errors);
                }
            });
        }
    };

    const getErrorMessage = (field) => {
        if (!errors[field]) return null;
        
        const error = errors[field];
        
        // Provide detailed error messages
        if (field === 'email' && error.includes('unique')) {
            return 'This email address is already registered. Please use a different email address.';
        }
        if (field === 'username' && error.includes('unique')) {
            return 'This username is already taken. Please choose a different username.';
        }
        if (field === 'password' && error.includes('confirmed')) {
            return 'Password confirmation does not match. Please make sure both passwords are identical.';
        }
        if (field === 'password' && error.includes('min')) {
            return 'Password must be at least 8 characters long.';
        }
        
        return error;
    };

    return (
        <Layout user={user}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-8 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg p-6 text-white animate-fadeIn">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Evaluator Management</h1>
                            <p className="mt-2 text-indigo-100">Create and manage evaluator accounts for the admission system</p>
                            <div className="mt-4 flex items-center space-x-6">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                    </svg>
                                    <span className="text-sm">Total: {evaluators?.length || 0} evaluators</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right hidden md:block">
                            <div className="text-2xl font-bold">{evaluators?.length || 0}</div>
                            <div className="text-indigo-100">Active Accounts</div>
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                {showSuccess && (
                    <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 shadow-lg animate-fadeIn">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-base font-semibold text-green-800">{successMessage}</p>
                                <p className="text-sm text-green-600 mt-1">Operation completed successfully</p>
                            </div>
                            <div className="ml-auto pl-3">
                                <button
                                    onClick={() => setShowSuccess(false)}
                                    className="inline-flex p-2 text-green-400 hover:text-green-600 hover:bg-green-100 rounded-lg transition-all duration-200"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                                showCreateForm 
                                    ? 'bg-gray-600 text-white hover:bg-gray-700' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
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
                                    Create New Evaluator
                                </span>
                            )}
                        </button>
                    </div>
                    
                    {evaluators && evaluators.length > 0 && (
                        <div className="text-sm text-gray-600">
                            Managing {evaluators.length} evaluator{evaluators.length !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>

                {/* Create Evaluator Form */}
                {showCreateForm && (
                    <div className="bg-white rounded-lg shadow-lg border-l-4 border-blue-500 p-6 mb-8 animate-fadeIn">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Create New Evaluator Account
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Username Field */}
                                <div className="group">
                                    <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Username <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="username"
                                        type="text"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        className={`w-full px-4 py-2.5 bg-white border-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 transition-all duration-300 shadow-sm ${
                                            errors.username 
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                                                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                                        }`}
                                        placeholder="Enter username"
                                        required
                                    />
                                    {errors.username && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {getErrorMessage('username')}
                                        </p>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div className="group">
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`w-full px-4 py-2.5 bg-white border-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 transition-all duration-300 shadow-sm ${
                                            errors.email 
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                                                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                                        }`}
                                        placeholder="Enter email address"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {getErrorMessage('email')}
                                        </p>
                                    )}
                                </div>

                                {/* Name Field */}
                                <div className="group">
                                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`w-full px-4 py-2.5 bg-white border-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 transition-all duration-300 shadow-sm ${
                                            errors.name 
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                                                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                                        }`}
                                        placeholder="Enter full name"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Department Field */}
                                <div className="group">
                                    <label htmlFor="department" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Department <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="department"
                                        type="text"
                                        value={data.department}
                                        onChange={(e) => setData('department', e.target.value)}
                                        className={`w-full px-4 py-2.5 bg-white border-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 transition-all duration-300 shadow-sm ${
                                            errors.department 
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                                                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                                        }`}
                                        placeholder="Enter department"
                                        required
                                    />
                                    {errors.department && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.department}
                                        </p>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div className="group">
                                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`w-full px-4 py-2.5 bg-white border-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 transition-all duration-300 shadow-sm ${
                                            errors.password 
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                                                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                                        }`}
                                        placeholder="Enter password (min 8 characters)"
                                        required
                                    />
                                    {errors.password && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {getErrorMessage('password')}
                                        </p>
                                    )}
                                </div>

                                {/* Confirm Password Field */}
                                <div className="group">
                                    <label htmlFor="password_confirmation" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Confirm Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className={`w-full px-4 py-2.5 bg-white border-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 transition-all duration-300 shadow-sm ${
                                            errors.password_confirmation 
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                                                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                                        }`}
                                        placeholder="Confirm password"
                                        required
                                    />
                                    {errors.password_confirmation && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {getErrorMessage('password_confirmation')}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Password Match Warning */}
                            {data.password && data.password_confirmation && data.password !== data.password_confirmation && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-yellow-800">
                                                Password Mismatch
                                            </p>
                                            <p className="text-sm text-yellow-700 mt-1">
                                                The passwords you entered do not match. Please make sure both passwords are identical.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || (data.password && data.password_confirmation && data.password !== data.password_confirmation)}
                                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <div className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating...
                                        </div>
                                    ) : (
                                        'Create Evaluator'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Evaluators List */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-fadeIn">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                    </svg>
                                </div>
                                Evaluator Accounts
                            </h2>
                            <div className="text-sm text-gray-600">
                                {evaluators?.length || 0} account{evaluators?.length !== 1 ? 's' : ''} total
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Manage existing evaluator accounts</p>
                    </div>
                    
                    {evaluators && evaluators.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Username
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Department
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {evaluators.map((evaluator, index) => (
                                        <tr key={evaluator.id} className="hover:bg-gray-50 transition-all duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-bold text-indigo-600">
                                                        {evaluator.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">{evaluator.name}</div>
                                                        <div className="text-xs text-gray-500">Evaluator #{index + 1}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <div className="text-sm text-gray-900">{evaluator.username}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    <div className="text-sm text-gray-900">{evaluator.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                    {evaluator.department}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <div className="text-sm text-gray-500">{evaluator.created_at}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleDelete(evaluator.id)}
                                                    className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 hover:text-red-800 transition-all duration-200 shadow-sm hover:shadow-md"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="px-6 py-12 text-center">
                            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">No evaluators yet</h3>
                            <p className="mt-2 text-sm text-gray-500">Get started by creating a new evaluator account for the admission system.</p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Create First Evaluator
                                </button>
                            </div>
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
            `}</style>
        </Layout>
    );
}
