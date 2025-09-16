<?php

use Inertia\Inertia;
use App\Http\Controllers\Testing;
use App\Http\Controllers\Auth\AuthController;

use App\Http\Controllers\Evaluator\EvaluatorController;
use App\Http\Controllers\Evaluator\DepartmentExamController;
use App\Http\Controllers\Evaluator\QuestionBankController;
use App\Http\Controllers\Evaluator\QuestionImportController as EvaluatorQuestionImportController;
use App\Http\Controllers\Evaluator\ExamResultsController;
use App\Http\Controllers\Evaluator\StudentResultsController;
use App\Http\Controllers\Guidance\GuidanceController;
use App\Http\Controllers\Guidance\QuestionImportController;
use App\Http\Controllers\Guidance\AI\RecommendationRulesController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Guidance\AI\CourseDescriptionController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    if (Auth::check()) {
        $user = Auth::user();
        switch ($user->role) {
            case 'evaluator':
                return redirect()->route('evaluator.dashboard');
            case 'guidance':
                return redirect()->route('guidance.dashboard');
            case 'student':
                // Students should use mobile app
                Auth::logout();
                return redirect()->route('login')->with('info', 'Students should use the mobile application.');
            default:
                Auth::logout();
                return redirect()->route('login')->with('error', 'Invalid user role. Please contact administrator.');
        }
    }
    return Inertia::render('auth/Login');
});

// Sample file routes
Route::get('/sample_questions.csv', function () {
    return response()->download(public_path('sample_questions_template.csv'));
});

Route::get('/sample_questions_with_images.csv', function () {
    return response()->download(public_path('sample_questions_with_images.csv'));
});

Route::get('/sample_questions_template.xlsx', function () {
    return response()->download(public_path('sample_questions_template.xlsx'));
});



// Route for viewing the test page (GET)
Route::get('/test', function () {
    return inertia('Test');
});

Route::get('/debug_excel_images', function () {
    return response()->file(public_path('debug_excel_images.php'));
});

Route::get('/test_image_extraction', function () {
    return response()->file(public_path('test_image_extraction.php'));
});

// Route for inserting data (POST only)
Route::post('/test/insert', [Testing::class, 'insert'])->name('test.insert');

// APK Download route
Route::get('/download-apk', function () {
    return Inertia::render('DownloadApk');
})->name('download-apk');

