<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Examinee;
use App\Http\Controllers\Controller;

class MobileAuthController extends Controller
{
    /**
     * Mobile app login endpoint
     * Handles email-based authentication for mobile app users
     */
    public function login(Request $request)
    {
        try {
            // Validate request
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string|min:4',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $email = strtolower(trim($request->email));
            $password = $request->password;

            Log::info('[MobileAuth] Login attempt for email: ' . $email);

            // Attempt authentication
            $credentials = [
                'email' => $email,
                'password' => $password
            ];

            if (Auth::attempt($credentials)) {
                /** @var User $user */
                $user = Auth::user();

                Log::info('[MobileAuth] Authentication successful for user: ' . $user->id);

                // Only allow students to use mobile app
                if ($user->role !== 'student') {
                    Auth::logout();
                    Log::warning('[MobileAuth] Access denied - user role: ' . $user->role);
                    return response()->json([
                        'success' => false,
                        'message' => 'Access denied. Only students can use the mobile app.'
                    ], 403);
                }

                // Check if user has examinee profile
                $examinee = Examinee::where('accountId', $user->id)->first();
                if (!$examinee) {
                    Log::warning('[MobileAuth] No examinee profile found for user: ' . $user->id);
                    return response()->json([
                        'success' => false,
                        'message' => 'Student profile not found. Please contact administrator.'
                    ], 404);
                }

                // Create Passport token for mobile API access
                Log::info('[MobileAuth] Creating token for user: ' . $user->id);
                try {
                    $token = $user->createToken('Mobile App Token')->accessToken;
                    Log::info('[MobileAuth] Token created successfully for user: ' . $user->id . ', Token: ' . substr($token, 0, 20) . '...');
                } catch (\Exception $e) {
                    Log::error('[MobileAuth] Token creation failed: ' . $e->getMessage());
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to create authentication token. Please try again.'
                    ], 500);
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Login successful',
                    'access_token' => $token,
                    'token_type' => 'Bearer',
                    'user' => [
                        'id' => $user->id,
                        'email' => $user->email,
                        'role' => $user->role,
                        'created_at' => $user->created_at,
                    ],
                    'examinee' => [
                        'id' => $examinee->id,
                        'name' => $examinee->name,
                        'school_name' => $examinee->school_name,
                        'parent_name' => $examinee->parent_name,
                        'parent_phone' => $examinee->parent_phone,
                        'phone' => $examinee->phone,
                        'address' => $examinee->address,
                        'created_at' => $examinee->created_at,
                        'updated_at' => $examinee->updated_at,
                    ]
                ], 200);
            }

            Log::warning('[MobileAuth] Authentication failed for email: ' . $email);
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password'
            ], 401);

        } catch (\Exception $e) {
            Log::error('[MobileAuth] Login error: ' . $e->getMessage(), [
                'email' => $request->email ?? 'unknown',
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred during login. Please try again.'
            ], 500);
        }
    }

    /**
     * Get authenticated user profile
     */
    public function profile(Request $request)
    {
        try {
            /** @var User $user */
            $user = $request->user();
            $examinee = Examinee::where('accountId', $user->id)->first();

            if (!$examinee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student profile not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'role' => $user->role,
                    'created_at' => $user->created_at,
                ],
                'examinee' => [
                    'id' => $examinee->id,
                    'name' => $examinee->name,
                    'school_name' => $examinee->school_name,
                    'parent_name' => $examinee->parent_name,
                    'parent_phone' => $examinee->parent_phone,
                    'phone' => $examinee->phone,
                    'address' => $examinee->address,
                    'created_at' => $examinee->created_at,
                    'updated_at' => $examinee->updated_at,
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('[MobileAuth] Profile error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve profile'
            ], 500);
        }
    }

    /**
     * Mobile app logout endpoint
     */
    public function logout(Request $request)
    {
        try {
            /** @var User $user */
            $user = $request->user();
            
            Log::info('[MobileAuth] Logout for user: ' . $user->id);

            // Revoke current token
            $request->user()->token()->revoke();

            return response()->json([
                'success' => true,
                'message' => 'Successfully logged out'
            ], 200);

        } catch (\Exception $e) {
            Log::error('[MobileAuth] Logout error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Logout failed'
            ], 500);
        }
    }

    /**
     * Get examinee profile for mobile app
     * Returns data in the format expected by the mobile app
     */
    public function examineeProfile(Request $request)
    {
        try {
            /** @var User $user */
            $user = $request->user();
            
            Log::info('[MobileAuth] Fetching examinee profile for user: ' . $user->id);
            Log::info('[MobileAuth] User details - ID: ' . $user->id . ', Email: ' . $user->email . ', Role: ' . $user->role);

            // Get examinee data from the examinee table
            $examinee = Examinee::where('accountId', $user->id)->first();

            if (!$examinee) {
                Log::warning('[MobileAuth] No examinee profile found for user: ' . $user->id);
                
                // Log all examinees for debugging
                $allExaminees = Examinee::all();
                Log::info('[MobileAuth] All examinees in database: ' . $allExaminees->count());
                foreach ($allExaminees as $exam) {
                    Log::info('[MobileAuth] Examinee - ID: ' . $exam->id . ', AccountID: ' . $exam->accountId . ', Name: ' . $exam->name);
                }
                
                return response()->json([
                    'success' => false,
                    'message' => 'Student profile not found. Please contact administrator.'
                ], 404);
            }

            Log::info('[MobileAuth] Examinee profile found for user: ' . $user->id);
            Log::info('[MobileAuth] Examinee details - ID: ' . $examinee->id . ', Name: ' . $examinee->name . ', School: ' . $examinee->school_name);

            // Return data in the format expected by the mobile app
            return response()->json([
                'id' => $examinee->id,
                'name' => $examinee->name,
                'school_name' => $examinee->school_name,
                'parent_name' => $examinee->parent_name,
                'parent_phone' => $examinee->parent_phone,
                'phone' => $examinee->phone,
                'address' => $examinee->address,
                'created_at' => $examinee->created_at,
                'updated_at' => $examinee->updated_at,
            ], 200);

        } catch (\Exception $e) {
            Log::error('[MobileAuth] Examinee profile error: ' . $e->getMessage(), [
                'user_id' => $request->user()->id ?? 'unknown',
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve examinee profile. Please try again.'
            ], 500);
        }
    }

    /**
     * Get exam schedule details for mobile app
     */
    public function getExamSchedule(Request $request)
    {
        try {
            /** @var User $user */
            $user = $request->user();
            $examinee = Examinee::where('accountId', $user->id)->first();

            if (!$examinee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student profile not found'
                ], 404);
            }

            // Get the examinee's registration
            $registration = \App\Models\ExamineeRegistration::where('examinee_id', $examinee->id)
                ->where('status', 'assigned')
                ->first();

            if (!$registration || !$registration->assigned_exam_date) {
                return response()->json([
                    'success' => true,
                    'has_schedule' => false,
                    'message' => 'No exam schedule assigned yet'
                ], 200);
            }

            // Get the exam schedule details
            $schedule = \App\Models\ExamSchedule::where('exam_date', $registration->assigned_exam_date)
                ->where('session', $registration->assigned_session)
                ->first();

            if (!$schedule) {
                return response()->json([
                    'success' => true,
                    'has_schedule' => false,
                    'message' => 'Exam schedule details not found'
                ], 200);
            }

            return response()->json([
                'success' => true,
                'has_schedule' => true,
                'schedule' => [
                    'exam_date' => $schedule->exam_date->format('Y-m-d'),
                    'exam_date_formatted' => $schedule->exam_date->format('l, F j, Y'),
                    'session' => $schedule->session,
                    'session_display' => ucfirst($schedule->session),
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'start_time_formatted' => \Carbon\Carbon::createFromFormat('H:i:s', $schedule->start_time)->format('g:i A'),
                    'end_time_formatted' => \Carbon\Carbon::createFromFormat('H:i:s', $schedule->end_time)->format('g:i A'),
                    'status' => $schedule->status,
                    'max_capacity' => $schedule->max_capacity,
                    'current_registrations' => $schedule->current_registrations,
                    'available_slots' => $schedule->getAvailableSlots()
                ],
                'registration' => [
                    'status' => $registration->status,
                    'school_year' => $registration->school_year,
                    'semester' => $registration->semester
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('[MobileAuth] Exam schedule error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve exam schedule'
            ], 500);
        }
    }

    /**
     * Health check endpoint for mobile app
     */
    public function health()
    {
        return response()->json([
            'success' => true,
            'message' => 'Mobile API is healthy',
            'timestamp' => now()->toISOString(),
            'version' => '1.0.0'
        ], 200);
    }
}
