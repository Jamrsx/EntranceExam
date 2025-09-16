import React, { useEffect, useRef, useState } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function Verify() {
    const { props } = usePage();
    const prefillEmail = props?.email || '';

    const verifyForm = useForm({ email: prefillEmail, code: '' });
    const resendForm = useForm({ email: prefillEmail });

    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const inputsRef = useRef([]);

    useEffect(() => {
        verifyForm.setData('code', digits.join(''));
    }, [digits]);

    const handleDigitChange = (index, value) => {
        const v = (value || '').replace(/\D/g, '').slice(0, 1);
        const next = [...digits];
        next[index] = v;
        setDigits(next);
        if (v && inputsRef.current[index + 1]) {
            inputsRef.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (digits[index]) return; // clear current first
            if (inputsRef.current[index - 1]) {
                inputsRef.current[index - 1].focus();
            }
        }
        if (e.key === 'ArrowLeft' && inputsRef.current[index - 1]) {
            inputsRef.current[index - 1].focus();
        }
        if (e.key === 'ArrowRight' && inputsRef.current[index + 1]) {
            inputsRef.current[index + 1].focus();
        }
    };

    const handlePaste = (e) => {
        const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
        if (!text) return;
        e.preventDefault();
        const next = ['','','','','',''];
        for (let i = 0; i < text.length && i < 6; i++) next[i] = text[i];
        setDigits(next);
        const lastIndex = Math.min(text.length, 6) - 1;
        if (inputsRef.current[lastIndex]) inputsRef.current[lastIndex].focus();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3">
                        <img src="/OCC logo.png" alt="OCC Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900">Verify your email</h1>
                    <p className="text-gray-600 mt-1">Enter the 6-digit code sent to your email.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                    <form onSubmit={(e) => { e.preventDefault(); verifyForm.post('/register/verify'); }} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={verifyForm.data.email}
                                onChange={(e) => verifyForm.setData('email', e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                placeholder="your.email@gmail.com"
                                required
                            />
                            {verifyForm.errors.email && <p className="mt-2 text-sm text-red-600">{verifyForm.errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Code</label>
                            <div className="flex items-center justify-between gap-2" onPaste={handlePaste}>
                                {digits.map((d, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => (inputsRef.current[i] = el)}
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        type="text"
                                        value={d}
                                        onChange={(e) => handleDigitChange(i, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(i, e)}
                                        className="w-12 h-12 text-center text-lg bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                        maxLength={1}
                                        required
                                    />
                                ))}
                            </div>
                            {verifyForm.errors.code && <p className="mt-2 text-sm text-red-600">{verifyForm.errors.code}</p>}
                        </div>
                        <button
                            type="submit"
                            disabled={verifyForm.processing}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2.5 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50"
                        >
                            {verifyForm.processing ? 'Verifying…' : 'Verify and Complete Registration'}
                        </button>
                    </form>

                    <div className="mt-4 border-t pt-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Didn't receive a code?</span>
                            <button
                                type="button"
                                onClick={() => resendForm.post('/register/resend')}
                                disabled={resendForm.processing}
                                className="text-sm text-blue-600 hover:text-blue-700"
                            >
                                {resendForm.processing ? 'Resending…' : 'Resend Code'}
                            </button>
                        </div>
                        {resendForm.errors.registration && (
                            <p className="mt-2 text-sm text-red-600">{resendForm.errors.registration}</p>
                        )}
                        {resendForm.recentlySuccessful && (
                            <p className="mt-2 text-sm text-green-700">Verification code resent.</p>
                        )}
                    </div>

                    <div className="text-center mt-6">
                        <Link href="/register" className="text-sm text-gray-500 hover:text-gray-700">Back to Registration</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
