import React, { useState } from 'react';
import { Link } from '@inertiajs/react';

export default function DownloadApk() {
    const [selectedQrCode, setSelectedQrCode] = useState(null);

    const handleDownloadClick = () => {
        // Open the Google Drive link in a new tab
        window.open('https://drive.google.com/drive/folders/14wSm_fuVevOOEMW03YxAo32B9QWWLVI_?usp=drive_linkv', '_blank');
    };

    const openQrModal = (qrType) => {
        setSelectedQrCode(qrType);
    };

    const closeQrModal = () => {
        setSelectedQrCode(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                {/* Download Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
                    <div className="p-6 lg:p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 mx-auto mb-4 transform transition-all duration-300 hover:scale-110">
                                <img 
                                    src="/OCC logo.png" 
                                    alt="OCC Logo" 
                                    className="w-full h-full object-contain drop-shadow-2xl"
                                />
                            </div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                                Download Mobile App
                            </h1>
                            <p className="text-gray-600 text-lg">
                                As a Student, You need to download the mobile app to Proceed
                            </p>
                        </div>

                        {/* Main Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            {/* Left Side - Instructions */}
                            <div className="space-y-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Instructions
                                    </h3>
                                    <ol className="space-y-3 text-blue-800">
                                        <li className="flex items-start">
                                            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">1</span>
                                            <span>Click the "Download APK" button below, Download the <strong>LATEST VERSION</strong>.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">2</span>
                                            <span>Allow installation from unknown sources in your device settings</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">3</span>
                                            <span>Install the APK file on your Android device <strong>(No iOS/Apple Support)</strong>.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">4</span>
                                            <span>Open the app and take your exam</span>
                                        </li>
                                    </ol>
                                </div>

                                {/* Download Button */}
                                <button
                                    onClick={handleDownloadClick}
                                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold py-4 px-8 rounded-lg hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-300 shadow-lg transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
                                >
                                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download APK
                                </button>

                                {/* Alternative QR Code Option */}
                                <div className="text-center">
                                    <p className="text-gray-600 text-sm mb-3">Or scan the QR code with your mobile device:</p>
                                </div>
                            </div>

                            {/* Right Side - QR Code */}
                            <div className="flex flex-col items-center space-y-6">
                                <div 
                                    className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-100 cursor-pointer hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:scale-105"
                                    onClick={() => openQrModal('main')}
                                >
                                    <img 
                                        src="/qr-code.png" 
                                        alt="QR Code for APK Download" 
                                        className="w-48 h-48 object-contain"
                                    />
                                    <p className="text-center text-xs text-gray-500 mt-2">Click to enlarge</p>
                                </div>
                                <p className="text-gray-600 text-sm text-center">
                                    Scan the QR code to download the mobile app
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                            <p className="text-gray-600 text-sm mb-4">
                                Having trouble downloading? Contact support for assistance.
                            </p>
                            <Link 
                                href="/login" 
                                className="text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium"
                            >
                                ← Back to Login
                            </Link>
                        </div>
                    </div>
                </div>

                {/* QR Code Modal */}
                {selectedQrCode && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-900">QR Code</h3>
                                <button
                                    onClick={closeQrModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 text-center">
                                <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-100 inline-block">
                                    <img 
                                        src="/qr-code.png"
                                        alt={`QR Code for APK Download`}
                                        className="w-80 h-80 object-contain mx-auto"
                                    />
                                </div>
                                
                                <div className="mt-6 space-y-3">
                                    <p className="text-gray-700 text-lg font-medium">
                                        Scan this QR code with your mobile device
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        This is the QR code for downloading the mobile app.
                                    </p>
                                    
                                    {/* Download Button in Modal */}
                                    <div className="mt-4">
                                        <button
                                            onClick={handleDownloadClick}
                                            className="bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-300 shadow-lg transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center mx-auto"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Download APK
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center">
                                <button
                                    onClick={closeQrModal}
                                    className="text-gray-600 hover:text-gray-800 transition-colors font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
