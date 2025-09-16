<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

use App\Models\User;
use App\Models\Examinee;
use App\Models\Evaluator;
use App\Models\GuidanceCounselor;
use App\Models\ExamineeRegistration;
use App\Models\ExamRegistrationSetting;
use App\Mail\RegistrationVerificationCode;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class AuthController extends Controller
{
    public function showLogin()
    {
        // If user is already logged in, redirect to appropriate dashboard
        if (Auth::check()) {
            return $this->redirectToDashboard(Auth::user());
        }
        
        return Inertia::render('auth/Login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $user = Auth::user();
            
            // Check user role and redirect accordingly
            switch ($user->role) {
                case 'evaluator':
                    return redirect()->route('evaluator.dashboard');
                case 'guidance':
                    return redirect()->route('guidance.dashboard');
                case 'student':
                    // Students will be redirected to a student dashboard or exam page
                    // For now, redirect to login with a message
                    Auth::logout();
                    return back()->withErrors(['email' => 'Student login is not available on the web. Please use the mobile app.']);
                default:
                    Auth::logout();
                    return back()->withErrors(['email' => 'Invalid user role.']);
            }
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return redirect()->route('login');
    }

    /**
     * Quick authentication status check for AJAX requests
     */
    public function checkAuthStatus(Request $request)
    {
        if ($request->ajax()) {
            if (Auth::check()) {
                $user = Auth::user();
                return response()->json([
                    'authenticated' => true,
                    'role' => $user->role,
                    'redirect_url' => $user->role === 'evaluator' 
                        ? route('evaluator.dashboard') 
                        : route('guidance.dashboard')
                ]);
            } else {
                return response()->json([
                    'authenticated' => false,
                    'redirect_url' => route('login')
                ], 401);
            }
        }
        
        // For non-AJAX requests, redirect based on auth status
        if (Auth::check()) {
            return $this->redirectToDashboard(Auth::user());
        } else {
            return redirect()->route('login');
        }
    }

    // API Methods for Passport
    public function apiLogin(Request $request)
    {
        $request->validate([
            'username' => 'sometimes|required_without:email|string',
            'email' => 'sometimes|required_without:username|email',
            'password' => 'required|string',
        ]);

        $password = (string) $request->input('password');

        // Determine identifier (username or email)
        $identifier = trim((string) ($request->input('username') ?? $request->input('email') ?? ''));
        $credentials = ['password' => $password];

        if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            $credentials['email'] = strtolower($identifier);
        } else {
            // Lookup by username to get email for Auth::attempt
            $user = User::where('username', $identifier)->first();
            if (!$user) {
                return response()->json(['error' => 'Invalid credentials'], 401);
            }
            $credentials['email'] = strtolower($user->email);
        }

        if (Auth::attempt($credentials)) {
            /** @var User $user */
            $user = Auth::user();

            // Only allow students to use API (aligns with mobile-only policy)
            if ($user->role !== 'student') {
                Auth::logout();
                return response()->json(['error' => 'Unauthorized. Only students can access the API.'], 401);
            }

            // Create Passport token
            $token = $user->createToken('Student Token')->accessToken;

            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user,
                'examinee' => $user->examinee,
            ]);
        }

        return response()->json(['error' => 'Invalid credentials'], 401);
    }

    public function apiLogout(Request $request)
    {
        try {
            $token = $request->user()->token();
            if ($token) {
                $token->revoke();
            }
        } catch (\Throwable $e) {
            // swallow, still return success
        }
        return response()->json(['message' => 'Successfully logged out']);
    }

    public function getStudentProfile(Request $request)
    {
        /** @var User $user */
        $user = $request->user();
        return response()->json([
            'user' => $user,
            'examinee' => $user->examinee,
        ]);
    }

    public function getStudentExams(Request $request)
    {
        return response()->json(['exams' => []]);
    }

    public function getStudentResults(Request $request)
    {
        return response()->json(['results' => []]);
    }

    public function submitExam(Request $request)
    {
        return response()->json(['message' => 'Exam submitted successfully']);
    }

    public function showRegister()
    {
        // If user is already logged in, redirect to appropriate dashboard
        if (Auth::check()) {
            return $this->redirectToDashboard(Auth::user());
        }
        
        $settings = ExamRegistrationSetting::getCurrentSettings();
        
        if (!$settings->registration_open) {
            return Inertia::render('auth/Register', [
                'registrationOpen' => false,
                'registrationMessage' => $settings->registration_message
            ]);
        }

        return Inertia::render('auth/Register', [
            'registrationOpen' => true,
            'registrationMessage' => $settings->registration_message
        ]);
    }

    public function register(Request $request)
    {
        // Check if registration is open
        $settings = ExamRegistrationSetting::getCurrentSettings();
        if (!$settings->registration_open) {
            return back()->withErrors(['registration' => 'Registration is currently closed.']);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'school_name' => 'required|string|max:255',
            'parent_name' => 'required|string|max:255',
            'parent_phone' => 'required|string|max:20',
            'address' => 'required|string|max:500',
            'profile' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
        ], [
            'name.required' => 'Full name is required.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email address is already registered.',
            'password.required' => 'Password is required.',
            'password.min' => 'Password must be at least 8 characters long.',
            'password.confirmed' => 'Password confirmation does not match.',
            'school_name.required' => 'School name is required.',
            'parent_name.required' => 'Parent/Guardian name is required.',
            'parent_phone.required' => 'Parent/Guardian phone is required.',
            'address.required' => 'Address is required.',
            'profile.required' => 'Profile picture is required.',
            'profile.image' => 'Profile must be an image file.',
            'profile.mimes' => 'Profile image must be a JPEG, PNG, JPG, or GIF file.',
            'profile.max' => 'Profile image must not exceed 5MB.',
        ]);

        try {
            DB::beginTransaction();

            // Create user account
            $user = User::create([
                'username' => $request->name, // Use name as username
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'student',
            ]);

            // Handle profile image upload - store as base64 in database
            $profileData = null;
            if ($request->hasFile('profile')) {
                $file = $request->file('profile');
                $imageData = file_get_contents($file->getPathname());
                $profileData = base64_encode($imageData);
            }

            // Create examinee record
            $examinee = Examinee::create([
                'accountId' => $user->id,
                'name' => $request->name,
                'phone' => $request->parent_phone,
                'address' => $request->address,
                'school_name' => $request->school_name,
                'parent_name' => $request->parent_name,
                'parent_phone' => $request->parent_phone,
                'Profile' => $profileData,
            ]);

            // Get current registration settings for academic year and semester
            $settings = ExamRegistrationSetting::getCurrentSettings();
            
            // Create examinee registration record (only exam assignment data)
            $registration = ExamineeRegistration::create([
                'examinee_id' => $examinee->id,
                'school_year' => $settings->academic_year ?? date('Y') . '-' . (date('Y') + 1),
                'semester' => $settings->semester ?? '1st',
                'status' => 'registered',
                'registration_date' => now()->toDateString(),
            ]);

            // Auto-assign examinee to exam date
            $this->autoAssignExamineeToExam($registration);

            DB::commit();

            return redirect()->route('login')->with('success', 'Registration successful! Please login to the mobile app to see your exam schedule.');

        } catch (\Exception $e) {
            DB::rollback();
            
            // Log the error for debugging
            Log::error('Registration failed: ' . $e->getMessage(), [
                'user_email' => $request->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Provide user-friendly error messages
            $errorMessage = 'Registration failed. Please try again.';
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                $errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
            } elseif (str_contains($e->getMessage(), 'SQLSTATE[HY000]')) {
                $errorMessage = 'Database error occurred. Please try again later.';
            }

            return back()->withErrors(['registration' => $errorMessage]);
        }
    }

    /**
     * Start registration by sending a verification code and caching the payload for up to 1 hour.
     */
    public function startRegistration(Request $request)
    {
        // Check if registration is open
        $settings = ExamRegistrationSetting::getCurrentSettings();
        if (!$settings->registration_open) {
            return back()->withErrors(['registration' => 'Registration is currently closed.']);
        }

        $emailInput = strtolower((string) $request->input('email'));
        $existingUser = $emailInput ? User::where('email', $emailInput)->first() : null;

        if ($existingUser && $existingUser->email_verified_at) {
            return back()->withErrors(['email' => 'This email is already verified. Please login to the mobile app to access your account.']);
        }

        if ($existingUser && !$existingUser->email_verified_at && $existingUser->created_at->lt(now()->subMinutes(20))) {
            try { $existingUser->delete(); } catch (\Exception $e) { Log::warning('Failed to delete expired unverified user', ['email' => $emailInput]); }
            $existingUser = null;
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required', 'string', 'email', 'max:255',
                $existingUser ? Rule::unique('users', 'email')->ignore($existingUser->id) : Rule::unique('users', 'email')
            ],
            'password' => 'required|string|min:8|confirmed',
            'school_name' => 'required|string|max:255',
            'parent_name' => 'required|string|max:255',
            'parent_phone' => 'required|string|max:20',
            'address' => 'required|string|max:500',
            'profile' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
        ]);

        $email = strtolower($validated['email']);

        // Handle profile image upload - store as base64 data
        $profileData = null;
        if ($request->hasFile('profile')) {
            $file = $request->file('profile');
            $imageData = file_get_contents($file->getPathname());
            $profileData = base64_encode($imageData);
        }

        // Basic rate limit: max 5 code sends per hour per email
        $rateKey = 'reg:rate:' . sha1($email);
        $sendCount = Cache::get($rateKey, 0);
        if ($sendCount >= 5) {
            return back()->withErrors(['email' => 'Too many verification attempts. Please try again in an hour.']);
        }

        // Generate a 6-digit verification code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Create or update the unverified user record
        if (!$existingUser) {
            try {
                $existingUser = User::create([
                    'username' => $validated['name'],
                    'email' => $email,
                    'password' => Hash::make($validated['password']),
                    'role' => 'student',
                    'email_verified_at' => null,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed creating temp user', ['email' => $email, 'error' => $e->getMessage()]);
                return back()->withErrors(['registration' => 'Registration failed. Please try again.']);
            }
        } else {
            $existingUser->update([
                'username' => $validated['name'],
                'password' => Hash::make($validated['password']),
            ]);
        }

        // Cache payload for 20 minutes
        $cacheKey = 'reg:pending:' . sha1($email);
        Cache::put($cacheKey, [
            'name' => $validated['name'],
            'email' => $email,
            'password_hash' => Hash::make($validated['password']),
            'school_name' => $validated['school_name'],
            'parent_name' => $validated['parent_name'],
            'parent_phone' => $validated['parent_phone'],
            'address' => $validated['address'],
            'profile_data' => $profileData,
            'code' => $code,
            'created_at' => now()->toIso8601String(),
            'attempts' => 0,
        ], now()->addMinutes(20));

        // Increment rate counter (expire with the 20-minute window)
        Cache::put($rateKey, $sendCount + 1, now()->addMinutes(20));

        try {
            Mail::to($email)->send(new RegistrationVerificationCode($code, $validated['name']));
        } catch (\Exception $e) {
            Log::error('Failed to send registration verification email', [
                'email' => $email,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors(['registration' => 'Failed to send verification email. Please try again.']);
        }

        // Redirect to verification page with email prefilled
        return redirect()->route('register.verify.view', ['email' => $email]);
    }
    /**
     * Show email verification page
     */
    public function showVerify(Request $request)
    {
        $email = strtolower((string) $request->query('email'));
        return Inertia::render('auth/Verify', [
            'email' => $email,
        ]);
    }

    /**
     * Resend verification code within the 1-hour window.
     */
    public function resendRegistrationCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = strtolower($request->email);
        $user = User::where('email', $email)->first();

        if (!$user) {
            return back()->withErrors(['registration' => 'No pending registration found or it has expired. Please start again.']);
        }

        if ($user->email_verified_at) {
            return back()->withErrors(['email' => 'This email is already verified. Please login to the mobile app.']);
        }

        if ($user->created_at->lt(now()->subMinutes(20))) {
            try { $user->delete(); } catch (\Exception $e) {}
            return back()->withErrors(['registration' => 'Verification expired. Please restart registration.']);
        }

        $cacheKey = 'reg:pending:' . sha1($email);
        $pending = Cache::get($cacheKey);

        // If cache expired but user still exists, regenerate the cache entry
        if (!$pending) {
            // Check if we can regenerate from user data
            if ($user->created_at->gt(now()->subMinutes(20))) {
                // Regenerate cache entry with new code
                $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                $pending = [
                    'name' => $user->username,
                    'email' => $email,
                    'password_hash' => $user->password,
                    'school_name' => $user->school_name ?? '',
                    'parent_name' => $user->parent_name ?? '',
                    'parent_phone' => $user->parent_phone ?? '',
                    'address' => $user->address ?? '',
                    'profile_data' => $user->profile_data ?? null,
                    'code' => $code,
                    'created_at' => $user->created_at->toIso8601String(),
                    'attempts' => 0,
                ];
                Cache::put($cacheKey, $pending, now()->addMinutes(20));
            } else {
                return back()->withErrors(['registration' => 'No pending registration found or it has expired. Please start again.']);
            }
        }

        // Basic rate limit: max 3 code sends per hour per email
        $rateKey = 'reg:rate:' . sha1($email);
        $sendCount = Cache::get($rateKey, 0);
        if ($sendCount >= 3) {
            return back()->withErrors(['email' => 'Too many verification attempts. Please try again in an hour.']);
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $pending['code'] = $code;
        $pending['attempts'] = 0;
        Cache::put($cacheKey, $pending, now()->addMinutes(20));

        Cache::put($rateKey, $sendCount + 1, now()->addMinutes(20));

        try {
            Mail::to($email)->send(new RegistrationVerificationCode($code, $pending['name']));
        } catch (\Exception $e) {
            Log::error('Failed to resend registration verification email', [
                'email' => $email,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors(['registration' => 'Failed to resend verification email. Please try again.']);
        }

        return back()->with('verification_resent', true);
    }

    /**
     * Verify code and complete registration, creating the user and related records.
     */
    public function verifyAndCompleteRegistration(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ], [
            'code.size' => 'The verification code must be exactly 6 digits.',
        ]);

        $email = strtolower($request->email);
        $code = $request->code;

        $cacheKey = 'reg:pending:' . sha1($email);
        $pending = Cache::get($cacheKey);

        if (!$pending) {
            return back()->withErrors(['registration' => 'Verification expired or not found. Please start again.']);
        }

        if (!hash_equals($pending['code'], $code)) {
            // Increment attempts and lock after 5
            $pending['attempts'] = ($pending['attempts'] ?? 0) + 1;
            Cache::put($cacheKey, $pending, now()->addHour());

            if ($pending['attempts'] > 5) {
                Cache::forget($cacheKey);
                return back()->withErrors(['registration' => 'Too many invalid attempts. Please start again.']);
            }

            return back()->withErrors(['code' => 'Invalid verification code.']);
        }

        // All good, complete the records
        try {
            DB::beginTransaction();

            // find temp user (already exists from startRegistration)
            $user = User::where('email', $email)->first();
            if (!$user) {
                throw new \RuntimeException('Pending user not found.');
            }
            $user->update([
                'username' => $pending['name'],
                'password' => $pending['password_hash'],
                'email_verified_at' => now(),
            ]);

            $examinee = Examinee::create([
                'accountId' => $user->id,
                'name' => $pending['name'],
                'phone' => $pending['parent_phone'],
                'address' => $pending['address'],
                'school_name' => $pending['school_name'],
                'parent_name' => $pending['parent_name'],
                'parent_phone' => $pending['parent_phone'],
                'Profile' => $pending['profile_data'],
            ]);

            $settings = ExamRegistrationSetting::getCurrentSettings();

            $registration = ExamineeRegistration::create([
                'examinee_id' => $examinee->id,
                'school_year' => $settings->academic_year ?? date('Y') . '-' . (date('Y') + 1),
                'semester' => $settings->semester ?? '1st',
                'status' => 'registered',
                'registration_date' => now()->toDateString(),
            ]);

            $this->autoAssignExamineeToExam($registration);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Verify/Complete registration failed', [
                'email' => $email,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors(['registration' => 'Failed to complete registration. Please try again.']);
        }

        // Clean up pending cache
        Cache::forget($cacheKey);

        return redirect()->route('login')->with('success', 'Email verified successfully. Your account has been created. Please login to see your exam schedule.');
    }

    /**
     * Redirect user to appropriate dashboard based on their role
     */
    private function redirectToDashboard($user)
    {
        switch ($user->role) {
            case 'evaluator':
                return redirect()->route('evaluator.dashboard');
            case 'guidance':
                return redirect()->route('guidance.dashboard');
            case 'student':
                // Students should use mobile app, logout and redirect to login with message
                Auth::logout();
                return redirect()->route('login')->with('info', 'Students should use the mobile application.');
            default:
                // Invalid role, logout and redirect
                Auth::logout();
                return redirect()->route('login')->with('error', 'Invalid user role. Please contact administrator.');
        }
    }

    /**
     * Auto-assign examinee to exam date (2 days after registration, skipping weekends)
     */
    private function autoAssignExamineeToExam($registration)
    {
        try {
            $settings = ExamRegistrationSetting::getCurrentSettings();
            
            // If no settings configured, use default values for assignment
            $studentsPerDay = $settings->students_per_day ?? 40;
            
            // Calculate assignment date (2 days after registration, skipping weekends)
            $assignmentDate = \Carbon\Carbon::parse($registration->registration_date)->addDays(2);
            
            // Skip weekends (Saturday = 6, Sunday = 0)
            while ($assignmentDate->dayOfWeek == 0 || $assignmentDate->dayOfWeek == 6) {
                $assignmentDate->addDay();
            }

            // If exam dates are configured, respect them
            if ($settings->exam_start_date && $settings->exam_end_date) {
                $examStartDate = \Carbon\Carbon::parse($settings->exam_start_date);
                $examEndDate = \Carbon\Carbon::parse($settings->exam_end_date);
                
                if ($assignmentDate->lt($examStartDate)) {
                    $assignmentDate = $examStartDate;
                    // Skip weekends for exam start date too
                    while ($assignmentDate->dayOfWeek == 0 || $assignmentDate->dayOfWeek == 6) {
                        $assignmentDate->addDay();
                    }
                } elseif ($assignmentDate->gt($examEndDate)) {
                    return; // No available dates in exam period
                }
            }

            // Iterate forward until an open, not-full session is found (skip weekends)
            $safetyCounter = 0;
            while ($safetyCounter < 370) { // ~1 year safety
                // Respect exam end date if configured
                if ($settings->exam_end_date) {
                    $examEndDate = \Carbon\Carbon::parse($settings->exam_end_date);
                    if ($assignmentDate->gt($examEndDate)) {
                        Log::warning('No available exam dates for registration ID: ' . $registration->id);
                        return;
                    }
                }

                // Skip weekends
                while ($assignmentDate->dayOfWeek == 0 || $assignmentDate->dayOfWeek == 6) {
                    $assignmentDate->addDay();
                }

                $assignmentDateString = $assignmentDate->format('Y-m-d');
                $halfCapacity = intval($studentsPerDay / 2);

                // Try morning session first (first come, first serve)
                $morningSchedule = \App\Models\ExamSchedule::where('exam_date', $assignmentDateString)
                    ->where('session', 'morning')
                    ->first();

                if ($morningSchedule && $morningSchedule->status === 'open' && $morningSchedule->hasAvailableSlots()) {
                    // Assign to morning session
                    $registration->update([
                        'assigned_exam_date' => $morningSchedule->exam_date,
                        'assigned_session' => 'morning',
                        'status' => 'assigned'
                    ]);
                    $morningSchedule->increment('current_registrations');
                    if ($morningSchedule->current_registrations >= $morningSchedule->max_capacity) {
                        $morningSchedule->update(['status' => 'full']);
                    }
                    break;
                }

                // Try afternoon session if morning is full or doesn't exist
                $afternoonSchedule = \App\Models\ExamSchedule::where('exam_date', $assignmentDateString)
                    ->where('session', 'afternoon')
                    ->first();

                if ($afternoonSchedule && $afternoonSchedule->status === 'open' && $afternoonSchedule->hasAvailableSlots()) {
                    // Assign to afternoon session
                    $registration->update([
                        'assigned_exam_date' => $afternoonSchedule->exam_date,
                        'assigned_session' => 'afternoon',
                        'status' => 'assigned'
                    ]);
                    $afternoonSchedule->increment('current_registrations');
                    if ($afternoonSchedule->current_registrations >= $afternoonSchedule->max_capacity) {
                        $afternoonSchedule->update(['status' => 'full']);
                    }
                    break;
                }

                // If no existing schedules or both are full, create new sessions
                if (!$morningSchedule && !$afternoonSchedule) {
                    // Create both morning and afternoon sessions for this day
                    $morningSchedule = \App\Models\ExamSchedule::create([
                        'exam_date' => $assignmentDateString,
                        'session' => 'morning',
                        'start_time' => '08:00:00',
                        'end_time' => '11:00:00',
                        'max_capacity' => $halfCapacity,
                        'current_registrations' => 0,
                        'status' => 'open'
                    ]);

                    \App\Models\ExamSchedule::create([
                        'exam_date' => $assignmentDateString,
                        'session' => 'afternoon',
                        'start_time' => '13:00:00',
                        'end_time' => '16:00:00',
                        'max_capacity' => $halfCapacity,
                        'current_registrations' => 0,
                        'status' => 'open'
                    ]);

                    // Assign to morning session (first come, first serve)
                    $registration->update([
                        'assigned_exam_date' => $morningSchedule->exam_date,
                        'assigned_session' => 'morning',
                        'status' => 'assigned'
                    ]);
                    $morningSchedule->increment('current_registrations');
                    break;
                } elseif (!$morningSchedule) {
                    // Create morning session only
                    $morningSchedule = \App\Models\ExamSchedule::create([
                        'exam_date' => $assignmentDateString,
                        'session' => 'morning',
                        'start_time' => '08:00:00',
                        'end_time' => '11:00:00',
                        'max_capacity' => $halfCapacity,
                        'current_registrations' => 0,
                        'status' => 'open'
                    ]);

                    // Assign to morning session
                    $registration->update([
                        'assigned_exam_date' => $morningSchedule->exam_date,
                        'assigned_session' => 'morning',
                        'status' => 'assigned'
                    ]);
                    $morningSchedule->increment('current_registrations');
                    break;
                } elseif (!$afternoonSchedule) {
                    // Create afternoon session only
                    $afternoonSchedule = \App\Models\ExamSchedule::create([
                        'exam_date' => $assignmentDateString,
                        'session' => 'afternoon',
                        'start_time' => '13:00:00',
                        'end_time' => '16:00:00',
                        'max_capacity' => $halfCapacity,
                        'current_registrations' => 0,
                        'status' => 'open'
                    ]);

                    // Assign to afternoon session
                    $registration->update([
                        'assigned_exam_date' => $afternoonSchedule->exam_date,
                        'assigned_session' => 'afternoon',
                        'status' => 'assigned'
                    ]);
                    $afternoonSchedule->increment('current_registrations');
                    break;
                }

                // Move to next day
                $assignmentDate->addDay();
                $safetyCounter++;
            }
        } catch (\Exception $e) {
            // Log error but don't fail the registration
            Log::error('Auto-assignment failed: ' . $e->getMessage());
        }
    }
} 