<?php

namespace App\Http\Controllers\Guidance;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\QuestionBank;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\PersonalityTest;
use App\Models\PersonalityType;
use App\Models\Course;

use App\Models\Examinee;
use App\Models\GuidanceCounselor;
use App\Models\User;
use App\Models\ExamRegistrationSetting;
use App\Models\ExamSchedule;
use App\Models\ExamineeRegistration;
use App\Http\Controllers\Controller;
use Illuminate\Support\Str;

class GuidanceController extends Controller
{
    /**
     * Display the guidance dashboard
     */
    public function dashboard()
    {
        $user = Auth::user();
        $guidanceCounselor = $user->guidanceCounselor;

        $stats = [
            'total_questions' => QuestionBank::where('status', 1)->count(),
            'total_exams' => Exam::count(),
            'active_exams' => Exam::where('status', 'active')->count(),
            'total_results' => ExamResult::count(),
            'total_personality_tests' => PersonalityTest::count(),
            'total_courses' => Course::count(),
            // Total distinct students registered in the system
            'total_students' => Examinee::count(),
        ];

        $recent_exams = Exam::with('results')->latest()->take(5)->get();
        $recent_results = ExamResult::with(['examinee', 'exam'])->latest()->take(10)->get();

        return Inertia::render('Guidance/Dashboard', [
            'user' => $user,
            'guidanceCounselor' => $guidanceCounselor,
            'stats' => $stats,
            'recent_exams' => $recent_exams,
            'recent_results' => $recent_results
        ]);
    }

    /**
     * Display question bank management
     */
    public function questionBank(Request $request)
    {
        $user = Auth::user();
        $guidanceCounselor = $user->guidanceCounselor;
        
        // Get filter parameters from request
        $perPage = $request->get('per_page', 20);
        $category = $request->get('category');
        $sort = $request->get('sort', 'latest');
        
        // Build the query
        $query = QuestionBank::active();
        
        // Apply category filter if specified
        if ($category && $category !== '') {
            $query->where('category', $category);
        }
        
        // Apply sorting
        if ($sort === 'latest') {
            $query->orderBy('created_at', 'desc');
        } else {
            $query->orderBy('created_at', 'asc');
        }
        
        // Handle pagination
        if ($perPage == -1) {
            $questions = $query->get();
            // Convert to pagination format for consistency
            $questions = new \Illuminate\Pagination\LengthAwarePaginator(
                $questions,
                $questions->count(),
                $questions->count(),
                1
            );
        } else {
            $questions = $query->paginate($perPage);
        }
        
        // Get all categories with counts for the dropdown
        $allCategories = QuestionBank::active()
            ->selectRaw('category, COUNT(*) as count')
            ->groupBy('category')
            ->pluck('count', 'category')
            ->toArray();
        
        // Get unique categories for the dropdown
        $categories = QuestionBank::active()->distinct()->pluck('category');

        return Inertia::render('Guidance/QuestionBank', [
            'user' => $user,
            'guidanceCounselor' => $guidanceCounselor,
            'questions' => $questions,
            'categories' => $categories,
            'categoryCounts' => $allCategories,
            'currentFilters' => [
                'category' => $category,
                'sort' => $sort,
                'per_page' => $perPage
            ]
        ]);
    }

    /**
     * Display archived questions
     */
    public function archivedQuestions(Request $request)
    {
        $user = Auth::user();
        $guidanceCounselor = $user->guidanceCounselor;
        
        // Get filter parameters from request
        $perPage = $request->get('per_page', 20);
        $category = $request->get('category');
        $sort = $request->get('sort', 'latest');
        
        // Build the query
        $query = QuestionBank::archived();
        
        // Apply category filter if specified
        if ($category && $category !== '') {
            $query->where('category', $category);
        }
        
        // Apply sorting
        if ($sort === 'latest') {
            $query->orderBy('created_at', 'desc');
        } else {
            $query->orderBy('created_at', 'asc');
        }
        
        // Handle pagination
        if ($perPage == -1) {
            $questions = $query->get();
            // Convert to pagination format for consistency
            $questions = new \Illuminate\Pagination\LengthAwarePaginator(
                $questions,
                $questions->count(),
                $questions->count(),
                1
            );
        } else {
            $questions = $query->paginate($perPage);
        }
        
        // Get all categories with counts for the dropdown
        $allCategories = QuestionBank::archived()
            ->selectRaw('category, COUNT(*) as count')
            ->groupBy('category')
            ->pluck('count', 'category')
            ->toArray();
        
        // Get unique categories for the dropdown
        $categories = QuestionBank::archived()->distinct()->pluck('category');

        return Inertia::render('Guidance/ArchivedQuestions', [
            'user' => $user,
            'guidanceCounselor' => $guidanceCounselor,
            'questions' => $questions,
            'categories' => $categories,
            'categoryCounts' => $allCategories,
            'currentFilters' => [
                'category' => $category,
                'sort' => $sort,
                'per_page' => $perPage
            ]
        ]);
    }

