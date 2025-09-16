import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';

export default function ForgotPassword() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/forgot-password', {
            onSuccess: () => {
                setShowSuccess(true);
            },
            onError: (errors) => {
                // Handle specific error cases with detailed messages
                if (errors.email && errors.email.includes('exists')) {
                    // The error will be displayed automatically by Inertia
                }
            }
        });
    };

    const handleBackToLogin = () => {
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl lg:max-w-3xl">
                {/* Forgot Password Card - Two Column Layout */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
                    <div className="flex flex-col lg:flex-row min-h-[400px] lg:min-h-[450px]">
                        {/* Left Section - Logo/Branding */}
                        <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 relative overflow-hidden p-4 lg:p-6">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-8 left-8 w-12 h-12 lg:w-16 lg:h-16 bg-white rounded-full"></div>
                                <div className="absolute top-24 right-12 w-8 h-8 lg:w-12 lg:h-12 bg-white rounded-full"></div>
                                <div className="absolute bottom-16 left-16 w-6 h-6 lg:w-8 lg:h-8 bg-white rounded-full"></div>
                                <div className="absolute bottom-24 right-8 w-12 h-12 lg:w-16 lg:h-16 bg-white rounded-full"></div>
                            </div>
                            
                            <div className="relative z-10 flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-3 lg:mb-4 transform transition-all duration-300 hover:scale-110">
                                        <img 
                                            src="/OCC logo.png" 
                                            alt="OCC Logo" 
                                            className="w-full h-full object-contain drop-shadow-2xl"
                                        />
                                    </div>
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 lg:mb-3 drop-shadow-lg">OCC Admission System</h2>
                                    <p className="text-blue-100 text-xs lg:text-sm mb-2 lg:mb-3">Password Reset Request</p>
                                    <div className="w-12 lg:w-16 h-1 bg-white mx-auto rounded-full opacity-60"></div>
                                </div>
                            </div>
                        </div>

                        {/* Right Section - Forgot Password Form */}
                        <div className="w-full lg:w-1/2 p-4 lg:p-6 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                            <div className="w-full max-w-sm">
                                {!showSuccess ? (
                                    <>
                                        <div className="text-center mb-4 lg:mb-6">
                                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 lg:mb-3">Forgot Password</h1>
                                            <p className="text-gray-600 text-sm">
                                                Enter your email address and we'll send you a 6-digit code to reset your password.
                                            </p>
                                        </div>

                                        {/* Forgot Password Form */}
                                        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
                                            {/* Email Field */}
                                            <div className="group">
                                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Email Address
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        id="email"
                                                        type="email"
                                                        value={data.email}
                                                        onChange={(e) => setData('email', e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm"
                                                        placeholder="Enter your Email Address"
                                                        required
                                                    />
                                                </div>
                                                {errors.email && (
                                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {errors.email.includes('exists') 
                                                            ? 'This email address is not registered in our system. Please check your email or contact support.' 
                                                            : errors.email}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Submit Button */}
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                                            >
                                                {processing ? (
                                                    <div className="flex items-center justify-center">
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Sending...
                                                    </div>
                                                ) : (
                                                    'Send Reset Code'
                                                )}
                                            </button>
                                        </form>
                                    </>
                                ) : (
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                                        <p className="text-gray-600 mb-4">
                                            We've sent a 6-digit reset code to <strong>{data.email}</strong>. 
                                            The code will expire in 15 minutes.
                                        </p>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                            <p className="text-sm text-blue-800">
                                                <strong>Next steps:</strong>
                                            </p>
                                            <ol className="text-sm text-blue-700 mt-2 list-decimal list-inside space-y-1">
                                                <li>Check your email inbox</li>
                                                <li>Enter the 6-digit code on the next page</li>
                                                <li>Create your new password</li>
                                            </ol>
                                        </div>
                                        <button
                                            onClick={() => window.location.href = `/reset-password?email=${encodeURIComponent(data.email)}`}
                                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            Enter Reset Code
                                        </button>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="text-center mt-4 lg:mt-6 pt-3 lg:pt-4 border-t border-gray-200">
                                    <button
                                        onClick={handleBackToLogin}
                                        className="text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium"
                                    >
                                        ← Back to Login
                                    </button>
                                    
                                    <div className="mt-2 lg:mt-3">
                                        <p className="text-gray-500 text-sm">
                                            © 2024 OCC Admission System. All rights reserved.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
