import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import QRCode from 'qrcode';

const ExamRegistrationManagement = ({ user, settings, registrations, schedules }) => {
    // Function to get current academic year (current year to next year)
    const getCurrentAcademicYear = () => {
        const currentYear = new Date().getFullYear();
        return `${currentYear}-${currentYear + 1}`;
    };

    // Check if registration should be automatically closed based on exam end date
    const shouldAutoCloseRegistration = () => {
        if (!settings.registration_open || !settings.exam_end_date) return false;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDate = new Date(settings.exam_end_date);
        endDate.setHours(23, 59, 59, 999);
        
        return today > endDate;
    };

    // Auto-close registration if exam period has ended
    React.useEffect(() => {
        if (shouldAutoCloseRegistration()) {
            console.log('[ExamRegistration] Auto-closing registration - exam period ended');
            router.put('/guidance/registration-settings', {
                ...settings,
                registration_open: false
            }, {
                onSuccess: () => {
                    console.log('[ExamRegistration] Registration auto-closed successfully');
                    window.showAlert('Registration automatically closed - exam period has ended', 'info');
                },
                onError: (errors) => {
                    console.warn('[ExamRegistration] Failed to auto-close registration', errors);
                }
            });
        }
    }, [settings.registration_open, settings.exam_end_date]);

    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [editingRegistration, setEditingRegistration] = useState(null);
    const [editingRegistrationData, setEditingRegistrationData] = useState(null);
    const [showEditRegistrationModal, setShowEditRegistrationModal] = useState(false);
    const [modalDateValue, setModalDateValue] = useState('');
    const [modalSessionValue, setModalSessionValue] = useState('');
    const [modalSaving, setModalSaving] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [scheduleFormData, setScheduleFormData] = useState({});
    const [registrationFilter, setRegistrationFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [tempDateValue, setTempDateValue] = useState('');
    const [tempSessionValue, setTempSessionValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [autoAssigningIds, setAutoAssigningIds] = useState([]);
    const [expandedDates, setExpandedDates] = useState({});
    // Bulk code generation modal state
    const [showBulkCodeModal, setShowBulkCodeModal] = useState(false);
    const [examSummaries, setExamSummaries] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState('');
    const [loadingExams, setLoadingExams] = useState(false);
    const [submittingBulk, setSubmittingBulk] = useState(false);
    // QR Code states
    const [qrCodeData, setQrCodeData] = useState({});
    const [showQrModal, setShowQrModal] = useState(false);
    const [selectedQrCode, setSelectedQrCode] = useState('');
    // Local copies for optimistic UI updates
    const [localSchedules, setLocalSchedules] = useState(schedules);
    const [localRegistrations, setLocalRegistrations] = useState(registrations);
    const [formData, setFormData] = useState({
        registration_open: settings.registration_open,
        academic_year: settings.academic_year || getCurrentAcademicYear(),
        semester: settings.semester || '1st',
        exam_start_date: settings.exam_start_date,
        exam_end_date: settings.exam_end_date,
        students_per_day: settings.students_per_day,
        registration_message: settings.registration_message || ''
    });

    // Keep local copies in sync with server-provided props
    React.useEffect(() => {
        setLocalSchedules(schedules);
        setLocalRegistrations(registrations);
    }, [schedules, registrations]);

    // Generate QR code for exam codes
    const generateQRCode = async (examCode) => {
        try {
            if (qrCodeData[examCode]) {
                return qrCodeData[examCode];
            }
            const qrDataURL = await QRCode.toDataURL(examCode, {
                width: 120,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            setQrCodeData(prev => ({ ...prev, [examCode]: qrDataURL }));
            return qrDataURL;
        } catch (error) {
            console.error('Error generating QR code:', error);
            return null;
        }
    };

    // Show QR code modal
    const showQRCodeModal = async (examCode) => {
        const qrDataURL = await generateQRCode(examCode);
        if (qrDataURL) {
            setSelectedQrCode(qrDataURL);
            setShowQrModal(true);
        }
    };

    // Update form data when settings change (e.g., after auto-close)
    React.useEffect(() => {
        setFormData({
            registration_open: settings.registration_open,
            academic_year: settings.academic_year || getCurrentAcademicYear(),
            semester: settings.semester || '1st',
            exam_start_date: settings.exam_start_date,
            exam_end_date: settings.exam_end_date,
            students_per_day: settings.students_per_day,
            registration_message: settings.registration_message || ''
        });
    }, [settings]);

    const handleSettingsSubmit = (e) => {
        e.preventDefault();
        
        // Additional validation for date logic
        if (formData.registration_open && formData.exam_start_date && formData.exam_end_date) {
            const startDate = new Date(formData.exam_start_date);
            const endDate = new Date(formData.exam_end_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (startDate < today) {
                window.showAlert('Exam start date cannot be in the past', 'error');
                return;
            }
            
            if (endDate < startDate) {
                window.showAlert('Exam end date must be on or after the start date', 'error');
                return;
            }
        }
        
        router.put('/guidance/registration-settings', formData, {
            onSuccess: () => {
                setShowSettingsModal(false);
                window.showAlert('Registration settings updated successfully', 'success');
            },
            onError: (errors) => {
                window.showAlert('Failed to update settings', 'error');
            }
        });
    };



    const handleDateChange = (registrationId, newDate, newSession) => {
        console.log('[ExamRegistration] handleDateChange', { registrationId, newDate, newSession });

        if (!newSession) {
            window.showAlert('Please select a session (Morning or Afternoon)', 'error');
            return;
        }

        // Frontend validation: ensure date is within configured window
        if (settings.exam_start_date && settings.exam_end_date) {
            const withinWindow = isWithinRegistrationWindow(newDate);
            if (!withinWindow) {
                window.showAlert('Selected date is outside the registration window.', 'error');
                return;
            }
        }

        // Prevent assigning a past date
        const today = getTodayStart();
        const picked = new Date(newDate);
        picked.setHours(0, 0, 0, 0);
        if (picked < today) {
            window.showAlert('Cannot assign a date in the past.', 'error');
            return;
        }

        // Validate against schedule capacity/closure if a schedule exists for that date and session
        const scheduleForDateAndSession = getScheduleForDateAndSession(newDate, newSession);
        if (scheduleForDateAndSession) {
            if (scheduleForDateAndSession.status === 'closed') {
                window.showAlert('Selected session is closed for scheduling.', 'error');
                return;
            }
            if (isScheduleFull(scheduleForDateAndSession)) {
                window.showAlert('Selected session is already full. Please choose another session.', 'error');
                return;
            }
        }

        setIsSaving(true);
        const prevRegistration = localRegistrations?.data?.find((r) => r.id === registrationId);
        const previousDate = prevRegistration?.assigned_exam_date || null;
        const previousSession = prevRegistration?.assigned_session || null;
        router.put(`/guidance/update-exam-date/${registrationId}`, {
            assigned_exam_date: newDate,
            assigned_session: newSession
        }, {
            onSuccess: () => {
                setEditingRegistration(null);
                setTempDateValue('');
                setTempSessionValue('');
                setIsSaving(false);
                console.log('[ExamRegistration] handleDateChange success');
                window.showAlert('Exam date updated successfully', 'success');

                // Optimistically update local registrations list
                setLocalRegistrations((prev) => {
                    if (!prev || !prev.data) return prev;
                    const updatedData = prev.data.map((reg) => {
                        if (reg.id === registrationId) {
                            return { ...reg, assigned_exam_date: newDate, assigned_session: newSession, status: 'assigned' };
                        }
                        return reg;
                    });
                    return { ...prev, data: updatedData };
                });

                // Optimistically adjust schedule counts
                if ((previousDate && previousDate !== newDate) || (previousSession && previousSession !== newSession)) {
                    setLocalSchedules((prev) => {
                        if (!prev || typeof prev !== 'object') return prev;
                        
                        // Handle grouped schedules (object with date keys)
                        if (!Array.isArray(prev)) {
                            const newSchedules = { ...prev };
                            
                            // Decrement old date/session
                            if (previousDate && previousSession && newSchedules[previousDate]) {
                                newSchedules[previousDate] = newSchedules[previousDate].map(s => {
                                    if (s.session === previousSession) {
                                        const dec = Math.max(0, (s.current_registrations || 0) - 1);
                                        return { ...s, current_registrations: dec, status: dec >= s.max_capacity ? 'full' : (s.status === 'closed' ? 'closed' : 'open') };
                                    }
                                    return s;
                                });
                            }
                            
                            // Increment new date/session
                            if (newSchedules[newDate]) {
                                newSchedules[newDate] = newSchedules[newDate].map(s => {
                                    if (s.session === newSession) {
                                        const inc = (s.current_registrations || 0) + 1;
                                        const status = inc >= s.max_capacity ? 'full' : (s.status === 'closed' ? 'closed' : 'open');
                                        return { ...s, current_registrations: inc, status };
                                    }
                                    return s;
                                });
                            }
                            
                            return newSchedules;
                        }
                        
                        // Handle flat array of schedules (legacy)
                        return prev.map((s) => {
                            // Decrement old date/session
                            if (s.exam_date === previousDate && s.session === previousSession) {
                                const dec = Math.max(0, (s.current_registrations || 0) - 1);
                                return { ...s, current_registrations: dec, status: dec >= s.max_capacity ? 'full' : (s.status === 'closed' ? 'closed' : 'open') };
                            }
                            // Increment new date/session
                            if (s.exam_date === newDate && s.session === newSession) {
                                const inc = (s.current_registrations || 0) + 1;
                                const status = inc >= s.max_capacity ? 'full' : (s.status === 'closed' ? 'closed' : 'open');
                                return { ...s, current_registrations: inc, status };
                            }
                            return s;
                        });
                    });
                }
            },
            onError: (errors) => {
                const errorMessage = errors.error || 'Failed to update exam date';
                setIsSaving(false);
                console.warn('[ExamRegistration] handleDateChange error', errors);
                window.showAlert(errorMessage, 'error');
            }
        });
    };

    const handleSaveDate = (registrationId) => {
        if (!tempDateValue) {
            window.showAlert('Please select a valid date', 'error');
            return;
        }
        if (!tempSessionValue) {
            window.showAlert('Please select a session', 'error');
            return;
        }
        handleDateChange(registrationId, tempDateValue, tempSessionValue);
    };

    // Modal variant
    const handleSaveDateFromModal = (registrationId) => {
        if (!modalDateValue) {
            window.showAlert('Please select a valid date', 'error');
            return;
        }
        if (!modalSessionValue) {
            window.showAlert('Please select a session', 'error');
            return;
        }
        setModalSaving(true);
        handleDateChange(registrationId, modalDateValue, modalSessionValue);
        setModalSaving(false);
        setShowEditRegistrationModal(false);
    };

    const handleCancelEdit = () => {
        setEditingRegistration(null);
        setTempDateValue('');
        setTempSessionValue('');
        setIsSaving(false);
    };

    const handleStartEdit = (registration) => {
        setEditingRegistration(registration.id);
        setEditingRegistrationData(registration);
        setTempDateValue(registration.assigned_exam_date || '');
        setTempSessionValue(registration.assigned_session || '');
        setModalDateValue(registration.assigned_exam_date || '');
        setModalSessionValue(registration.assigned_session || '');
        setShowEditRegistrationModal(true);
    };

    const handleScheduleEdit = (schedule) => {
        setEditingSchedule(schedule.id);
        setScheduleFormData({
            exam_date: schedule.exam_date,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            max_capacity: schedule.max_capacity,
            status: schedule.status
        });
    };

    const handleScheduleUpdate = (scheduleId) => {
        router.put(`/guidance/update-exam-schedule/${scheduleId}`, scheduleFormData, {
            onSuccess: () => {
                setEditingSchedule(null);
                setScheduleFormData({});
                window.showAlert('Exam schedule updated successfully', 'success');
            },
            onError: (errors) => {
                window.showAlert('Failed to update exam schedule', 'error');
            }
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'registered': return 'bg-blue-100 text-blue-800';
            case 'assigned': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getScheduleStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-green-100 text-green-800';
            case 'full': return 'bg-red-100 text-red-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not assigned';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        
        // Handle HH:MM:SS format
        if (typeof timeString === 'string' && timeString.includes(':')) {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours);
            const minute = parseInt(minutes);
            
            if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
                const time = new Date();
                time.setHours(hour, minute, 0);
                return time.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
            }
        }
        
        return 'Invalid Time';
    };

    const isWeekend = (dateString) => {
        const date = new Date(dateString);
        return date.getDay() === 0 || date.getDay() === 6; // Sunday = 0, Saturday = 6
    };

    const isScheduleFull = (schedule) => {
        return schedule.current_registrations >= schedule.max_capacity;
    };

    // Validation helpers and auto-assign computation
    const isWithinRegistrationWindow = (dateString) => {
        if (!settings.exam_start_date || !settings.exam_end_date) return true;
        const candidate = new Date(dateString);
        const start = new Date(settings.exam_start_date);
        const end = new Date(settings.exam_end_date);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return candidate >= start && candidate <= end;
    };

    const getScheduleForDate = (dateString) => {
        // Handle grouped schedules
        if (localSchedules && !Array.isArray(localSchedules)) {
            return localSchedules[dateString] || [];
        }
        // Handle flat array (legacy)
        return localSchedules?.filter((s) => s.exam_date === dateString) || [];
    };

    const getScheduleForDateAndSession = (dateString, session) => {
        // Handle grouped schedules
        if (localSchedules && !Array.isArray(localSchedules)) {
            const dateSchedules = localSchedules[dateString] || [];
            return dateSchedules.find((s) => s.session === session);
        }
        // Handle flat array (legacy)
        return localSchedules?.find((s) => s.exam_date === dateString && s.session === session);
    };

    const formatYYYYMMDD = (date) => {
        const d = new Date(date);
        const iso = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString();
        return iso.split('T')[0];
    };

    const getTodayStart = () => {
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        return t;
    };

    const getMinAssignableDateYMD = () => {
        const today = getTodayStart();
        let min = today;
        if (settings.exam_start_date) {
            const start = new Date(settings.exam_start_date);
            start.setHours(0, 0, 0, 0);
            if (start > min) min = start;
        }
        return formatYYYYMMDD(min);
    };

    const getNextBusinessDay = (date) => {
        const d = new Date(date);
        while (d.getDay() === 0 || d.getDay() === 6) {
            d.setDate(d.getDate() + 1);
        }
        return d;
    };

    const clampToStartWindow = (date) => {
        const today = getTodayStart();
        let clamped = date;
        if (settings.exam_start_date) {
            const start = new Date(settings.exam_start_date);
            if (clamped < start) clamped = start;
        }
        if (clamped < today) clamped = today;
        return clamped;
    };

    const computeAutoAssignDate = (registration) => {
        console.log('[ExamRegistration] computeAutoAssignDate -> registrationId:', registration.id);

        // Determine search window
        const startWindow = settings.exam_start_date ? new Date(settings.exam_start_date) : null;
        const endWindow = settings.exam_end_date ? new Date(settings.exam_end_date) : null;

        // Base candidate: registration_date + 2 days
        let candidate = new Date(registration.registration_date);
        candidate.setHours(0, 0, 0, 0);
        candidate.setDate(candidate.getDate() + 2);

        // If it lands on weekend, roll to Monday
        candidate = getNextBusinessDay(candidate);

        // Do not assign before today
        const today = getTodayStart();
        if (candidate < today) candidate = today;

        // Respect exam start date (if configured)
        if (startWindow && candidate < startWindow) {
            candidate = new Date(startWindow);
            candidate = getNextBusinessDay(candidate);
        }

        // Iterate forward until a valid open & not-full schedule date is found
        for (let i = 0; i < 366; i++) { // 1-year safety cap
            const ymd = formatYYYYMMDD(candidate);

            // Respect configured window (if present) and skip weekends
            if ((!startWindow || candidate >= startWindow) && (!endWindow || candidate <= endWindow) && !isWeekend(ymd)) {
                const schedule = getScheduleForDate(ymd);

                // Only allow dates with an existing schedule that is open and not full
                if (schedule && schedule.status === 'open' && !isScheduleFull(schedule)) {
                    console.log('[ExamRegistration] computeAutoAssignDate -> chosen:', ymd);
                    return ymd;
                }
            }

            // Move to next day and continue
            candidate.setDate(candidate.getDate() + 1);
            if (endWindow && candidate > endWindow) break;
        }

        console.warn('[ExamRegistration] computeAutoAssignDate -> no valid date found');
        return null;
    };

    const handleAutoAssign = async (registration) => {
        console.log('[ExamRegistration] handleAutoAssign clicked', registration.id);
        setAutoAssigningIds((prev) => [...prev, registration.id]);
        try {
            const autoDate = computeAutoAssignDate(registration);
            if (!autoDate) {
                window.showAlert('No available dates within the registration window or schedules are full/closed.', 'error');
                return;
            }
            console.log('[ExamRegistration] auto computed date', autoDate);
            handleDateChange(registration.id, autoDate);
        } finally {
            setAutoAssigningIds((prev) => prev.filter((id) => id !== registration.id));
        }
    };

    const getFilteredRegistrations = () => {
        if (!localRegistrations || !localRegistrations.data) return [];

        let data = localRegistrations.data;
        // Apply status filter
        if (registrationFilter === 'assigned') {
            data = data.filter((r) => r.status === 'assigned');
        } else if (registrationFilter === 'not_assigned') {
            data = data.filter((r) => r.status === 'registered');
        }
        // Apply search filter
        const q = searchQuery.trim().toLowerCase();
        if (q) {
            data = data.filter((r) => {
                const name = r.examinee?.user?.username || '';
                const school = r.examinee?.school_name || '';
                const session = r.assigned_session || '';
                const status = r.status || '';
                return (
                    name.toLowerCase().includes(q) ||
                    school.toLowerCase().includes(q) ||
                    session.toLowerCase().includes(q) ||
                    status.toLowerCase().includes(q)
                );
            });
        }
        return data;
    };

    return (
        <Layout user={user}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className={`mb-8 rounded-lg p-6 text-white animate-fadeIn ${
                    settings.registration_open 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                        : 'bg-gradient-to-r from-orange-600 to-red-600'
                }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Exam Registration Management</h1>
                            <p className={`mt-2 ${
                                settings.registration_open 
                                    ? 'text-green-100' 
                                    : 'text-orange-100'
                            }`}>Manage exam registration settings and view examinee registrations</p>
                            {shouldAutoCloseRegistration() && (
                                <div className="mt-2 p-2 bg-yellow-500 bg-opacity-20 rounded border border-yellow-300">
                                    <div className="flex items-center justify-between">
                                        <p className="text-yellow-100 text-sm flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.502 1.732 2.5z" />
                                            </svg>
                                            Registration and schedules will be automatically closed - exam period ended on {formatDate(settings.exam_end_date)}
                                        </p>
                                        <button
                                            onClick={() => {
                                                console.log('[ExamRegistration] Manually triggering auto-close');
                                                router.post('/guidance/trigger-auto-close', {}, {
                                                    onSuccess: () => {
                                                        console.log('[ExamRegistration] Manual auto-close triggered successfully');
                                                        window.showAlert('Auto-close check completed successfully', 'success');
                                                    },
                                                    onError: (errors) => {
                                                        console.warn('[ExamRegistration] Manual auto-close failed', errors);
                                                        window.showAlert('Failed to trigger auto-close', 'error');
                                                    }
                                                });
                                            }}
                                            className="text-yellow-100 hover:text-yellow-200 text-xs font-medium px-2 py-1 border border-yellow-300 rounded hover:bg-yellow-500 hover:bg-opacity-20 transition-colors"
                                        >
                                            Force Close Now
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div className="mt-4 flex items-center space-x-6">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm">Registration: {settings.registration_open ? 'OPEN' : 'CLOSED'}</span>
                                </div>
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                    </svg>
                                    <span className="text-sm">Total: {localRegistrations?.total || localRegistrations?.data?.length || 0} registrations</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right hidden md:block">
                            <div className="text-2xl font-bold">{settings.students_per_day}</div>
                            <div className={settings.registration_open ? 'text-green-100' : 'text-orange-100'}>Per Day Limit</div>
                        </div>
                    </div>
                </div>

                {/* Assignment Logic Info */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6 shadow-lg animate-fadeIn">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-blue-900">Automatic Assignment Logic</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-blue-800 text-sm">Students are automatically assigned 2 days after their registration date</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-blue-800 text-sm">Weekends (Saturday/Sunday) are automatically skipped</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-blue-800 text-sm">Assignment is based on the actual registration date stored in database</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-blue-800 text-sm">Exam time: 8:00 AM - 4:00 PM (configurable)</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-blue-800 text-sm">Guidance counselors can manually adjust dates for holidays</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-blue-800 text-sm">Example: Register on Aug 8 → Assigned to Aug 11 (skipping weekend)</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-blue-800 text-sm"><strong>Capacity Protection:</strong> Students cannot be assigned to full schedules</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-blue-800 text-sm"><strong>Auto-retry:</strong> If a date is full, the system tries the next available date</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Registration Status */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-l-4 border-orange-500 animate-fadeIn">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">Registration Status</h2>
                        </div>
                        <button
                            onClick={() => {
                                // Reset form data to current settings when opening modal
                                setFormData({
                                    registration_open: settings.registration_open,
                                    academic_year: settings.academic_year || getCurrentAcademicYear(),
                                    semester: settings.semester || '1st',
                                    exam_start_date: settings.exam_start_date,
                                    exam_end_date: settings.exam_end_date,
                                    students_per_day: settings.students_per_day,
                                    registration_message: settings.registration_message || ''
                                });
                                setShowSettingsModal(true);
                            }}
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg text-white ${
                                settings.registration_open 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : 'bg-orange-600 hover:bg-orange-700'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Edit Settings
                            </span>
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200 hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">Registration Status</h3>
                                <div className={`w-3 h-3 rounded-full ${settings.registration_open ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            </div>
                            <p className={`text-2xl font-bold ${settings.registration_open ? 'text-green-600' : 'text-red-600'}`}>
                                {settings.registration_open ? 'OPEN' : 'CLOSED'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Current status</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">Total Registrations</h3>
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">{registrations.total || 0}</p>
                            <p className="text-xs text-gray-500 mt-1">Students registered</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-lg border border-purple-200 hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">Examinees Per Day</h3>
                                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-2xl font-bold text-purple-600">{settings.students_per_day}</p>
                            <p className="text-xs text-gray-500 mt-1">Daily capacity</p>
                        </div>
                    </div>

                    {settings.registration_message && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                                <h3 className="font-semibold text-blue-900">Registration Message</h3>
                            </div>
                            <p className="text-blue-800 ml-7">{settings.registration_message}</p>
                        </div>
                    )}
                </div>





                {/* Exam Schedules */}
                <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">Exam Schedules</h3>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        router.post('/guidance/sync-schedule-counts', {}, {
                                            onSuccess: () => {
                                                window.showAlert('Schedule counts synchronized successfully', 'success');
                                            },
                                            onError: (errors) => {
                                                window.showAlert('Failed to sync schedule counts', 'error');
                                            }
                                        });
                                    }}
                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                    title="Sync schedule counts with database"
                                >
                                    Sync Counts
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!settings.exam_start_date || !settings.exam_end_date) {
                                            window.showAlert('Please set exam period first.', 'error');
                                            return;
                                        }
                                        try {
                                            setShowBulkCodeModal(true);
                                            setLoadingExams(true);
                                            setSelectedExamId('');
                                            const res = await fetch('/guidance/exams/summaries', { headers: { 'Accept': 'application/json' } });
                                            if (!res.ok) throw new Error('Failed to load exams');
                                            const json = await res.json();
                                            setExamSummaries(Array.isArray(json.data) ? json.data : []);
                                        } catch (e) {
                                            console.warn('[ExamRegistration] load exams failed', e);
                                            window.showAlert('Failed to load exams. Please try again.', 'error');
                                            setShowBulkCodeModal(false);
                                        } finally {
                                            setLoadingExams(false);
                                        }
                                    }}
                                    className="px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700 transition-colors"
                                    title="Generate exam codes for all dates in the period"
                                >
                                    Generate All Codes
                                </button>
                                {settings.exam_start_date && settings.exam_end_date && (
                                    <div className="text-xs text-gray-500">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Exam period: {formatDate(settings.exam_start_date)} — {formatDate(settings.exam_end_date)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {localSchedules && typeof localSchedules === 'object' && Object.keys(localSchedules).map((examDate) => {
                                    const dateSchedules = localSchedules[examDate] || [];
                                    const isExpandedDate = expandedDates[examDate];
                                    const totalRegistered = dateSchedules.reduce((sum, s) => sum + (s.current_registrations || 0), 0);
                                    const totalCapacity = dateSchedules.reduce((sum, s) => sum + (s.max_capacity || 0), 0);
                                    
                                    return [
                                        // Date header row (expandable)
                                        <tr key={`date-${examDate}`} className={`cursor-pointer hover:bg-gray-50 ${isWeekend(examDate) ? 'bg-red-50' : ''}`}
                                            onClick={() => setExpandedDates(prev => ({...prev, [examDate]: !prev[examDate]}))}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                <div className="flex items-center">
                                                    <svg className={`w-4 h-4 mr-2 transition-transform ${isExpandedDate ? 'rotate-90' : ''}`} 
                                                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                    {formatDate(examDate)}
                                                    {/* Date-level exam code display (from first session) */}
                                                    {(() => {
                                                        const code = (dateSchedules[0]?.exam_code) || '';
                                                        return (
                                                            <span className="ml-3 inline-flex items-center gap-2 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A2 2 0 012 15.382V6.618a2 2 0 011.553-1.894L9 2m0 18l6-3m-6 3V2m6 15l5.447 2.724A2 2 0 0022 18.618V9.382a2 2 0 00-1.553-1.894L15 6m0 11V6m0 0L9 3" />
                                                                </svg>
                                                                {code ? code : 'No code'}
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        router.post('/guidance/generate-schedule-code', { exam_date: examDate }, {
                                                                            onSuccess: () => {
                                                                                window.showAlert('Exam code generated for this date.', 'success');
                                                                            },
                                                                            onError: () => {
                                                                                window.showAlert('Failed to generate exam code.', 'error');
                                                                            }
                                                                        });
                                                                    }}
                                                                    className="ml-2 text-emerald-700 hover:text-emerald-900"
                                                                    title={code ? 'Regenerate code' : 'Generate code'}
                                                                >
                                                                    {code ? 'Regenerate' : 'Generate'}
                                                                </button>
                                                                {code && (
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                navigator.clipboard.writeText(code);
                                                                                window.showAlert('Code copied to clipboard', 'success');
                                                                            }}
                                                                            className="text-emerald-700 hover:text-emerald-900"
                                                                            title="Copy code"
                                                                        >
                                                                            Copy
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                showQRCodeModal(code);
                                                                            }}
                                                                            className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md"
                                                                            title="Show QR Code"
                                                                        >
                                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                                            </svg>
                                                                            QR
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </span>
                                                        );
                                                    })()}
                                                    {isWeekend(examDate) && (
                                                        <span className="ml-2 text-xs text-red-600 font-medium">(Weekend)</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {dateSchedules.length} sessions
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                Full Day
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {totalCapacity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={totalRegistered >= totalCapacity ? 'text-red-600 font-semibold' : ''}>
                                                    {totalRegistered}
                                                </span>
                                                {totalRegistered >= totalCapacity && (
                                                    <span className="ml-1 text-xs text-red-500">(FULL)</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-xs text-gray-400">Click to expand</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className="text-xs text-gray-400">Sessions</span>
                                            </td>
                                        </tr>,
                                        // Session rows (shown when expanded)
                                        ...(isExpandedDate ? dateSchedules.map((schedule) => (
                                            <tr key={`session-${schedule.id}`} className="bg-gray-25 border-l-4 border-blue-200">
                                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 pl-12">
                                                    {editingSchedule === schedule.id ? (
                                                        <input
                                                            type="date"
                                                            value={scheduleFormData.exam_date}
                                                            min={new Date().toISOString().split('T')[0]}
                                                            onChange={(e) => setScheduleFormData({...scheduleFormData, exam_date: e.target.value})}
                                                            className="border border-gray-300 rounded px-2 py-1 text-sm w-32"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-600">└ {formatDate(schedule.exam_date)}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                        schedule.session === 'morning' 
                                                            ? 'bg-yellow-100 text-yellow-800' 
                                                            : 'bg-orange-100 text-orange-800'
                                                    }`}>
                                                        {schedule.session === 'morning' ? '🌅 Morning' : '🌅 Afternoon'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    {editingSchedule === schedule.id ? (
                                                        <div className="space-y-1">
                                                            <input
                                                                type="time"
                                                                value={scheduleFormData.start_time}
                                                                onChange={(e) => setScheduleFormData({...scheduleFormData, start_time: e.target.value})}
                                                                className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
                                                            />
                                                            <span className="text-xs text-gray-400">to</span>
                                                            <input
                                                                type="time"
                                                                value={scheduleFormData.end_time}
                                                                onChange={(e) => setScheduleFormData({...scheduleFormData, end_time: e.target.value})}
                                                                className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
                                                            />
                                                        </div>
                                                    ) : (
                                                        formatTime(schedule.start_time) + ' - ' + formatTime(schedule.end_time)
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    {editingSchedule === schedule.id ? (
                                                        <input
                                                            type="number"
                                                            value={scheduleFormData.max_capacity}
                                                            onChange={(e) => setScheduleFormData({...scheduleFormData, max_capacity: parseInt(e.target.value)})}
                                                            className="border border-gray-300 rounded px-2 py-1 text-sm w-16"
                                                            min="1"
                                                            max="100"
                                                        />
                                                    ) : (
                                                        schedule.max_capacity
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    <span className={isScheduleFull(schedule) ? 'text-red-600 font-semibold' : ''}>
                                                        {schedule.current_registrations}
                                                    </span>
                                                    {isScheduleFull(schedule) && (
                                                        <span className="ml-1 text-xs text-red-500">(FULL)</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap">
                                                    {editingSchedule === schedule.id ? (
                                                        <select
                                                            value={scheduleFormData.status}
                                                            onChange={(e) => setScheduleFormData({...scheduleFormData, status: e.target.value})}
                                                            className="border border-gray-300 rounded px-2 py-1 text-xs"
                                                        >
                                                            <option value="open">Open</option>
                                                            <option value="full">Full</option>
                                                            <option value="closed">Closed</option>
                                                        </select>
                                                    ) : (
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScheduleStatusColor(schedule.status)}`}>
                                                            {schedule.status}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    {editingSchedule === schedule.id ? (
                                                        <div className="space-x-1">
                                                            <button
                                                                onClick={() => handleScheduleUpdate(schedule.id)}
                                                                className="text-green-600 hover:text-green-800 text-xs font-medium"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingSchedule(null);
                                                                    setScheduleFormData({});
                                                                }}
                                                                className="text-red-600 hover:text-red-800 text-xs font-medium"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleScheduleEdit(schedule)}
                                                            className="text-blue-600 hover:text-blue-800 text-xs"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : [])
                                    ];
                                }).flat()}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Examinee Registrations */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <h3 className="text-lg font-medium text-gray-900">Examinee Registrations</h3>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search name, school, session, status..."
                                        className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <label className="text-sm font-medium text-gray-700">Filter:</label>
                                    <select
                                        value={registrationFilter}
                                        onChange={(e) => setRegistrationFilter(e.target.value)}
                                        className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">All</option>
                                        <option value="assigned">Assigned</option>
                                        <option value="not_assigned">Not Assigned</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-2 bg-gray-50 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <p className="text-sm text-gray-600">
                                Showing {getFilteredRegistrations().length} of {localRegistrations?.data?.length || 0} registrations
                            </p>
                            <div className="text-xs">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {settings.exam_start_date && settings.exam_end_date
                                        ? `Registration window: ${formatDate(settings.exam_start_date)} — ${formatDate(settings.exam_end_date)}`
                                        : 'Registration window not configured'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {getFilteredRegistrations().length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            <p>No registrations found matching the current filter.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    getFilteredRegistrations().map((registration) => (
                                        <tr key={registration.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {registration.examinee?.user?.username || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {registration.examinee?.school_name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(registration.registration_date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button 
                                                className="text-left hover:text-blue-600"
                                                onClick={() => handleStartEdit(registration)}
                                                title="Click to assign exam date manually"
                                            >
                                                <div>{formatDate(registration.assigned_exam_date)}</div>
                                                {registration.assigned_session && (
                                                    <div className={`text-xs mt-1 inline-flex px-2 py-1 rounded-full ${
                                                        registration.assigned_session === 'morning' 
                                                            ? 'bg-yellow-100 text-yellow-800' 
                                                            : 'bg-orange-100 text-orange-800'
                                                    }`}>
                                                        {registration.assigned_session === 'morning' ? '🌅 Morning' : '🌇 Afternoon'}
                                                    </div>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(registration.status)}`}>
                                                {registration.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleAutoAssign(registration)}
                                                    className="text-green-600 hover:text-green-800 text-xs disabled:opacity-60"
                                                    disabled={autoAssigningIds.includes(registration.id)}
                                                    title="Automatically assign the next available valid date"
                                                >
                                                    {autoAssigningIds.includes(registration.id) ? 'Assigning…' : 'Assign Automatically'}
                                                </button>
                                                <button
                                                    onClick={() => handleStartEdit(registration)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Edit assigned date/session"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M4 13.5V20h6.5L20 10.5l-6.5-6.5L4 13.5z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            {showSettingsModal && (
                <div className="fixed inset-0 overflow-y-auto h-full w-full z-50 pointer-events-none bg-clear bg-opacity-20 backdrop-blur-sm">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-2xl rounded-lg bg-white pointer-events-auto animate-fadeIn">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Update Registration Settings
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowSettingsModal(false);
                                        // Reset form data when closing modal
                                        setFormData({
                                            registration_open: settings.registration_open,
                                            academic_year: settings.academic_year || getCurrentAcademicYear(),
                                            semester: settings.semester || '1st',
                                            exam_start_date: settings.exam_start_date,
                                            exam_end_date: settings.exam_end_date,
                                            students_per_day: settings.students_per_day,
                                            registration_message: settings.registration_message || ''
                                        });
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <form onSubmit={handleSettingsSubmit} className="space-y-6">
                                {/* Toggle Switch for Open Registration */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label htmlFor="registration_open" className="text-sm font-medium text-gray-700">
                                            Open Registration
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Allow students to register for exams
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="registration_open"
                                            checked={formData.registration_open}
                                            onChange={(e) => setFormData({...formData, registration_open: e.target.checked})}
                                            className="sr-only peer"
                                        />
                                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                    </label>
                                </div>

                                {/* Academic Year and Semester */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Academic Year
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.academic_year}
                                            onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                                            className={`w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-4 transition-all duration-200 ${
                                                formData.registration_open 
                                                    ? 'focus:ring-green-100 focus:border-green-500' 
                                                    : 'focus:ring-orange-100 focus:border-orange-500'
                                            }`}
                                            placeholder="e.g., 2025-2026"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Semester
                                        </label>
                                        <select
                                            value={formData.semester}
                                            onChange={(e) => setFormData({...formData, semester: e.target.value})}
                                            className={`w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-4 transition-all duration-200 ${
                                                formData.registration_open 
                                                    ? 'focus:ring-green-100 focus:border-green-500' 
                                                    : 'focus:ring-orange-100 focus:border-orange-500'
                                            }`}
                                            required
                                        >
                                            <option value="1st">1st Semester</option>
                                            <option value="2nd">2nd Semester</option>
                                            <option value="Summer">Summer</option>
                                        </select>
                                    </div>
                                </div>

                                {formData.registration_open && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Exam Start Date
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.exam_start_date}
                                                min={new Date().toISOString().split('T')[0]}
                                                onChange={(e) => setFormData({...formData, exam_start_date: e.target.value})}
                                                className="w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Exam End Date
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.exam_end_date}
                                                min={new Date().toISOString().split('T')[0]}
                                                onChange={(e) => setFormData({...formData, exam_end_date: e.target.value})}
                                                className="w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Examinees Per Day
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.students_per_day}
                                        onChange={(e) => setFormData({...formData, students_per_day: parseInt(e.target.value)})}
                                        className={`w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-4 transition-all duration-200 ${
                                            formData.registration_open 
                                                ? 'focus:ring-green-100 focus:border-green-500' 
                                                : 'focus:ring-orange-100 focus:border-orange-500'
                                        }`}
                                        min="1"
                                        max="100"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Registration Message (Optional)
                                    </label>
                                    <textarea
                                        value={formData.registration_message}
                                        onChange={(e) => setFormData({...formData, registration_message: e.target.value})}
                                        className={`w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-4 transition-all duration-200 ${
                                            formData.registration_open 
                                                ? 'focus:ring-green-100 focus:border-green-500' 
                                                : 'focus:ring-orange-100 focus:border-orange-500'
                                        }`}
                                        rows="3"
                                        placeholder="Enter a message to display to students during registration..."
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowSettingsModal(false);
                                            // Reset form data when canceling
                                            setFormData({
                                                registration_open: settings.registration_open,
                                                exam_start_date: settings.exam_start_date,
                                                exam_end_date: settings.exam_end_date,
                                                students_per_day: settings.students_per_day,
                                                registration_message: settings.registration_message || ''
                                            });
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={`px-4 py-2 text-white rounded-md transition-colors duration-200 ${
                                            formData.registration_open 
                                                ? 'bg-green-600 hover:bg-green-700' 
                                                : 'bg-orange-600 hover:bg-orange-700'
                                        }`}
                                    >
                                        Update Settings
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Registration Modal */}
            {showEditRegistrationModal && (
                <div className="fixed inset-0 bg-clear bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-none">
                    <div className="mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-2xl rounded-lg bg-white pointer-events-auto animate-fadeIn">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
                                    {(editingRegistrationData?.examinee?.user?.username || 'NA').slice(0,1)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Update Examinee Schedule</h3>
                                    <p className="text-xs text-gray-500">{editingRegistrationData?.examinee?.user?.username || 'Unknown'} • {editingRegistrationData?.examinee?.school_name || '—'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowEditRegistrationModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Date</label>
                                <input
                                    type="date"
                                    value={modalDateValue}
                                    min={getMinAssignableDateYMD()}
                                    max={settings.exam_end_date || undefined}
                                    onChange={(e) => setModalDateValue(e.target.value)}
                                    className="w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Session</label>
                                <select
                                    value={modalSessionValue}
                                    onChange={(e) => setModalSessionValue(e.target.value)}
                                    className="w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                                >
                                    <option value="">Select Session</option>
                                    <option value="morning">Morning (8:00 AM - 11:00 AM)</option>
                                    <option value="afternoon">Afternoon (1:00 PM - 4:00 PM)</option>
                                </select>
                            </div>
                        </div>

                        {settings.exam_start_date && settings.exam_end_date && (
                            <p className="text-xs text-gray-500 mt-3">Allowed window: <span className="font-semibold">{formatDate(settings.exam_start_date)} — {formatDate(settings.exam_end_date)}</span>. Past dates are disabled.</p>
                        )}

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setShowEditRegistrationModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSaveDateFromModal(editingRegistration)}
                                disabled={modalSaving}
                                className={`px-4 py-2 text-white rounded-md transition-colors duration-200 ${modalSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {modalSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Generate Codes Modal */}
            {showBulkCodeModal && (
                <div className="fixed inset-0 bg-clear bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-none">
                    <div className="mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-2xl rounded-lg bg-white pointer-events-auto animate-fadeIn">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">EC</div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Generate Codes For All Dates</h3>
                                    <p className="text-xs text-gray-500">Select an exam to shuffle its ref code across all dates.</p>
                                </div>
                            </div>
                            <button onClick={() => setShowBulkCodeModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Exam</label>
                                <select
                                    disabled={loadingExams}
                                    value={selectedExamId}
                                    onChange={(e) => setSelectedExamId(e.target.value)}
                                    className="w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-200"
                                >
                                    <option value="">{loadingExams ? 'Loading exams…' : 'Select an exam'}</option>
                                    {examSummaries.map((ex) => (
                                        <option key={ex.examId} value={ex.examId}>
                                            {`${ex.ref} ${ex.time_limit ? `• ${ex.time_limit} mins` : ''} • ${ex.questions_count} items${ex.include_personality_test ? ` • PT ${ex.personality_questions_count}` : ''}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedExamId && (() => {
                                const ex = examSummaries.find(e => String(e.examId) === String(selectedExamId));
                                if (!ex) return null;
                                return (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="p-3 rounded border bg-gray-50">
                                            <div className="text-xs text-gray-500">Exam Ref</div>
                                            <div className="text-sm font-semibold text-gray-900 break-all">{ex.ref}</div>
                                        </div>
                                        <div className="p-3 rounded border bg-gray-50">
                                            <div className="text-xs text-gray-500">Questions</div>
                                            <div className="text-sm font-semibold text-gray-900">{ex.questions_count}</div>
                                        </div>
                                        <div className="p-3 rounded border bg-gray-50">
                                            <div className="text-xs text-gray-500">Personality</div>
                                            <div className="text-sm font-semibold text-gray-900">{ex.include_personality_test ? `${ex.personality_questions_count} items` : 'None'}</div>
                                        </div>
                                    </div>
                                );
                            })()}

                            <div className="text-xs text-gray-600">
                                Exam period: <span className="font-semibold">{formatDate(settings.exam_start_date)} — {formatDate(settings.exam_end_date)}</span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setShowBulkCodeModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={!selectedExamId || submittingBulk}
                                onClick={() => {
                                    if (!selectedExamId) return;
                                    setSubmittingBulk(true);
                                    router.post('/guidance/bulk-generate-schedule-codes', {
                                        start_date: settings.exam_start_date,
                                        end_date: settings.exam_end_date,
                                        exam_id: selectedExamId
                                    }, {
                                        onSuccess: () => {
                                            setSubmittingBulk(false);
                                            setShowBulkCodeModal(false);
                                            window.showAlert('Generated exam codes for all dates.', 'success');
                                        },
                                        onError: () => {
                                            setSubmittingBulk(false);
                                            window.showAlert('Failed to bulk-generate exam codes.', 'error');
                                        }
                                    });
                                }}
                                className={`px-4 py-2 text-white rounded-md transition-colors duration-200 ${(!selectedExamId || submittingBulk) ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                            >
                                {submittingBulk ? 'Generating…' : 'Generate Codes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Code Modal */}
            {showQrModal && (
                <div className="fixed inset-0 bg-clear bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 animate-fadeIn border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                                Exam Code QR Code
                            </h3>
                            <button
                                onClick={() => setShowQrModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="text-center">
                            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 mb-6 border border-emerald-200">
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <img 
                                        src={selectedQrCode} 
                                        alt="QR Code" 
                                        className="mx-auto rounded-lg shadow-md"
                                    />
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-sm text-emerald-700 font-semibold">
                                        Mobile App Ready
                                    </p>
                                </div>
                                <p className="text-xs text-emerald-600">
                                    Scan this QR code with the mobile app to access the exam
                                </p>
                            </div>
                            
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.download = 'exam-qr-code.png';
                                        link.href = selectedQrCode;
                                        link.click();
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download QR Code
                                </button>
                                <button
                                    onClick={() => setShowQrModal(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm font-medium"
                                >
                                    Close
                                </button>
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
            `}</style>
        </Layout>
    );
};

export default ExamRegistrationManagement;
