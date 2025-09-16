<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\Examinee;
use App\Http\Controllers\Controller;

class MobileExamineeController extends Controller
{
    /**
     * Get examinee profile for mobile app
     * Returns data in the format expected by the mobile app
     */
    public function getProfile(Request $request)
    {
        try {
            /** @var User $user */
            $user = $request->user();
            
            Log::info('[MobileExaminee] Fetching examinee profile for user: ' . $user->id);
            Log::info('[MobileExaminee] User details - ID: ' . $user->id . ', Email: ' . $user->email . ', Role: ' . $user->role);

            // Check if user has student role
            if ($user->role !== 'student') {
                Log::warning('[MobileExaminee] Access denied - user role: ' . $user->role);
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Only students can access this endpoint.'
                ], 403);
            }

            // Get examinee data from the examinee table with registration info
            $examinee = Examinee::with('registration')->where('accountId', $user->id)->first();

            if (!$examinee) {
                Log::warning('[MobileExaminee] No examinee profile found for user: ' . $user->id);
                
                // Log all examinees for debugging
                $allExaminees = Examinee::all();
                Log::info('[MobileExaminee] All examinees in database: ' . $allExaminees->count());
                foreach ($allExaminees as $exam) {
                    Log::info('[MobileExaminee] Examinee - ID: ' . $exam->id . ', AccountID: ' . $exam->accountId . ', Name: ' . $exam->name);
                }
                
                return response()->json([
                    'success' => false,
                    'message' => 'Student profile not found. Please contact administrator.'
                ], 404);
            }

            Log::info('[MobileExaminee] Examinee profile found for user: ' . $user->id);
            Log::info('[MobileExaminee] Examinee details - ID: ' . $examinee->id . ', Name: ' . $examinee->name . ', School: ' . $examinee->school_name);

            // Return data in the format expected by the mobile app
            return response()->json([
                'id' => $examinee->id,
                'name' => $examinee->name,
                'school_name' => $examinee->school_name,
                'parent_name' => $examinee->parent_name,
                'parent_phone' => $examinee->parent_phone,
                'phone' => $examinee->phone,
                'address' => $examinee->address,
                'Profile' => $examinee->Profile,
                'exam_schedule' => $examinee->registration ? [
                    'assigned_exam_date' => $examinee->registration->assigned_exam_date,
                    'registration_date' => $examinee->registration->registration_date,
                    'status' => $examinee->registration->status,
                    'school_year' => $examinee->registration->school_year,
                    'semester' => $examinee->registration->semester,
                ] : null,
                'created_at' => $examinee->created_at,
                'updated_at' => $examinee->updated_at,
            ], 200);

        } catch (\Exception $e) {
            Log::error('[MobileExaminee] Profile error: ' . $e->getMessage(), [
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
     * Update examinee profile for mobile app
     * Updates data in the database and returns updated examinee data
     */
    public function updateProfile(Request $request)
    {
        try {
            /** @var User $user */
            $user = $request->user();
            
            Log::info('[MobileExaminee] Updating examinee profile for user: ' . $user->id);
            Log::info('[MobileExaminee] Update request data:', $request->all());

            // Check if user has student role
            if ($user->role !== 'student') {
                Log::warning('[MobileExaminee] Update access denied - user role: ' . $user->role);
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Only students can update their profile.'
                ], 403);
            }

            // Validate required fields
            $request->validate([
                'name' => 'required|string|max:255',
                'school_name' => 'required|string|max:255',
                'parent_name' => 'required|string|max:255',
                'parent_phone' => 'required|string|max:20',
                'phone' => 'required|numeric|min:1000000000|max:999999999999999',
                'address' => 'required|string|max:500',
                'Profile' => 'nullable|string', // Profile picture as base64 string
            ], [
                'name.required' => 'Full name is required.',
                'school_name.required' => 'School name is required.',
                'parent_name.required' => 'Parent name is required.',
                'parent_phone.required' => 'Parent phone number is required.',
                'phone.required' => 'Phone number is required.',
                'phone.numeric' => 'Phone number must be a valid number.',
                'phone.min' => 'Phone number must be at least 10 digits.',
                'phone.max' => 'Phone number must not exceed 15 digits.',
                'address.required' => 'Address is required.',
            ]);

            // Get examinee data from the examinee table with registration info
            $examinee = Examinee::with('registration')->where('accountId', $user->id)->first();

            if (!$examinee) {
                Log::warning('[MobileExaminee] No examinee profile found for update - user: ' . $user->id);
                return response()->json([
                    'success' => false,
                    'message' => 'Student profile not found. Please contact administrator.'
                ], 404);
            }

            // Prepare update data
            $updateData = [
                'name' => $request->name,
                'school_name' => $request->school_name,
                'parent_name' => $request->parent_name,
                'parent_phone' => $request->parent_phone,
                'phone' => $request->phone,
                'address' => $request->address,
            ];

            // Add profile picture if provided
            if ($request->has('Profile') && $request->Profile) {
                $updateData['Profile'] = $request->Profile;
                Log::info('[MobileExaminee] Profile picture updated for user: ' . $user->id);
            }

            // Update examinee data
            $examinee->update($updateData);

            Log::info('[MobileExaminee] Profile updated successfully for user: ' . $user->id);
            Log::info('[MobileExaminee] Updated examinee details - ID: ' . $examinee->id . ', Name: ' . $examinee->name);

            // Return updated data in the format expected by the mobile app
            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully!',
                'examinee' => [
                    'id' => $examinee->id,
                    'name' => $examinee->name,
                    'school_name' => $examinee->school_name,
                    'parent_name' => $examinee->parent_name,
                    'parent_phone' => $examinee->parent_phone,
                    'phone' => $examinee->phone,
                    'address' => $examinee->address,
                    'Profile' => $examinee->Profile,
                    'exam_schedule' => $examinee->registration ? [
                        'assigned_exam_date' => $examinee->registration->assigned_exam_date,
                        'registration_date' => $examinee->registration->registration_date,
                        'status' => $examinee->registration->status,
                        'school_year' => $examinee->registration->school_year,
                        'semester' => $examinee->registration->semester,
                    ] : null,
                    'created_at' => $examinee->created_at,
                    'updated_at' => $examinee->updated_at,
                ]
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('[MobileExaminee] Validation failed for user: ' . $user->id, [
                'errors' => $e->errors()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Validation failed. Please check your input.',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('[MobileExaminee] Profile update error: ' . $e->getMessage(), [
                'user_id' => $request->user()->id ?? 'unknown',
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile. Please try again.'
            ], 500);
        }
    }

    /**
     * Test endpoint to check examinee data without authentication
     */
    public function testExamineeData()
    {
        try {
            $examinee = Examinee::find(10);
            $user = $examinee ? User::find($examinee->accountId) : null;
            
            return response()->json([
                'examinee' => $examinee,
                'user' => $user,
                'all_examinees' => Examinee::all()->map(function($e) {
                    return [
                        'id' => $e->id,
                        'accountId' => $e->accountId,
                        'name' => $e->name
                    ];
                })
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