    /**
     * Bulk archive questions
     */
    public function bulkArchive(Request $request)
    {
        $request->validate([
            'questionIds' => 'required|array',
            'questionIds.*' => 'exists:question_bank,questionId'
        ]);

        try {
            QuestionBank::whereIn('questionId', $request->questionIds)->update(['status' => 0]);
            return back()->with('success', count($request->questionIds) . ' questions archived successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to archive questions: ' . $e->getMessage()]);
        }
    }

    /**
     * Bulk restore questions
     */
    public function bulkRestore(Request $request)
    {
        $request->validate([
            'questionIds' => 'required|array',
            'questionIds.*' => 'exists:question_bank,questionId'
        ]);

        try {
            QuestionBank::whereIn('questionId', $request->questionIds)->update(['status' => 1]);
            return back()->with('success', count($request->questionIds) . ' questions restored successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to restore questions: ' . $e->getMessage()]);
        }
    }

    /**
     * Archive a single question
     */
    public function archiveQuestion($id)
    {
        try {
            QuestionBank::where('questionId', $id)->update(['status' => 0]);
            return back()->with('success', 'Question archived successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to archive question']);
        }
    }

    /**
     * Restore a single question
     */
    public function restoreQuestion($id)
    {
        try {
            QuestionBank::where('questionId', $id)->update(['status' => 1]);
            return back()->with('success', 'Question restored successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to restore question']);
        }
    }







    private function stripDataUrlPrefix(string $data): string
    {
        if (strpos($data, 'data:image') === 0) {
            $parts = explode(',', $data, 2);
            return $parts[1] ?? $data;
        }
        return $data;
    }

    /**
     * Get MIME type from drawing
     */
    private function getMimeTypeFromDrawing($drawing)
    {
        $extension = strtolower(pathinfo($drawing->getName(), PATHINFO_EXTENSION));
        
        $mimeTypes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'bmp' => 'image/bmp',
            'webp' => 'image/webp'
        ];
        
        return $mimeTypes[$extension] ?? 'image/jpeg';
    }















    /**
     * Delete a question
     */
    public function deleteQuestion($id)
    {
        try {
            QuestionBank::where('questionId', $id)->delete();
            return back()->with('success', 'Question deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete question']);
        }
    }

    /**
     * Update a question
     */
    public function updateQuestion(Request $request, $id)
    {
        $request->validate([
            'question' => 'required|string',
            'option1' => 'required|string',
            'option2' => 'required|string',
            'option3' => 'required|string',
            'option4' => 'required|string',
            'option5' => 'nullable|string',
            'correct_answer' => 'required|string|max:1|in:A,B,C,D,E',
            'category' => 'required|string',
            'direction' => 'nullable|string',
            'image' => 'nullable|string',
            'option1_image' => 'nullable|string',
            'option2_image' => 'nullable|string',
            'option3_image' => 'nullable|string',
            'option4_image' => 'nullable|string',
            'option5_image' => 'nullable|string',
            'question_formatted' => 'nullable|string',
            'option1_formatted' => 'nullable|string',
            'option2_formatted' => 'nullable|string',
            'option3_formatted' => 'nullable|string',
            'option4_formatted' => 'nullable|string',
            'option5_formatted' => 'nullable|string'
        ]);

        try {
            $updateData = $request->all();
            
            // Handle image data if provided
            if ($request->has('image')) {
                if (!empty($request->image)) {
                    $imageData = $request->image;
                    // Check if it's a base64 encoded image
                    if (strpos($imageData, 'data:image') === 0) {
                        // Extract base64 data
                        $imageData = explode(',', $imageData)[1] ?? $imageData;
                    }
                    $updateData['image'] = $imageData;
                } else {
                    // If image is empty or null, set it to null to remove the image
                    $updateData['image'] = null;
                }
            }
            
            // Handle option image data if provided
            for ($i = 1; $i <= 5; $i++) {
                $imageField = "option{$i}_image";
                if ($request->has($imageField)) {
                    if (!empty($request->$imageField)) {
                        $imageData = $request->$imageField;
                        // Check if it's a base64 encoded image
                        if (strpos($imageData, 'data:image') === 0) {
                            // Extract base64 data
                            $imageData = explode(',', $imageData)[1] ?? $imageData;
                        }
                        $updateData[$imageField] = $imageData;
                    } else {
                        // If image is empty or null, set it to null to remove the image
                        $updateData[$imageField] = null;
                    }
                }
            }
            
            QuestionBank::where('questionId', $id)->update($updateData);
            return back()->with('success', 'Question updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update question']);
        }
    }

    /**
     * Display exam management
     */
    public function examManagement(Request $request)
    {
        try {
            $user = Auth::user();
            $guidanceCounselor = $user->guidanceCounselor;
            
            // Get items per page from request, default to 20
            $perPage = $request->get('per_page', 20);
            
            // Handle "All" option (-1 means show all)
            if ($perPage == -1) {
                $exams = Exam::with(['questions', 'personalityQuestions', 'results'])->latest()->get();
                // Convert to pagination format for consistency
                $exams = new \Illuminate\Pagination\LengthAwarePaginator(
                    $exams,
                    $exams->count(),
                    $exams->count(),
                    1
                );
            } else {
                $exams = Exam::with(['questions', 'personalityQuestions', 'results'])->latest()->paginate($perPage);
            }
            
            // Ensure relationships are loaded for Inertia serialization
            $exams->getCollection()->load(['questions', 'personalityQuestions', 'results']);
            
            // Convert to array to ensure relationships are included in serialization
            $examsArray = $exams->toArray();
            $examsArray['data'] = $exams->getCollection()->map(function($exam) {
                return [
                    'examId' => $exam->examId,
                    'exam-ref-no' => $exam->{'exam-ref-no'},
                    'time_limit' => $exam->time_limit,
                    'status' => $exam->status,
                    'include_personality_test' => $exam->include_personality_test,
                    'created_at' => $exam->created_at,
                    'updated_at' => $exam->updated_at,
                    'questions' => $exam->questions->toArray(),
                    'personalityQuestions' => $exam->personalityQuestions->toArray(),
                    'results' => $exam->results->toArray(),
                ];
            })->toArray();
            
            $categories = QuestionBank::active()->distinct()->pluck('category');
            $questions = QuestionBank::active()->get();
            
            // Get personality test data
            $personalityDichotomies = PersonalityTest::active()->distinct()->pluck('dichotomy');
            $personalityQuestions = PersonalityTest::active()->get();

            // Log the data being passed for debugging
            Log::info('examManagement data:', [
                'user_id' => $user->id,
                'guidance_counselor' => $guidanceCounselor ? $guidanceCounselor->id : null,
                'exams_count' => $exams->count(),
                'categories_count' => $categories->count(),
                'questions_count' => $questions->count(),
                'personality_dichotomies_count' => $personalityDichotomies->count(),
                'personality_questions_count' => $personalityQuestions->count()
            ]);





            return Inertia::render('Guidance/ExamManagement', [
                'user' => $user,
                'guidanceCounselor' => $guidanceCounselor,
                'exams' => $examsArray,
                'categories' => $categories,
                'questions' => $questions,
                'personalityDichotomies' => $personalityDichotomies,
                'personalityQuestions' => $personalityQuestions
            ]);
        } catch (\Exception $e) {
            Log::error('Error in examManagement: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to load exam management: ' . $e->getMessage()]);
        }
    }

    /**
     * Toggle exam status
     */
    public function toggleExamStatus(Request $request, $examId)
    {
        try {
            $exam = Exam::findOrFail($examId);
            $newStatus = $exam->status === 'active' ? 'inactive' : 'active';
            $exam->update(['status' => $newStatus]);
            
            return back()->with('success', "Exam status updated to {$newStatus}");
        } catch (\Exception $e) {
            Log::error('Error toggling exam status: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update exam status']);
        }
    }



    /**
     * Display personality test management
     */
    public function personalityTestManagement(Request $request)
    {
        try {
            $user = Auth::user();
            $guidanceCounselor = $user->guidanceCounselor;
            
            // Get items per page from request, default to 20
            $perPage = $request->get('per_page', 20);
            
            // Handle "All" option (-1 means show all)
            if ($perPage == -1) {
                $questions = PersonalityTest::active()->orderBy('created_at', 'desc')->get();
                // Convert to pagination format for consistency
                $questions = new \Illuminate\Pagination\LengthAwarePaginator(
                    $questions,
                    $questions->count(),
                    $questions->count(),
                    1
                );
            } else {
                $questions = PersonalityTest::active()->orderBy('created_at', 'desc')->paginate($perPage);
            }
            
            $personalityTypes = PersonalityType::all();

            // Log the data being passed for debugging
            Log::info('personalityTestManagement data:', [
                'user_id' => $user->id,
                'guidance_counselor' => $guidanceCounselor ? $guidanceCounselor->id : null,
                'questions_count' => $questions->count(),
                'personality_types_count' => $personalityTypes->count()
            ]);

            return Inertia::render('Guidance/PersonalityTestManagement', [
                'user' => $user,
                'guidanceCounselor' => $guidanceCounselor,
                'questions' => $questions,
                'personalityTypes' => $personalityTypes
            ]);
        } catch (\Exception $e) {
            Log::error('Error in personalityTestManagement: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to load personality test management: ' . $e->getMessage()]);
        }
    }

    /**
     * Create personality test questions
     */
    public function createPersonalityQuestion(Request $request)
    {
        $request->validate([
            'question' => 'required|string',
            'dichotomy' => 'required|in:E/I,S/N,T/F,J/P',
            'positive_side' => 'required|string|max:1',
            'negative_side' => 'required|string|max:1'
        ]);

        $question = PersonalityTest::create([
            'question' => $request->question,
            'option1' => 'Yes',
            'option2' => 'No',
            'dichotomy' => $request->dichotomy,
            'positive_side' => $request->positive_side,
            'negative_side' => $request->negative_side
        ]);

        return redirect()->route('guidance.personality-test-management')->with('success', 'Personality question created successfully');
    }

    /**
     * Update personality test question
     */
    public function updatePersonalityQuestion(Request $request, $id)
    {
        $request->validate([
            'question' => 'required|string',
            'dichotomy' => 'required|in:E/I,S/N,T/F,J/P',
            'positive_side' => 'required|string|max:1',
            'negative_side' => 'required|string|max:1'
        ]);

        try {
            PersonalityTest::find($id)->update($request->all());
            return back()->with('success', 'Personality question updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update personality question']);
        }
    }

    /**
     * Delete personality test question
     */
    public function deletePersonalityQuestion($id)
    {
        try {
            PersonalityTest::find($id)->delete();
            return back()->with('success', 'Personality question deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete personality question']);
        }
    }

    /**
     * Upload personality questions via CSV file
     */
    public function uploadPersonalityQuestions(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:2048'
        ]);

        try {
            $file = $request->file('csv_file');
            $path = $file->store('temp');
            $fullPath = Storage::path($path);

            $questions = [];
            if (($handle = fopen($fullPath, "r")) !== FALSE) {
                // Skip header row
                fgetcsv($handle);
                
                while (($data = fgetcsv($handle)) !== FALSE) {
                    if (count($data) >= 5) {
                        $questions[] = [
                            'question' => $data[0],
                            'dichotomy' => $data[1],
                            'positive_side' => $data[2],
                            'negative_side' => $data[3],
                            'option1' => 'Yes',
                            'option2' => 'No',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                }
                fclose($handle);
            }

            // Delete the temporary file
            Storage::delete($path);

            if (!empty($questions)) {
                PersonalityTest::insert($questions);
                return back()->with('success', count($questions) . ' personality questions uploaded successfully');
            } else {
                return back()->withErrors(['error' => 'No valid questions found in CSV file']);
            }
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to upload CSV file: ' . $e->getMessage()]);
        }
    }

    /**
     * Display course management
     */
    public function courseManagement()
    {
        $user = Auth::user();
        $guidanceCounselor = $user->guidanceCounselor;
        $courses = Course::orderBy('created_at', 'desc')->get();

        return Inertia::render('Guidance/CourseManagement', [
            'user' => $user,
            'guidanceCounselor' => $guidanceCounselor,
            'courses' => $courses
        ]);
    }

    /**
     * Create a course
     */
    public function createCourse(Request $request)
    {
        $request->validate([
            'course_code' => 'required|string|unique:courses,course_code',
            'course_name' => 'required|string',
            'description' => 'nullable|string',
            'passing_rate' => 'required|integer|min:10|max:100'
        ]);

        $course = Course::create($request->all());

        return redirect()->route('guidance.course-management')->with('success', 'Course created successfully. Use "Generate All Rules" button to create recommendation rules.');
    }

    /**
     * Update a course
     */
    public function updateCourse(Request $request, $id)
    {
        $request->validate([
            'course_code' => 'required|string|unique:courses,course_code,' . $id,
            'course_name' => 'required|string',
            'description' => 'nullable|string',
            'passing_rate' => 'required|integer|min:10|max:100'
        ]);

        try {
            Course::find($id)->update($request->all());
            return back()->with('success', 'Course updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update course']);
        }
    }

    /**
     * Delete a course
     */
    public function deleteCourse($id)
    {
        try {
            Course::find($id)->delete();
            return back()->with('success', 'Course deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete course']);
        }
    }



    /**
     * Display exam results
     */
    public function examResults(Request $request)
    {
        $user = Auth::user();
        $guidanceCounselor = $user->guidanceCounselor;

        $year = $request->get('year');
        $includeArchived = filter_var($request->get('include_archived', 'false'), FILTER_VALIDATE_BOOLEAN);

        $query = ExamResult::with(['examinee', 'exam'])->latest();
        if (!$includeArchived) {
            $query->where('is_archived', 1);
        }
        if ($year) {
            $query->whereYear('created_at', (int) $year);
        }
        $results = $query->paginate(20);

        // Attach recommended courses for each exam result
        $resultIds = $results->getCollection()->pluck('resultId')->all();
        if (!empty($resultIds)) {
            $recs = DB::table('examinee_recommendations as er')
                ->join('courses as c', 'er.recommended_course_id', '=', 'c.id')
                ->select('er.exam_result_id', 'c.id as course_id', 'c.course_name', 'c.course_code')
                ->whereIn('er.exam_result_id', $resultIds)
                ->get()
                ->groupBy('exam_result_id');

            $results->getCollection()->transform(function($result) use ($recs) {
                $attached = $recs->get($result->resultId) ?? collect();
                $result->recommended_courses = $attached->map(function($r){
                    return [
                        'course_id' => $r->course_id,
                        'course_name' => $r->course_name,
                        'course_code' => $r->course_code,
                    ];
                })->values();
                return $result;
            });
        }

        // Years list for filters
        $years = DB::table('exam_results')
            ->selectRaw('DISTINCT YEAR(created_at) as y')
            ->orderBy('y', 'desc')
            ->pluck('y');

        return Inertia::render('Guidance/ExamResults', [
            'user' => $user,
            'guidanceCounselor' => $guidanceCounselor,
            'results' => $results,
            'filters' => [
                'year' => $year,
                'include_archived' => $includeArchived,
            ],
            'years' => $years,
        ]);
    }

    /**
     * Get detailed exam result data: questions and student's answers
     */
    public function getExamResultDetails($resultId)
    {
        try {
            /** @var \App\Models\User $user */
            $user = Auth::user();
            if (!$user || !$user->guidanceCounselor) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            $examResult = \App\Models\ExamResult::with(['examinee', 'exam'])->where('resultId', $resultId)->first();
            if (!$examResult) {
                return response()->json(['success' => false, 'message' => 'Exam result not found'], 404);
            }

            // Fetch examinee answers joined with questions
            $answers = DB::table('examinee_answer as ea')
                ->join('question_bank as q', 'ea.questionId', '=', 'q.questionId')
                ->select(
                    'ea.questionId',
                    'ea.selected_answer as student_answer',
                    'ea.is_correct',
                    'q.question',
                    'q.correct_answer',
                    'q.option1', 'q.option2', 'q.option3', 'q.option4', 'q.option5'
                )
                ->where('ea.examId', $examResult->examId)
                ->where('ea.examineeId', $examResult->examineeId)
                ->orderBy('ea.questionId')
                ->get()
                ->map(function($row, $idx) {
                    return [
                        'no' => $idx + 1,
                        'question_id' => $row->questionId,
                        'question' => $row->question,
                        'choices' => array_filter([
                            $row->option1, $row->option2, $row->option3, $row->option4, $row->option5
                        ]),
                        'student_answer' => $row->student_answer,
                        'correct_answer' => $row->correct_answer,
                        'is_correct' => (bool) ($row->is_correct ?? (strtoupper((string)$row->student_answer) === strtoupper((string)$row->correct_answer)))
                    ];
                });

            // Fetch persisted recommended courses for this exam result
            $recommendedCourses = DB::table('examinee_recommendations as er')
                ->join('courses as c', 'er.recommended_course_id', '=', 'c.id')
                ->select('c.id as course_id', 'c.course_name', 'c.course_code', 'c.passing_rate')
                ->where('er.exam_result_id', $examResult->resultId)
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Exam result details retrieved',
                'data' => [
                    'exam_ref_no' => optional($examResult->exam)->{'exam-ref-no'} ?? 'N/A',
                    'examinee' => [
                        'id' => $examResult->examineeId,
                        'name' => optional($examResult->examinee)->name,
                    ],
                    'score' => $examResult->percentage,
                    'time_taken' => $examResult->time_taken,
                    'time_taken_seconds' => $examResult->time_taken_seconds,
                    'created_at' => $examResult->created_at,
                    'recommended_courses' => $recommendedCourses,
                    'answers' => $answers,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to load details: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get recommended courses for an examinee based on their score and personality
     */
    private function getRecommendedCoursesForExaminee($examineeId, $score)
    {
        try {
            // Get the examinee's personality type
            $personalityResult = DB::table('personality_test_results')
                ->where('examineeId', $examineeId)
                ->orderBy('created_at', 'desc')
                ->first();
            
            if (!$personalityResult) {
                return [];
            }
            
            $personalityType = $personalityResult->EI . $personalityResult->SN . 
                              $personalityResult->TF . $personalityResult->JP;
            
            // Get recommendation rules that match the personality type and score
            $rules = DB::table('recommendation_rules as rr')
                ->join('courses as c', 'rr.course_id', '=', 'c.course_id')
                ->select('c.course_id', 'c.course_name', 'c.course_description', 'c.passing_rate', 'rr.min_score', 'rr.max_score')
                ->where('rr.personality_type', $personalityType)
                ->where('rr.min_score', '<=', $score)
                ->where('rr.max_score', '>=', $score)
                ->where('c.passing_rate', '<=', $score) // Student score must meet course passing rate
                ->orderBy('rr.min_score', 'desc')
                ->get()
                ->map(function($rule) use ($score) {
                    return [
                        'course_id' => $rule->course_id,
                        'course_name' => $rule->course_name,
                        'course_description' => $rule->course_description,
                        'passing_rate' => $rule->passing_rate,
                        'score_range' => $rule->min_score . '% - ' . $rule->max_score . '%',
                        'student_score' => $score
                    ];
                });
            
            return $rules->toArray();
        } catch (\Exception $e) {
            Log::error('[GuidanceController] Error getting recommended courses: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Process exam results and generate recommendations
     */
    public function processResults()
    {
        try {
            DB::beginTransaction();

            // Get all examinees with exam results but no recommendations
            $examinees = Examinee::whereHas('examResults', function($query) {
                $query->where('status', 'completed');
            })->whereDoesntHave('recommendations')->get();

            $recommendationController = new \App\Http\Controllers\Guidance\AI\RecommendationRulesController();
            foreach ($examinees as $examinee) {
                $recommendationController->generateRecommendations($examinee);
            }

            DB::commit();

            return back()->with('success', 'Results processed successfully')->with('processed_count', $examinees->count());

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to process results: ' . $e->getMessage()]);
        }
    }

    /**
     * Archive all exam results by year
     */
    public function archiveResultsByYear(Request $request)
    {
        $request->validate([
            'year' => 'required|digits:4'
        ]);

        $year = (int) $request->year;
        $count = ExamResult::whereYear('created_at', $year)->update(['is_archived' => 0]);

        return back()->with('success', "Archived {$count} results for {$year}");
    }

    /**
     * Archive all exam results (no year filter)
     */
    public function archiveAllResults()
    {
        $count = ExamResult::query()->update(['is_archived' => 0]);
        return back()->with('success', "Archived {$count} results");
    }

    /**
     * Unarchive all exam results by year
     */
    public function unarchiveResultsByYear(Request $request)
    {
        $request->validate([
            'year' => 'required|digits:4'
        ]);

        $year = (int) $request->year;
        $count = ExamResult::whereYear('created_at', $year)->update(['is_archived' => 1]);

        return back()->with('success', "Unarchived {$count} results for {$year}");
    }

    /**
     * Show archived exam results page
     */
    public function archivedExamResults(Request $request)
    {
        $user = Auth::user();
        $guidanceCounselor = $user->guidanceCounselor;

        $year = $request->get('year');
        $query = ExamResult::with(['examinee','exam'])->latest()->where('is_archived', 0);
        if ($year) {
            $query->whereYear('created_at', (int) $year);
        }
        $results = $query->paginate(20);

        $years = DB::table('exam_results')
            ->selectRaw('DISTINCT YEAR(created_at) as y')
            ->orderBy('y', 'desc')
            ->pluck('y');

        return Inertia::render('Guidance/ExamResultsArchived', [
            'user' => $user,
            'guidanceCounselor' => $guidanceCounselor,
            'results' => $results,
            'filters' => [ 'year' => $year ],
            'years' => $years,
        ]);
    }

    /**
     * Unarchive a single exam result
     */
    public function unarchiveResult($id)
    {
        $updated = ExamResult::where('resultId', $id)->update(['is_archived' => 1]);
        if ($updated) {
            return back()->with('success', 'Result unarchived');
        }
        return back()->withErrors(['error' => 'Result not found']);
    }



    // Legacy methods for backward compatibility
    public function profile()
    {
        $user = Auth::user();
        $guidanceCounselor = $user->guidanceCounselor;

        return Inertia::render('Guidance/Profile', [
            'user' => $user,
            'guidanceCounselor' => $guidanceCounselor,
        ]);
    }

    /**
     * Update guidance counselor profile
     */
    public function updateProfile(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $guidanceCounselor = $user->guidanceCounselor;

        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,' . $user->id,
            'email' => 'required|email|unique:users,email,' . $user->id,
            'address' => 'nullable|string|max:500'
        ]);

        try {
            DB::beginTransaction();

            // Update user information
            $user->update([
                'username' => $request->username,
                'email' => $request->email
            ]);

            // Update guidance counselor information
            if ($guidanceCounselor) {
                $guidanceCounselor->update([
                    'name' => $request->name,
                    'address' => $request->address
                ]);
            } else {
                // Create guidance counselor record if it doesn't exist
                GuidanceCounselor::create([
                    'accountId' => $user->id,
                    'name' => $request->name,
                    'address' => $request->address
                ]);
            }

            DB::commit();
            return back()->with('success', 'Profile updated successfully');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to update profile: ' . $e->getMessage()]);
        }
    }

    public function students()
    {
        $user = Auth::user();
        
        return Inertia::render('Guidance/Students', [
            'user' => $user,
        ]);
    }

    public function recommendations()
    {
        $user = Auth::user();
        
        return Inertia::render('Guidance/Recommendations', [
            'user' => $user,
        ]);
    }

    public function reports()
    {
        $user = Auth::user();
        
        return Inertia::render('Guidance/Reports', [
            'user' => $user,
        ]);
    }

    /**
     * Display exam registration management
     */
    public function examRegistrationManagement()
    {
        $user = Auth::user();
        $guidanceCounselor = $user->guidanceCounselor;
        
        // Sync all schedule counts before loading the page
        $this->syncAllScheduleCounts();
        
        $settings = ExamRegistrationSetting::getCurrentSettings();
        
        // If no settings exist in database, create initial settings
        if (!$settings->exists) {
            $settings = ExamRegistrationSetting::create([
                'registration_open' => false,
                'students_per_day' => 40,
                'exam_start_date' => null,
                'exam_end_date' => null,
                'registration_message' => null
            ]);
        }
        
        // Auto-close registration if exam period has ended
        $this->autoCloseRegistrationIfExpired($settings);
        
        // Refresh settings after potential auto-close
        $settings->refresh();
        
        // Get registrations with important data only
        $registrations = ExamineeRegistration::with(['examinee.user'])
            ->select('id', 'examinee_id', 'assigned_exam_date', 'assigned_session', 'registration_date', 'status', 'created_at')
            ->latest()
            ->paginate(20);
        
        // Get schedules with dynamically calculated registration counts, grouped by date
        $schedules = ExamSchedule::select('id', 'exam_date', 'session', 'start_time', 'end_time', 'max_capacity', 'current_registrations', 'status', 'exam_code')
            ->orderBy('exam_date')
            ->orderBy('session')
            ->get()
            ->map(function ($schedule) {
                // Count actual registrations for this date and session
                $actualCount = ExamineeRegistration::where('assigned_exam_date', $schedule->exam_date)
                    ->where('assigned_session', $schedule->session)
                    ->count();
                
                // Update the current_registrations field if it's out of sync
                if ($schedule->current_registrations != $actualCount) {
                    Log::info('[GuidanceController] Syncing schedule count', [
                        'exam_date' => $schedule->exam_date,
                        'session' => $schedule->session,
                        'old_count' => $schedule->current_registrations,
                        'actual_count' => $actualCount
                    ]);
                    $schedule->update(['current_registrations' => $actualCount]);
                }
                
                // Return schedule with correct count
                $schedule->current_registrations = $actualCount;
                
                // Update status based on actual count
                if ($actualCount >= $schedule->max_capacity) {
                    $schedule->status = 'full';
                } elseif ($schedule->status === 'full' && $actualCount < $schedule->max_capacity) {
                    $schedule->status = 'open';
                }
                
                return $schedule;
            })
            ->groupBy('exam_date'); // Group schedules by date for easier frontend handling

        // Calculate total registrations
        $totalRegistrations = ExamineeRegistration::count();

        return Inertia::render('Guidance/ExamRegistrationManagement', [
            'user' => $user,
            'guidanceCounselor' => $guidanceCounselor,
            'settings' => $settings,
            'registrations' => [
                'data' => $registrations->items(),
                'total' => $totalRegistrations,
                'current_page' => $registrations->currentPage(),
                'last_page' => $registrations->lastPage(),
                'per_page' => $registrations->perPage()
            ],
            'schedules' => $schedules
        ]);
    }

    /**
     * Generate or regenerate an exam code for a specific exam date.
     * Applies the same code to both sessions for that date.
     */
    public function generateScheduleExamCode(Request $request)
    {
        $request->validate([
            'exam_date' => 'required|date'
        ]);

        $examDate = $request->input('exam_date');
        // Choose a random active exam and use a shuffled variant of its exam-ref-no as the code
        $activeExams = Exam::where('status', 'active')->get();
        if ($activeExams->isEmpty()) {
            return back()->withErrors(['error' => 'No active exams available. Please create an exam first.']);
        }

        $exam = $activeExams->random();
        $baseRef = $exam->{'exam-ref-no'};
        $code = $this->generateUniqueShuffledCode($baseRef);

        // Update all sessions for the date
        ExamSchedule::where('exam_date', $examDate)->update(['exam_code' => $code]);

        Log::info('[GuidanceController] Assigned existing exam-ref-no to schedule', [
            'exam_date' => $examDate,
            'exam_code' => $code,
            'exam_id' => $exam->examId
        ]);

        return back()->with('success', 'Exam code assigned for ' . $examDate)->with('exam_code', $code);
    }

    /**
     * Bulk-generate exam codes for a date range (overwrites existing).
     */
    public function bulkGenerateScheduleExamCodes(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'exam_id' => 'nullable|integer'
        ]);

        $start = \Carbon\Carbon::parse($request->start_date);
        $end = \Carbon\Carbon::parse($request->end_date);

        $activeExams = Exam::where('status', 'active')->get();
        if ($activeExams->isEmpty()) {
            return back()->withErrors(['error' => 'No active exams available. Please create an exam first.']);
        }

        // If a specific exam is selected, validate and use it
        $selectedExam = null;
        if ($request->filled('exam_id')) {
            $selectedExam = $activeExams->firstWhere('examId', (int) $request->exam_id);
            if (!$selectedExam) {
                return back()->withErrors(['error' => 'Selected exam is not active or does not exist.']);
            }
        }

        $dates = ExamSchedule::whereBetween('exam_date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->distinct()
            ->pluck('exam_date');

        $generated = 0;
        foreach ($dates as $date) {
            $exam = $selectedExam ?: $activeExams->random();
            $baseRef = $exam->{'exam-ref-no'};
            $code = $this->generateUniqueShuffledCode($baseRef);
            ExamSchedule::where('exam_date', $date)->update(['exam_code' => $code]);
            $generated++;
        }

        Log::info('[GuidanceController] Bulk generated schedule exam codes', [
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'count' => $generated
        ]);

        return back()->with('success', "Generated exam codes for {$generated} dates");
    }

    /**
     * Return a lightweight list of active exams with summary info for UI selection.
     */
    public function getExamSummaries()
    {
        try {
            $exams = Exam::where('status', 'active')
                ->withCount(['questions as questions_count', 'personalityQuestions as personality_questions_count'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($exam) {
                    return [
                        'examId' => $exam->examId,
                        'ref' => $exam->{'exam-ref-no'},
                        'questions_count' => (int) ($exam->questions_count ?? 0),
                        'include_personality_test' => (bool) $exam->include_personality_test,
                        'personality_questions_count' => (int) ($exam->personality_questions_count ?? 0),
                        'time_limit' => $exam->time_limit,
                    ];
                });

            return response()->json([
                'data' => $exams,
            ]);
        } catch (\Exception $e) {
            Log::error('[GuidanceController] getExamSummaries failed', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'error' => 'Failed to load exams',
            ], 500);
        }
    }

    /**
     * Generate a unique shuffled code derived from a base exam-ref-no.
     * Keeps format of 4-8 with a dash after the 4th character.
     */
    private function generateUniqueShuffledCode(string $examRef): string
    {
        // Remove dash and uppercase
        $raw = strtoupper(str_replace('-', '', $examRef));
        $chars = str_split($raw);
        // Try up to 20 shuffles to avoid rare uniqueness collisions
        for ($i = 0; $i < 20; $i++) {
            shuffle($chars);
            $shuffled = implode('', $chars);
            $code = substr($shuffled, 0, 4) . '-' . substr($shuffled, 4);
            if (!ExamSchedule::where('exam_code', $code)->exists()) {
                return $code;
            }
        }
        // Fallback: append a random suffix from base ref to break ties (still same character set mostly)
        $suffix = substr(strtoupper(Str::random(2)), 0, 2);
        $fallback = substr($raw, 0, 4) . '-' . substr($raw, 4, 6) . $suffix;
        if (!ExamSchedule::where('exam_code', $fallback)->exists()) {
            return $fallback;
        }
        // Last resort: use a pure random code (keeps 4-8 format)
        $random = strtoupper(Str::random(12));
        return substr($random, 0, 4) . '-' . substr($random, 4);
    }

    /**
     * Sync all schedule counts with actual registrations
     */
    private function syncAllScheduleCounts()
    {
        Log::info('[GuidanceController] Starting schedule count sync');
        
        $schedules = ExamSchedule::all();
        $syncedCount = 0;
        
        foreach ($schedules as $schedule) {
            $actualCount = ExamineeRegistration::where('assigned_exam_date', $schedule->exam_date)
                ->where('assigned_session', $schedule->session)
                ->count();
            
            if ($schedule->current_registrations != $actualCount) {
                Log::info('[GuidanceController] Syncing schedule', [
                    'exam_date' => $schedule->exam_date,
                    'session' => $schedule->session,
                    'old_count' => $schedule->current_registrations,
                    'actual_count' => $actualCount
                ]);
                
                $schedule->update([
                    'current_registrations' => $actualCount,
                    'status' => $actualCount >= $schedule->max_capacity ? 'full' : 
                               ($schedule->status === 'closed' ? 'closed' : 'open')
                ]);
                
                $syncedCount++;
            }
        }
        
        Log::info('[GuidanceController] Schedule count sync completed', [
            'total_schedules' => $schedules->count(),
            'synced_schedules' => $syncedCount
        ]);
    }

    /**
     * Auto-close registration if exam period has ended
     */
    private function autoCloseRegistrationIfExpired($settings)
    {
        // Check if there's an end date set
        if (!$settings->exam_end_date) {
            return;
        }

        $today = now()->startOfDay();
        $endDate = \Carbon\Carbon::parse($settings->exam_end_date)->endOfDay();

        // If today is after the exam end date, close registration and schedules
        if ($today->gt($endDate)) {
            Log::info('Auto-closing exam registration and schedules - exam period ended', [
                'exam_end_date' => $settings->exam_end_date,
                'today' => $today->format('Y-m-d'),
                'settings_id' => $settings->id,
                'registration_was_open' => $settings->registration_open
            ]);

            // Close the registration settings if it was open
            if ($settings->registration_open) {
                $settings->update([
                    'registration_open' => false,
                    'registration_message' => 'REGISTRATION CLOSED - Exam period has ended'
                ]);
            } else {
                // Even if registration was already closed, update the message
                $settings->update([
                    'registration_message' => 'REGISTRATION CLOSED - Exam period has ended'
                ]);
            }

            // Close all exam schedules that are in the past or on the end date
            $closedSchedules = ExamSchedule::where('exam_date', '<=', $settings->exam_end_date)
                ->where('status', '!=', 'closed')
                ->update(['status' => 'closed']);

            Log::info('Exam registration and schedules auto-closed successfully', [
                'settings_id' => $settings->id,
                'closed_at' => now(),
                'schedules_closed' => $closedSchedules,
                'registration_closed' => $settings->registration_open ? false : true
            ]);
        }
    }

    /**
     * Manually trigger auto-close for all expired registrations
     */
    public function triggerAutoClose()
    {
        try {
            $settings = ExamRegistrationSetting::getCurrentSettings();
            $this->autoCloseRegistrationIfExpired($settings);
            
            return back()->with('success', 'Auto-close check completed successfully');
        } catch (\Exception $e) {
            Log::error('Failed to trigger auto-close', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'Failed to trigger auto-close: ' . $e->getMessage()]);
        }
    }

    /**
     * Manually close all exam schedules for a specific date range
     */
    public function closeExamSchedules(Request $request)
    {
        try {
            $request->validate([
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date'
            ]);

            $closedSchedules = ExamSchedule::whereBetween('exam_date', [$request->start_date, $request->end_date])
                ->where('status', '!=', 'closed')
                ->update(['status' => 'closed']);

            Log::info('Manually closed exam schedules', [
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'schedules_closed' => $closedSchedules
            ]);

            return back()->with('success', "Successfully closed {$closedSchedules} exam schedules");
        } catch (\Exception $e) {
            Log::error('Failed to close exam schedules', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'Failed to close exam schedules: ' . $e->getMessage()]);
        }
    }

    /**
     * Update registration message to indicate closure
     */
    public function updateRegistrationMessage(Request $request)
    {
        try {
            $request->validate([
                'message' => 'required|string|max:1000'
            ]);

            $settings = ExamRegistrationSetting::getCurrentSettings();
            $settings->update(['registration_message' => $request->message]);

            Log::info('Registration message updated', [
                'new_message' => $request->message,
                'settings_id' => $settings->id
            ]);

            return back()->with('success', 'Registration message updated successfully');
        } catch (\Exception $e) {
            Log::error('Failed to update registration message', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'Failed to update registration message: ' . $e->getMessage()]);
        }
    }

    /**
     * Update exam registration settings
     */
    public function updateRegistrationSettings(Request $request)
    {
        $request->validate([
            'registration_open' => 'required|boolean',
            'exam_start_date' => 'required_if:registration_open,true|date|after_or_equal:today',
            'exam_end_date' => 'required_if:registration_open,true|date|after:exam_start_date',
            'students_per_day' => 'required|integer|min:1|max:100',
            'registration_message' => 'nullable|string|max:1000'
        ]);

        try {
            $settings = ExamRegistrationSetting::getCurrentSettings();
            $settings->update($request->all());

            // If registration is being opened, generate exam schedules
            if ($request->registration_open && $request->exam_start_date && $request->exam_end_date) {
                $this->generateExamSchedules($request->exam_start_date, $request->exam_end_date, $request->students_per_day);
            }

            return back()->with('success', 'Registration settings updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update settings: ' . $e->getMessage()]);
        }
    }

    /**
     * Generate exam schedules for the given date range
     */
    private function generateExamSchedules($startDate, $endDate, $studentsPerDay)
    {
        $start = \Carbon\Carbon::parse($startDate);
        $end = \Carbon\Carbon::parse($endDate);
        
        // Clear existing schedules in the date range
        ExamSchedule::whereBetween('exam_date', [$start, $end])->delete();
        
        $halfCapacity = $studentsPerDay / 2;
        
        // Generate new schedules (morning and afternoon sessions)
        for ($date = $start; $date->lte($end); $date->addDay()) {
            // Skip weekends (Saturday = 6, Sunday = 0)
            if ($date->dayOfWeek !== 0 && $date->dayOfWeek !== 6) {
                // Morning session
                ExamSchedule::create([
                    'exam_date' => $date->format('Y-m-d'),
                    'session' => 'morning',
                    'start_time' => '08:00:00',
                    'end_time' => '11:00:00',
                    'max_capacity' => $halfCapacity,
                    'current_registrations' => 0,
                    'status' => 'open'
                ]);
                
                // Afternoon session
                ExamSchedule::create([
                    'exam_date' => $date->format('Y-m-d'),
                    'session' => 'afternoon',
                    'start_time' => '13:00:00',
                    'end_time' => '16:00:00',
                    'max_capacity' => $halfCapacity,
                    'current_registrations' => 0,
                    'status' => 'open'
                ]);
            }
        }
    }

    /**
     * Assign students to exam dates
     */
    public function assignStudentsToExams()
    {
        try {
            $unassignedStudents = ExamineeRegistration::registered()->get();
            $availableSchedules = ExamSchedule::open()->orderBy('exam_date')->get();

            $assignedCount = 0;
            foreach ($unassignedStudents as $student) {
                foreach ($availableSchedules as $schedule) {
                    if ($schedule->hasAvailableSlots()) {
                        $student->update([
                            'assigned_exam_date' => $schedule->exam_date,
                            'status' => 'assigned'
                        ]);

                        $schedule->increment('current_registrations');
                        if ($schedule->current_registrations >= $schedule->max_capacity) {
                            $schedule->update(['status' => 'full']);
                        }

                        $assignedCount++;
                        break;
                    }
                }
            }

            return back()->with('success', "Successfully assigned {$assignedCount} examinees to exam dates");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to assign examinees: ' . $e->getMessage()]);
        }
    }

    /**
     * Update exam date for a specific registration
     */
    public function updateExamDate(Request $request, $id)
    {
        $request->validate([
            'assigned_exam_date' => 'required|date',
            'assigned_session' => 'required|in:morning,afternoon',
        ]);

        try {
            $registration = ExamineeRegistration::findOrFail($id);
            $oldExamDate = $registration->assigned_exam_date;
            $oldSession = $registration->assigned_session;
            
            Log::info('[GuidanceController] updateExamDate - Moving registration', [
                'registration_id' => $id,
                'old_date' => $oldExamDate,
                'old_session' => $oldSession,
                'new_date' => $request->assigned_exam_date,
                'new_session' => $request->assigned_session
            ]);
            
            // Check if the target schedule has available capacity
            $targetSchedule = ExamSchedule::where('exam_date', $request->assigned_exam_date)
                ->where('session', $request->assigned_session)
                ->first();
            
            if ($targetSchedule) {
                // Schedule exists, check if it has available slots
                if (!$targetSchedule->hasAvailableSlots()) {
                    return back()->withErrors(['error' => 'The selected exam session is already full. Please choose a different session.']);
                }
            } else {
                // Schedule doesn't exist, create it
                $settings = ExamRegistrationSetting::getCurrentSettings();
                $halfCapacity = ($settings->students_per_day ?? 100) / 2;
                
                $targetSchedule = ExamSchedule::create([
                    'exam_date' => $request->assigned_exam_date,
                    'session' => $request->assigned_session,
                    'start_time' => $request->assigned_session === 'morning' ? '08:00:00' : '13:00:00',
                    'end_time' => $request->assigned_session === 'morning' ? '11:00:00' : '16:00:00',
                    'max_capacity' => $halfCapacity,
                    'current_registrations' => 0,
                    'status' => 'open'
                ]);
            }
            
            // If there's an old exam date/session, decrement its count
            if ($oldExamDate && $oldSession && 
                ($oldExamDate !== $request->assigned_exam_date || $oldSession !== $request->assigned_session)) {
                $oldSchedule = ExamSchedule::where('exam_date', $oldExamDate)
                    ->where('session', $oldSession)
                    ->first();
                    
                if ($oldSchedule && $oldSchedule->current_registrations > 0) {
                    $oldSchedule->decrement('current_registrations');
                    
                    // Update status of old schedule if it's no longer full
                    if ($oldSchedule->current_registrations < $oldSchedule->max_capacity && $oldSchedule->status === 'full') {
                        $oldSchedule->update(['status' => 'open']);
                    }
                    
                    Log::info('[GuidanceController] updateExamDate - Decremented old schedule', [
                        'old_date' => $oldExamDate,
                        'old_session' => $oldSession,
                        'new_count' => $oldSchedule->current_registrations
                    ]);
                }
            }
            
            // Update the registration
            $registration->update([
                'assigned_exam_date' => $request->assigned_exam_date,
                'assigned_session' => $request->assigned_session,
                'status' => 'assigned'
            ]);

            // Increment the schedule capacity for the new date/session
            $targetSchedule->increment('current_registrations');
            
            // Check if schedule is now full
            if ($targetSchedule->current_registrations >= $targetSchedule->max_capacity) {
                $targetSchedule->update(['status' => 'full']);
            }
            
            Log::info('[GuidanceController] updateExamDate - Incremented new schedule', [
                'new_date' => $request->assigned_exam_date,
                'new_session' => $request->assigned_session,
                'new_count' => $targetSchedule->current_registrations,
                'status' => $targetSchedule->status
            ]);

            return back()->with('success', 'Exam date and session updated successfully');
        } catch (\Exception $e) {
            Log::error('[GuidanceController] updateExamDate - Error', [
                'registration_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->withErrors(['error' => 'Failed to update exam date: ' . $e->getMessage()]);
        }
    }

    /**
     * Update exam schedule details
     */
    public function updateExamSchedule(Request $request, $id)
    {
        $request->validate([
            'exam_date' => 'required|date',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'max_capacity' => 'required|integer|min:1|max:100',
            'status' => 'required|in:open,full,closed',
        ]);

        try {
            $schedule = ExamSchedule::findOrFail($id);
            
            // Update the schedule
            $schedule->update([
                'exam_date' => $request->exam_date,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'max_capacity' => $request->max_capacity,
                'status' => $request->status
            ]);

            return back()->with('success', 'Exam schedule updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update exam schedule: ' . $e->getMessage()]);
        }
    }



    /**
     * Update guidance counselor password
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors(['current_password' => 'Current password is incorrect']);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return back()->with('success', 'Password updated successfully');
    }

    /**
     * Manual trigger to sync all schedule counts (for testing/admin purposes)
     */
    public function syncScheduleCounts()
    {
        try {
            $this->syncAllScheduleCounts();
            return back()->with('success', 'Schedule counts have been synchronized successfully');
        } catch (\Exception $e) {
            Log::error('[GuidanceController] Manual sync failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->withErrors(['error' => 'Failed to sync schedule counts: ' . $e->getMessage()]);
        }
    }

    /**
     * Display evaluator management page
     */
    public function evaluatorManagement()
    {
        $user = Auth::user();
        $guidanceCounselor = $user->guidanceCounselor;

        $evaluators = User::where('role', 'evaluator')
            ->with('evaluator')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'name' => $user->evaluator->name ?? 'N/A',
                    'department' => $user->evaluator->Department ?? 'N/A',
                    'created_at' => $user->created_at->format('M d, Y'),
                ];
            });

        return Inertia::render('Guidance/EvaluatorManagement', [
            'user' => $user,
            'guidanceCounselor' => $guidanceCounselor,
            'evaluators' => $evaluators
        ]);
    }

    /**
     * Create a new evaluator account
     */
    public function createEvaluator(Request $request)
    {
        $request->validate([
            'username' => 'required|string|unique:users,username|min:3|max:50',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'name' => 'required|string|max:255',
            'department' => 'required|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            // Create user account
            $user = User::create([
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'evaluator'
            ]);

            // Create evaluator profile
            $user->evaluator()->create([
                'name' => $request->name,
                'Department' => $request->department
            ]);

            DB::commit();

            return back()->with('success', 'Evaluator account created successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create evaluator account: ' . $e->getMessage()]);
        }
    }

    /**
     * Delete an evaluator account
     */
    public function deleteEvaluator($id)
    {
        try {
            $user = User::where('role', 'evaluator')->findOrFail($id);
            
            // Delete the user (this will cascade delete the evaluator profile)
            $user->delete();

            return back()->with('success', 'Evaluator account deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete evaluator account: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the question builder page
     */
    public function questionBuilder()
    {
        $user = Auth::user();
        
        // Get existing categories for suggestions
        $categories = QuestionBank::select('category')
            ->distinct()
            ->whereNotNull('category')
            ->where('category', '!=', '')
            ->orderBy('category')
            ->pluck('category')
            ->toArray();

        return Inertia::render('Guidance/QuestionBuilder', [
            'user' => $user,
            'categories' => $categories
        ]);
    }

    /**
     * Bulk create questions from the question builder
     */
    public function bulkCreateQuestions(Request $request)
    {
        try {
            $questionsData = json_decode($request->input('questions'), true);
            
            if (!$questionsData || !is_array($questionsData)) {
                return back()->withErrors(['error' => 'Invalid questions data']);
            }

            $createdCount = 0;
            $errors = [];

            DB::beginTransaction();

            foreach ($questionsData as $index => $questionData) {
                try {
                    // Validate required fields
                    if (empty($questionData['question']) || empty($questionData['category'])) {
                        $errors[] = "Question " . ($index + 1) . ": Missing required fields (question text and category)";
                        continue;
                    }

                    // Create the question
                    $question = QuestionBank::create([
                        'question' => $questionData['question'],
                        'option1' => $questionData['option1'] ?? '',
                        'option2' => $questionData['option2'] ?? '',
                        'option3' => $questionData['option3'] ?? '',
                        'option4' => $questionData['option4'] ?? '',
                        'option5' => $questionData['option5'] ?? '',
                        'correct_answer' => $questionData['correct_answer'] ?? 'A',
                        'category' => $questionData['category'],
                        'direction' => $questionData['direction'] ?? '',
                        'image' => $questionData['image'] ?? null,
                        'option1_image' => $questionData['option1_image'] ?? null,
                        'option2_image' => $questionData['option2_image'] ?? null,
                        'option3_image' => $questionData['option3_image'] ?? null,
                        'option4_image' => $questionData['option4_image'] ?? null,
                        'option5_image' => $questionData['option5_image'] ?? null,
                        'status' => 1, // Active
                        'created_by' => Auth::id(),
                    ]);

                    $createdCount++;
                } catch (\Exception $e) {
                    $errors[] = "Question " . ($index + 1) . ": " . $e->getMessage();
                }
            }

            if ($createdCount > 0) {
                DB::commit();
                return back()->with('success', "Successfully created {$createdCount} question(s)");
            } else {
                DB::rollBack();
                return back()->withErrors(['error' => 'No questions were created. Errors: ' . implode(', ', $errors)]);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create questions: ' . $e->getMessage()]);
        }
    }


} 