// Auth routes
Route::get('/login', [AuthController::class, 'showLogin'])->name('login')->middleware(['guest', 'prevent.back', 'auth.validator']);
Route::post('/login', [AuthController::class, 'login'])->name('login.post')->middleware(['guest', 'prevent.back', 'auth.validator']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
Route::get('/auth-check', [AuthController::class, 'checkAuthStatus'])->name('auth.check');

// Password Reset routes
Route::get('/forgot-password', [PasswordResetController::class, 'showForgotPassword'])->name('forgot-password')->middleware('guest');
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetCode'])->name('forgot-password.post')->middleware('guest');
Route::get('/reset-password', [PasswordResetController::class, 'showResetForm'])->name('reset-password')->middleware('guest');
Route::post('/reset-password/verify', [PasswordResetController::class, 'verifyCode'])->name('reset-password.verify')->middleware('guest');
Route::post('/reset-password/update', [PasswordResetController::class, 'resetPassword'])->name('reset-password.update')->middleware('guest');

// Student Registration routes
Route::get('/register', [AuthController::class, 'showRegister'])->name('register')->middleware(['guest', 'prevent.back', 'auth.validator']);
Route::post('/register', [AuthController::class, 'register'])->name('register.post')->middleware(['guest', 'prevent.back', 'auth.validator']);
Route::post('/register/start', [AuthController::class, 'startRegistration'])->name('register.start')->middleware(['guest', 'prevent.back', 'auth.validator']);
Route::post('/register/resend', [AuthController::class, 'resendRegistrationCode'])->name('register.resend')->middleware(['guest', 'prevent.back', 'auth.validator']);
// Verification screen
Route::get('/register/verify', [AuthController::class, 'showVerify'])->name('register.verify.view')->middleware(['guest', 'prevent.back', 'auth.validator']);
Route::post('/register/verify', [AuthController::class, 'verifyAndCompleteRegistration'])->name('register.verify')->middleware(['guest', 'prevent.back', 'auth.validator']);

// Protected routes for Evaluator and Guidance
Route::middleware(['auth', 'prevent.back', 'auth.validator'])->group(function () {
    // Evaluator routes
    Route::prefix('evaluator')->name('evaluator.')->group(function () {
        // Main evaluator functionality
        Route::get('/dashboard', [EvaluatorController::class, 'dashboard'])->name('dashboard');
        Route::get('/profile', [EvaluatorController::class, 'profile'])->name('profile');
        Route::put('/profile', [EvaluatorController::class, 'updateProfile'])->name('profile.update');
        Route::put('/profile/password', [EvaluatorController::class, 'updatePassword'])->name('profile.password');
        
        // Department exam management
        Route::get('/exam-builder', [DepartmentExamController::class, 'builder'])->name('exam-builder');
        Route::get('/department-exams', [DepartmentExamController::class, 'index'])->name('department-exams');
        Route::post('/department-exams', [DepartmentExamController::class, 'store'])->name('department-exams.store');
        Route::get('/department-exams/{id}', [DepartmentExamController::class, 'show'])->name('department-exams.show');
        Route::put('/department-exams/{id}', [DepartmentExamController::class, 'update'])->name('department-exams.update');
        Route::delete('/department-exams/{id}', [DepartmentExamController::class, 'destroy'])->name('department-exams.delete');
        
        // Department Exam Results
        Route::get('/exam-results', [DepartmentExamController::class, 'examResults'])->name('exam-results');
        Route::get('/exam-results/{id}', [DepartmentExamController::class, 'showExamResult'])->name('exam-results.show');
        Route::get('/exam-results-export', [DepartmentExamController::class, 'exportPdf'])->name('exam-results.export');
        Route::get('/exam-results/{id}/export', [DepartmentExamController::class, 'exportSinglePdf'])->name('exam-results.single-export');
        
        // Debug route
        Route::get('/debug-exam-results', function() {
            $count = \App\Models\DepartmentExamResult::count();
            $results = \App\Models\DepartmentExamResult::all();
            return response()->json([
                'count' => $count,
                'results' => $results->toArray()
            ]);
        });
        
        // Question bank management
        Route::get('/question-bank', [QuestionBankController::class, 'index'])->name('question-bank');
        Route::get('/question-builder', [QuestionBankController::class, 'builder'])->name('question-builder');
        Route::post('/question-bank', [QuestionBankController::class, 'store'])->name('question-bank.store');
        Route::post('/question-bank/bulk', [QuestionBankController::class, 'bulkStore'])->name('question-bank.bulk-store');
        Route::get('/question-bank/{id}', [QuestionBankController::class, 'show'])->name('question-bank.show');
        Route::put('/question-bank/{id}', [QuestionBankController::class, 'update'])->name('question-bank.update');
        Route::delete('/question-bank/{id}', [QuestionBankController::class, 'destroy'])->name('question-bank.delete');
        Route::post('/question-bank/bulk-archive', [QuestionBankController::class, 'bulkArchive'])->name('question-bank.bulk-archive');
        Route::get('/archived-questions', [QuestionBankController::class, 'archivedQuestions'])->name('archived-questions');
        Route::put('/question-bank/{id}/restore', [QuestionBankController::class, 'restore'])->name('question-bank.restore');
        Route::post('/question-bank/bulk-restore', [QuestionBankController::class, 'bulkRestore'])->name('question-bank.bulk-restore');
        
        // Question import
        Route::get('/question-import', [EvaluatorQuestionImportController::class, 'index'])->name('question-import');
        Route::post('/question-import', [EvaluatorQuestionImportController::class, 'import'])->name('question-import.store');
        Route::get('/question-import/template', [EvaluatorQuestionImportController::class, 'generateTemplate'])->name('question-import.template');
        
        // [Fixed] Departmental Exam Results (handled by DepartmentExamController)
        // Removed legacy ExamResultsController routes that shadowed the departmental results page
        
        // Student results
        Route::get('/student-results', [StudentResultsController::class, 'index'])->name('student-results');
        Route::get('/student-results/{id}', [StudentResultsController::class, 'show'])->name('student-results.show');
        Route::get('/student-results/{id}/verify', [StudentResultsController::class, 'verifyStudent'])->name('student-results.verify');
        Route::get('/student-results/export', [StudentResultsController::class, 'export'])->name('student-results.export');
        
        // Legacy routes for backward compatibility
        Route::get('/exams', [EvaluatorController::class, 'exams'])->name('exams');
        Route::get('/results', [EvaluatorController::class, 'results'])->name('results');
        Route::get('/students', [EvaluatorController::class, 'students'])->name('students');
    });

    // Guidance Counselor routes
    Route::prefix('guidance')->name('guidance.')->group(function () {

        
        Route::get('/dashboard', [GuidanceController::class, 'dashboard'])->name('dashboard');
        Route::get('/profile', [GuidanceController::class, 'profile'])->name('profile');
        Route::get('/students', [GuidanceController::class, 'students'])->name('students');
        Route::get('/recommendations', [GuidanceController::class, 'recommendations'])->name('recommendations');
        Route::get('/reports', [GuidanceController::class, 'reports'])->name('reports');
        
        // Question Bank Management
        Route::get('/question-bank', [GuidanceController::class, 'questionBank'])->name('question-bank');
        Route::get('/questions/builder', [GuidanceController::class, 'questionBuilder'])->name('questions.builder');
        Route::post('/questions/bulk-create', [GuidanceController::class, 'bulkCreateQuestions'])->name('questions.bulk-create');
        Route::get('/archived-questions', [GuidanceController::class, 'archivedQuestions'])->name('archived-questions');
        Route::post('/questions/upload', [QuestionImportController::class, 'uploadQuestions'])->name('questions.upload');
        Route::get('/questions/template', [QuestionImportController::class, 'generateExcelTemplate'])->name('questions.template');
        Route::get('/questions/csv-template', [QuestionImportController::class, 'generateCsvTemplate'])->name('questions.csv-template');
        Route::delete('/questions/{id}', [GuidanceController::class, 'deleteQuestion'])->name('questions.delete');
        Route::put('/questions/{id}', [GuidanceController::class, 'updateQuestion'])->name('questions.update');
        Route::post('/questions/bulk-archive', [GuidanceController::class, 'bulkArchive'])->name('questions.bulk-archive');
        Route::post('/questions/bulk-restore', [GuidanceController::class, 'bulkRestore'])->name('questions.bulk-restore');
        Route::put('/questions/{id}/archive', [GuidanceController::class, 'archiveQuestion'])->name('questions.archive');
        Route::put('/questions/{id}/restore', [GuidanceController::class, 'restoreQuestion'])->name('questions.restore');
        
        // Exam Management
        Route::get('/exam-management', [GuidanceController::class, 'examManagement'])->name('exam-management');
        Route::post('/exams', [\App\Http\Controllers\Guidance\ExamCreationController::class, 'createExam'])->name('exams.store');
        Route::put('/exams/{examId}/toggle-status', [GuidanceController::class, 'toggleExamStatus'])->name('exams.toggle-status');
        
        // Personality Test Management
        Route::get('/personality-test-management', [GuidanceController::class, 'personalityTestManagement'])->name('personality-test-management');
        Route::post('/personality-questions', [GuidanceController::class, 'createPersonalityQuestion'])->name('personality.store');
        Route::post('/personality-questions/upload', [GuidanceController::class, 'uploadPersonalityQuestions'])->name('personality.upload');
        Route::put('/personality-questions/{id}', [GuidanceController::class, 'updatePersonalityQuestion'])->name('personality.update');
        Route::delete('/personality-questions/{id}', [GuidanceController::class, 'deletePersonalityQuestion'])->name('personality.delete');
        
        // Profile Management
        Route::put('/profile', [GuidanceController::class, 'updateProfile'])->name('profile.update');
        
        // Course Management
        Route::get('/course-management', [GuidanceController::class, 'courseManagement'])->name('course-management');
        Route::post('/courses', [GuidanceController::class, 'createCourse'])->name('courses.store');
        Route::put('/courses/{id}', [GuidanceController::class, 'updateCourse'])->name('courses.update');
        Route::delete('/courses/{id}', [GuidanceController::class, 'deleteCourse'])->name('courses.delete');
        
        // Course Description Management
        Route::post('/course-descriptions/generate', [CourseDescriptionController::class, 'generateDescription'])->name('course-descriptions.generate');
        Route::post('/course-descriptions/store', [CourseDescriptionController::class, 'storeDescription'])->name('course-descriptions.store');
        Route::get('/course-descriptions', [CourseDescriptionController::class, 'index'])->name('course-descriptions.index');
        Route::get('/course-descriptions/stats', [CourseDescriptionController::class, 'getStats'])->name('course-descriptions.stats');
        Route::put('/course-descriptions/{id}', [CourseDescriptionController::class, 'update'])->name('course-descriptions.update');
        Route::delete('/course-descriptions/{id}', [CourseDescriptionController::class, 'destroy'])->name('course-descriptions.delete');
        
        // Recommendation Rules Management
Route::get('/recommendation-rules-management', [RecommendationRulesController::class, 'index'])->name('recommendation-rules-management');
Route::post('/recommendation-rules', [RecommendationRulesController::class, 'store'])->name('recommendation-rules.store');
Route::put('/recommendation-rules/{id}', [RecommendationRulesController::class, 'update'])->name('recommendation-rules.update');
Route::delete('/recommendation-rules/{id}', [RecommendationRulesController::class, 'destroy'])->name('recommendation-rules.delete');
Route::post('/generate-all-rules', [RecommendationRulesController::class, 'generateAllRules'])->name('generate-all-rules');
// Exam Result Details (Guidance)
Route::get('/exam-results/{resultId}/details', [GuidanceController::class, 'getExamResultDetails'])->name('exam-results.details');
        
        // Exam Results
        Route::get('/exam-results', [GuidanceController::class, 'examResults'])->name('exam-results');
        Route::post('/exam-results/archive-year', [GuidanceController::class, 'archiveResultsByYear'])->name('exam-results.archive-year');
        Route::post('/exam-results/archive-all', [GuidanceController::class, 'archiveAllResults'])->name('exam-results.archive-all');
        Route::post('/exam-results/unarchive-year', [GuidanceController::class, 'unarchiveResultsByYear'])->name('exam-results.unarchive-year');
        Route::get('/exam-results/archived', [GuidanceController::class, 'archivedExamResults'])->name('exam-results.archived');
        Route::post('/exam-results/{id}/unarchive', [GuidanceController::class, 'unarchiveResult'])->name('exam-results.unarchive');
        
        // Exam Registration Management
        Route::get('/exam-registration-management', [GuidanceController::class, 'examRegistrationManagement'])->name('exam-registration-management');
        Route::put('/registration-settings', [GuidanceController::class, 'updateRegistrationSettings'])->name('registration-settings.update');
        Route::post('/assign-students-to-exams', [GuidanceController::class, 'assignStudentsToExams'])->name('assign-students-to-exams');
        Route::put('/update-exam-date/{id}', [GuidanceController::class, 'updateExamDate'])->name('update-exam-date');
        Route::put('/update-exam-schedule/{id}', [GuidanceController::class, 'updateExamSchedule'])->name('update-exam-schedule');
        Route::post('/sync-schedule-counts', [GuidanceController::class, 'syncScheduleCounts'])->name('sync-schedule-counts');
        Route::post('/generate-schedule-code', [GuidanceController::class, 'generateScheduleExamCode'])->name('generate-schedule-code');
        Route::post('/bulk-generate-schedule-codes', [GuidanceController::class, 'bulkGenerateScheduleExamCodes'])->name('bulk-generate-schedule-codes');
        Route::get('/exams/summaries', [GuidanceController::class, 'getExamSummaries'])->name('exams.summaries');
        Route::post('/trigger-auto-close', [GuidanceController::class, 'triggerAutoClose'])->name('trigger-auto-close');
        Route::post('/close-exam-schedules', [GuidanceController::class, 'closeExamSchedules'])->name('close-exam-schedules');
        Route::post('/update-registration-message', [GuidanceController::class, 'updateRegistrationMessage'])->name('update-registration-message');
        Route::put('/profile/password', [GuidanceController::class, 'updatePassword'])->name('profile.password');
        
        // Results Processing
        Route::post('/process-results', [GuidanceController::class, 'processResults'])->name('results.process');
        
        // Evaluator Management
        Route::get('/evaluator-management', [GuidanceController::class, 'evaluatorManagement'])->name('evaluator-management');
        Route::post('/evaluators', [GuidanceController::class, 'createEvaluator'])->name('evaluators.store');
        Route::delete('/evaluators/{id}', [GuidanceController::class, 'deleteEvaluator'])->name('evaluators.delete');
    });
});

