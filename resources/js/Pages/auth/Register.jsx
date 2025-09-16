import React, { useState, useEffect } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function Register() {
    const { props } = usePage();
    console.log('[Register] mounted');
    
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        school_name: '',
        parent_name: '',
        parent_phone: '',
        address: '',
        profile: null,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [profilePreview, setProfilePreview] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [formProgress, setFormProgress] = useState(0);
    const [fieldFocus, setFieldFocus] = useState({});
    const [showTooltip, setShowTooltip] = useState({});
    const [showImageModal, setShowImageModal] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/register');
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file.');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size must be less than 5MB.');
                return;
            }
            
            setData('profile', file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfilePreview(e.target.result);
            };
            reader.onerror = (error) => {
                console.error('Error reading file:', error);
                alert('Error reading image file. Please try again.');
            };
            reader.readAsDataURL(file);
        }
    };

    const removeProfileImage = () => {
        setData('profile', null);
        setProfilePreview(null);
    };

    // Calculate form progress
    useEffect(() => {
        const requiredFields = ['name', 'email', 'password', 'password_confirmation', 'school_name', 'parent_name', 'parent_phone', 'address', 'profile'];
        const filledFields = requiredFields.filter(field => {
            if (field === 'profile') {
                return data[field] !== null;
            }
            return data[field] && data[field].trim() !== '';
        });
        const progress = (filledFields.length / requiredFields.length) * 100;
        setFormProgress(progress);
    }, [data]);

    // Password strength indicator
    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: '' };
        
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        
        const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
        
        return {
            strength: (strength / 5) * 100,
            label: labels[strength - 1] || '',
            color: colors[strength - 1] || 'bg-gray-300'
        };
    };

    const passwordStrength = getPasswordStrength(data.password);

    // Field validation helpers
    const isFieldValid = (fieldName) => {
        switch (fieldName) {
            case 'email':
                return isEmailFormatValid;
            case 'password':
                return data.password.length >= 8;
            case 'password_confirmation':
                return data.password === data.password_confirmation && data.password_confirmation.length > 0;
            case 'profile':
                return data.profile !== null;
            default:
                return data[fieldName] && data[fieldName].trim().length > 0;
        }
    };

    const getFieldStatus = (fieldName) => {
        if (fieldName === 'profile') {
            if (data[fieldName] === null) return 'empty';
            return isFieldValid(fieldName) ? 'valid' : 'invalid';
        }
        if (!data[fieldName]) return 'empty';
        return isFieldValid(fieldName) ? 'valid' : 'invalid';
    };

    // Check if registration is open
    const registrationOpen = props?.registrationOpen ?? false;
    const registrationMessage = props?.registrationMessage ?? 'Registration is currently closed.';

    // Email format: occ.lastname.firstname[.middlename[...]][digits]@gmail.com
    // - allows multiple dot-separated name parts
    // - allows hyphens/apostrophes in parts
    // - allows optional digits at the end of any part (e.g., james28)
    const emailRegex = /^occ\.[A-Za-z][A-Za-z\-']*[0-9]*(?:\.[A-Za-z][A-Za-z\-']*[0-9]*)+@gmail\.com$/i;
    const isEmailFormatValid = emailRegex.test(data.email || '');

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute top-40 left-1/2 w-60 h-60 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
            </div>
            
            <div className="w-full max-w-2xl relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-30"></div>
                        <img
                            src="/OCC logo.png"
                            alt="OCC Logo"
                            className="w-full h-full object-contain drop-shadow-xl relative z-10"
                        />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                        OCC Admission System
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg">Student Registration Portal</p>
                </div>

                {/* Progress Bar */}
                {registrationOpen && (
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Registration Progress</span>
                            <span className="text-sm text-gray-500">{Math.round(formProgress)}% Complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${formProgress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Alerts */}
                {!registrationOpen && (
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-yellow-800 font-medium">Registration Closed</span>
                        </div>
                        <p className="text-yellow-700 text-sm mt-2">{registrationMessage}</p>
                    </div>
                )}

                {props?.flash?.success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
                        {props.flash.success}
                    </div>
                )}

                {props?.flash?.error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                        {props.flash.error}
                    </div>
                )}

                {/* Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 relative overflow-hidden">
                    {/* Card decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-100 to-blue-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
                    
                    <div className="text-center mb-6 relative z-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
                        <p className="text-gray-600">Fill in the details below to register for the entrance exam.</p>
                    </div>

                    {registrationOpen && (
                        <form onSubmit={(e) => {
                            console.log('[Register] submit', data);
                            if (!isEmailFormatValid) {
                                e.preventDefault();
                                return;
                            }
                            // Use verification-first flow
                            e.preventDefault();
                            post('/register/start', {
                                forceFormData: true
                            });
                        }} className="space-y-6" encType="multipart/form-data">
                                        {/* Full Name Field */}
                                        <div className="group relative">
                                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Full Name
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className={`h-5 w-5 transition-colors ${
                                                        getFieldStatus('name') === 'valid' ? 'text-green-500' :
                                                        getFieldStatus('name') === 'invalid' ? 'text-red-500' :
                                                        'text-gray-400 group-focus-within:text-blue-500'
                                                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    id="name"
                                                    type="text"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    onFocus={() => setFieldFocus({...fieldFocus, name: true})}
                                                    onBlur={() => setFieldFocus({...fieldFocus, name: false})}
                                                    className={`w-full pl-10 pr-12 py-3 bg-white/50 backdrop-blur-sm border-2 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 transition-all duration-300 shadow-sm ${
                                                        getFieldStatus('name') === 'valid' ? 'border-green-500 focus:border-green-500 focus:ring-green-100' :
                                                        getFieldStatus('name') === 'invalid' ? 'border-red-500 focus:border-red-500 focus:ring-red-100' :
                                                        'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                                                    }`}
                                                    placeholder="Enter your full name"
                                                    required
                                                />
                                                {getFieldStatus('name') === 'valid' && (
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            {errors.name && (
                                                <p className="mt-2 text-sm text-red-600 flex items-center animate-pulse">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Email Field */}
                                        <div className="group relative">
                                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Email Address
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className={`h-5 w-5 transition-colors ${
                                                        getFieldStatus('email') === 'valid' ? 'text-green-500' :
                                                        getFieldStatus('email') === 'invalid' ? 'text-red-500' :
                                                        'text-gray-400 group-focus-within:text-blue-500'
                                                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                                    </svg>
                                                </div>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    onFocus={() => setFieldFocus({...fieldFocus, email: true})}
                                                    onBlur={() => setFieldFocus({...fieldFocus, email: false})}
                                                    className={`w-full pl-10 pr-12 py-3 bg-white/50 backdrop-blur-sm border-2 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 transition-all duration-300 shadow-sm ${
                                                        getFieldStatus('email') === 'valid' ? 'border-green-500 focus:border-green-500 focus:ring-green-100' :
                                                        getFieldStatus('email') === 'invalid' ? 'border-red-500 focus:border-red-500 focus:ring-red-100' :
                                                        'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                                                    }`}
                                                    placeholder="occ.lastname.firstname@gmail.com"
                                                    required
                                                />
                                                {getFieldStatus('email') === 'valid' && (
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Email format helper */}
                                            {data.email && (
                                                <div className="mt-2">
                                                    {!isEmailFormatValid ? (
                                                        <div className="text-sm">
                                                            <p className="text-red-600 flex items-center">
                                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                </svg>
                                                                Use OCC Gmail format: <span className="font-semibold">occ.lastname.firstname@gmail.com</span>
                                                            </p>
                                                            <a
                                                                href="https://accounts.google.com/lifecycle/steps/signup/name"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-700 underline text-xs mt-1 inline-block"
                                                            >
                                                                Create a Gmail account →
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-green-600 flex items-center">
                                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                            Valid OCC email format
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {errors.email && (
                                                <p className="mt-2 text-sm text-red-600 flex items-center animate-pulse">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>

                                        {/* Password Field */}
                                        <div className="group relative">
                                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Password
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className={`h-5 w-5 transition-colors ${
                                                        getFieldStatus('password') === 'valid' ? 'text-green-500' :
                                                        getFieldStatus('password') === 'invalid' ? 'text-red-500' :
                                                        'text-gray-400 group-focus-within:text-blue-500'
                                                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    onFocus={() => setFieldFocus({...fieldFocus, password: true})}
                                                    onBlur={() => setFieldFocus({...fieldFocus, password: false})}
                                                    className={`w-full pl-10 pr-12 py-3 bg-white/50 backdrop-blur-sm border-2 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 transition-all duration-300 shadow-sm ${
                                                        getFieldStatus('password') === 'valid' ? 'border-green-500 focus:border-green-500 focus:ring-green-100' :
                                                        getFieldStatus('password') === 'invalid' ? 'border-red-500 focus:border-red-500 focus:ring-red-100' :
                                                        'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                                                    }`}
                                                    placeholder="Enter your password"
                                                    required
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                    <button
                                                        type="button"
                                                        onClick={togglePasswordVisibility}
                                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                                    >
                                                        {showPassword ? (
                                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {/* Password Strength Indicator */}
                                            {data.password && (
                                                <div className="mt-2">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs text-gray-600">Password strength:</span>
                                                        <span className={`text-xs font-medium ${
                                                            passwordStrength.strength < 40 ? 'text-red-600' :
                                                            passwordStrength.strength < 60 ? 'text-orange-600' :
                                                            passwordStrength.strength < 80 ? 'text-yellow-600' :
                                                            'text-green-600'
                                                        }`}>
                                                            {passwordStrength.label}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                        <div 
                                                            className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                                            style={{ width: `${passwordStrength.strength}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {errors.password && (
                                                <p className="mt-2 text-sm text-red-600 flex items-center animate-pulse">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>

                                        {/* Confirm Password Field */}
                                        <div className="group">
                                            <label htmlFor="password_confirmation" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Confirm Password
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    id="password_confirmation"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    className="w-full pl-10 pr-10 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm"
                                                    placeholder="Confirm your password"
                                                    required
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                    <button
                                                        type="button"
                                                        onClick={toggleConfirmPasswordVisibility}
                                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                                    >
                                                        {showConfirmPassword ? (
                                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* School Name Field */}
                                        <div className="group">
                                            <label htmlFor="school_name" className="block text-sm font-semibold text-gray-700 mb-2">
                                                School Name
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                </div>
                                                <input
                                                    id="school_name"
                                                    type="text"
                                                    value={data.school_name}
                                                    onChange={(e) => setData('school_name', e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm"
                                                    placeholder="Enter your school name"
                                                    required
                                                />
                                            </div>
                                            {errors.school_name && (
                                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {errors.school_name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Parent Name Field */}
                                        <div className="group">
                                            <label htmlFor="parent_name" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Parent/Guardian Name
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    id="parent_name"
                                                    type="text"
                                                    value={data.parent_name}
                                                    onChange={(e) => setData('parent_name', e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm"
                                                    placeholder="Enter parent/guardian name"
                                                    required
                                                />
                                            </div>
                                            {errors.parent_name && (
                                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {errors.parent_name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Parent Phone Field */}
                                        <div className="group">
                                            <label htmlFor="parent_phone" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Parent/Guardian Phone
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    id="parent_phone"
                                                    type="tel"
                                                    value={data.parent_phone}
                                                    onChange={(e) => setData('parent_phone', e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm"
                                                    placeholder="Enter parent/guardian phone"
                                                    required
                                                />
                                            </div>
                                            {errors.parent_phone && (
                                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {errors.parent_phone}
                                                </p>
                                            )}
                                        </div>

                                        {/* Address Field */}
                                        <div className="group">
                                            <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Address
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    id="address"
                                                    type="text"
                                                    value={data.address}
                                                    onChange={(e) => setData('address', e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm"
                                                    placeholder="Enter your address"
                                                    required
                                                />
                                            </div>
                                            {errors.address && (
                                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {errors.address}
                                                </p>
                                            )}
                                        </div>

                                        {/* Profile Picture Field */}
                                        <div className="group relative">
                                            <label htmlFor="profile" className="block text-sm font-semibold text-gray-700 mb-3">
                                                Profile Picture
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            
                                            <div className="space-y-4">
                                                {/* Image Preview Section */}
                                                {profilePreview ? (
                                                    <div className="flex flex-col items-center space-y-4">
                                                        {/* Simple Preview - No Complex Styling */}
                                                        <div className="relative">
                                                            <img
                                                                key={profilePreview ? profilePreview.substring(0, 50) : 'no-image'}
                                                                src={profilePreview}
                                                                alt="Profile preview"
                                                                width="128"
                                                                height="128"
                                                                style={{ 
                                                                    width: '128px !important',
                                                                    height: '128px !important',
                                                                    borderRadius: '8px',
                                                                    objectFit: 'cover',
                                                                    display: 'block',
                                                                    border: '2px solid #e5e7eb',
                                                                    cursor: 'pointer'
                                                                }}
                                                                onClick={() => setShowImageModal(true)}
                                                            />
                                                            
                                                            {/* Remove Button */}
                                                            <button
                                                                type="button"
                                                                onClick={removeProfileImage}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        
                                                        {/* Status and Actions */}
                                                        <div className="text-center space-y-2">
                                                            <div className="flex items-center justify-center space-x-2">
                                                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                                <p className="text-sm text-green-600 font-medium">Profile picture uploaded successfully</p>
                                                            </div>
                                                            <p className="text-xs text-gray-500">Tap image to view full size • Click × to remove</p>
                                                            
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* Upload Area */
                                                    <div className="relative">
                                                        <input
                                                            id="profile"
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleProfileImageChange}
                                                            className="hidden"
                                                        />
                                                        <label
                                                            htmlFor="profile"
                                                            className={`group flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                                                                getFieldStatus('profile') === 'invalid'
                                                                    ? 'border-red-300 bg-red-50 hover:bg-red-100' 
                                                                    : 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-purple-50 hover:border-blue-400'
                                                            }`}
                                                        >
                                                            <div className="flex flex-col items-center justify-center p-8">
                                                                {/* Upload Icon */}
                                                                <div className="relative mb-4">
                                                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
                                                                        <svg className={`w-8 h-8 transition-colors ${
                                                                            getFieldStatus('profile') === 'invalid' ? 'text-red-500' : 'text-blue-500 group-hover:text-purple-600'
                                                                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                        </svg>
                                                                    </div>
                                                                    {/* Plus Icon Overlay */}
                                                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
                                                                        <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Upload Text */}
                                                                <div className="text-center">
                                                                    <p className="text-lg font-semibold text-gray-700 mb-1">
                                                                        Upload Profile Picture
                                                                    </p>
                                                                    <p className="text-sm text-gray-500 mb-2">
                                                                        Drag and drop or click to browse
                                                                    </p>
                                                                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                                                                        <span className="flex items-center">
                                                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                                            </svg>
                                                                            PNG, JPG, GIF
                                                                        </span>
                                                                        <span>•</span>
                                                                        <span>Max 5MB</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Validation Messages */}
                                            {getFieldStatus('profile') === 'empty' && (
                                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                    <p className="text-sm text-red-600 flex items-center">
                                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        Profile picture is required for registration
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {errors.profile && (
                                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                    <p className="text-sm text-red-600 flex items-center animate-pulse">
                                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {errors.profile}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={processing || formProgress < 100}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating account...
                                    </div>
                                ) : formProgress < 100 ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Complete all fields ({Math.round(formProgress)}%)
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Create Account
                                    </div>
                                )}
                            </button>
                            
                            {/* Form completion hint */}
                            {formProgress < 100 && formProgress > 0 && (
                                <p className="text-center text-sm text-gray-500 mt-2">
                                    {Math.round(formProgress)}% complete - Fill in all required fields to continue
                                </p>
                            )}
                        </div>
                    </form>
                    )}

                    {/* Footer */}
                    <div className="text-center mt-8 pt-6 border-t border-gray-200/50 relative z-10">
                        <p className="text-gray-600 text-sm">
                            Already have an account? <Link className="text-blue-600 hover:text-blue-700 font-medium transition-colors" href="/login">Sign in here</Link>
                        </p>
                        <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-400">
                            <span>Secure Registration</span>
                            <span>•</span>
                            <span>Email Verification</span>
                            <span>•</span>
                            <span>Privacy Protected</span>
                        </div>
                        <p className="text-gray-400 text-xs mt-3">© 2025 OCC Admission System. All rights reserved.</p>
                    </div>
                </div>
            </div>
            
            {/* Full Size Image Modal */}
            {showImageModal && profilePreview && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent backdrop-blur-sm"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowImageModal(false);
                        }
                    }}
                >
                    <div className="relative max-w-4xl max-h-full">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowImageModal(false)}
                            className="absolute -top-4 -right-4 z-10 bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        
                        {/* Image Container */}
                        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                            <img
                                src={profilePreview}
                                alt="Profile picture full view"
                                className="max-w-full max-h-[80vh] object-contain bg-white"
                                style={{ 
                                    minWidth: '200px',
                                    minHeight: '200px'
                                }}
                            />
                            
                            {/* Image Info */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                                <div className="text-white">
                                    <h3 className="text-lg font-semibold mb-1">Profile Picture Preview</h3>
                                    <p className="text-sm text-gray-300">This is how your profile picture will appear</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex justify-center space-x-4 mt-6">
                            <button
                                onClick={() => setShowImageModal(false)}
                                className="px-6 py-2 bg-white text-gray-800 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setShowImageModal(false);
                                    const fileInput = document.getElementById('profile');
                                    if (fileInput) {
                                        fileInput.click();
                                    }
                                }}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Change Picture
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
