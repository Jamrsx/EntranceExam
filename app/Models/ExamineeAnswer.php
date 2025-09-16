<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ExamineeAnswer extends Model
{
    use HasFactory;

    protected $table = 'examinee_answer';

    protected $fillable = [
        'examineeId',
        'questionId',
        'examId',
        'selected_answer',
        'is_correct'
    ];

    /**
     * Get the examinee for this answer
     */
    public function examinee()
    {
        return $this->belongsTo(Examinee::class, 'examineeId');
    }

    /**
     * Get the question for this answer
     */
    public function question()
    {
        return $this->belongsTo(QuestionBank::class, 'questionId', 'questionId');
    }

    /**
     * Get the exam for this answer
     */
    public function exam()
    {
        return $this->belongsTo(Exam::class, 'examId', 'examId');
    }

    /**
     * Get total questions for an exam (derived from exam_questions_pivot table)
     */
    public static function getTotalQuestionsForExam($examId)
    {
        return DB::table('exam_questions_pivot')
            ->where('examId', $examId)
            ->count();
    }

    /**
     * Get total questions for an examinee's exam
     */
    public function getTotalQuestionsAttribute()
    {
        return self::getTotalQuestionsForExam($this->examId);
    }
}
