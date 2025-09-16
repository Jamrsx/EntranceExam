<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Api\ExamController;
use App\Http\Controllers\Api\PersonalityTestController;
use App\Http\Controllers\Api\MobileAuthController;
use App\Http\Controllers\Api\MobileExamineeController;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\QuestionBank;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/login', [AuthController::class, 'apiLogin']); // Keep existing for backward compatibility
Route::get('/health', [MobileAuthController::class, 'health']); // Mobile app health check

// Mobile app authentication routes
Route::prefix('mobile')->group(function () {
    Route::post('/login', [MobileAuthController::class, 'login']);
    Route::get('/health', [MobileAuthController::class, 'health']);
});

// Test route to verify Passport is working
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

// Test route to check examinee data
Route::get('/test-examinee', [MobileExamineeController::class, 'testExamineeData']);



// Protected routes
Route::middleware('auth:api')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('/logout', [AuthController::class, 'apiLogout']); // Keep existing for backward compatibility
    
    // Mobile app protected routes
    Route::prefix('mobile')->group(function () {
        Route::get('/profile', [MobileAuthController::class, 'profile']);
        Route::get('/examinee/profile', [MobileExamineeController::class, 'getProfile']);
        Route::put('/examinee/profile', [MobileExamineeController::class, 'updateProfile']);
        Route::get('/exam-schedule', [MobileAuthController::class, 'getExamSchedule']);
        Route::post('/logout', [MobileAuthController::class, 'logout']);
    });
    
    // Student routes (for mobile app)
    Route::prefix('student')->group(function () {
        Route::get('/profile', [AuthController::class, 'getStudentProfile']);
        Route::get('/exams', [AuthController::class, 'getStudentExams']);
        Route::get('/results', [AuthController::class, 'getStudentResults']);
        Route::post('/submit-exam', [AuthController::class, 'submitExam']);
    });


});

// Test endpoint for question images
Route::get('/questions/{id}/image', function ($id) {
    $question = QuestionBank::find($id);
    if (!$question || !$question->image) {
        return response()->json(['error' => 'Question or image not found'], 404);
    }
    
    return response()->json([
        'questionId' => $question->questionId,
        'image' => $question->image
    ]);
});

// Registration status endpoint
Route::get('/registration-status', function () {
    $settings = \App\Models\ExamRegistrationSetting::getCurrentSettings();
    return response()->json([
        'registration_open' => $settings->registration_open,
        'registration_message' => $settings->registration_message
    ]);
});

// Exam API routes
Route::prefix('exams')->group(function () {
    Route::get('/', [ExamController::class, 'getAllExams']);
    Route::post('/get-by-ref', [ExamController::class, 'getExamByRef']);
    Route::post('/attach-personality-questions', [ExamController::class, 'attachPersonalityQuestions']);
});

// Mobile exam routes (protected)
Route::middleware('auth:api')->group(function () {
    Route::prefix('mobile/exam')->group(function () {
        Route::post('/validate-code', [ExamController::class, 'validateExamCode']);
        Route::get('/{examId}/questions', [ExamController::class, 'getExamQuestions']);
        
        // Separate personality and academic question endpoints
        Route::get('/{examId}/personality-questions', [ExamController::class, 'getPersonalityTestQuestions']);
        Route::get('/{examId}/academic-questions', [ExamController::class, 'getAcademicExamQuestions']);
        // Submit personality-only answers before academic exam
        Route::post('/personality/submit', [PersonalityTestController::class, 'submitPersonalityTestAnswers']);
        
        Route::post('/submit', [ExamController::class, 'submitExamAnswers']);
        Route::get('/results', [ExamController::class, 'getExamResults']);
        
        // Departmental exam routes
        Route::get('/departmental/{examId}/questions', [ExamController::class, 'getDepartmentalExamQuestions']);
        Route::post('/departmental/submit', [ExamController::class, 'submitDepartmentalExamAnswers']);
    });
    
    // General personality questions endpoint
    Route::get('/mobile/personality-questions/all', [ExamController::class, 'getAllPersonalityTestQuestions']);

    // Personality status & submission
    Route::get('/mobile/personality/status', [PersonalityTestController::class, 'checkStatus']);
});


