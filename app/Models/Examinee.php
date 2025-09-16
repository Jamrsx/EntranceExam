<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Examinee extends Model
{
    use HasFactory;

    protected $table = 'examinee';
    protected $fillable = [
        'accountId',
        'name',
        'phone',
        'address',
        'school_name',
        'parent_name',
        'parent_phone',
        'Profile'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'accountId');
    }

    public function examResults()
    {
        return $this->hasMany(ExamResult::class, 'examineeId');
    }

    public function personalityTestResults()
    {
        return $this->hasMany(PersonalityTestResult::class, 'examineeId');
    }

    public function recommendations()
    {
        return $this->hasMany(ExamineeRecommendation::class, 'examineeId');
    }

    public function registration()
    {
        return $this->hasOne(ExamineeRegistration::class, 'examinee_id');
    }

    public function registrations()
    {
        return $this->hasMany(ExamineeRegistration::class, 'examinee_id');
    }

    /**
     * Get the profile image as a data URL for display
     */
    public function getProfileImageAttribute()
    {
        if ($this->Profile) {
            // Determine the image type from the base64 data
            $imageData = $this->Profile;
            $imageInfo = getimagesizefromstring(base64_decode($imageData));
            $mimeType = $imageInfo['mime'] ?? 'image/jpeg';
            
            return 'data:' . $mimeType . ';base64,' . $imageData;
        }
        return null;
    }

    /**
     * Check if the examinee has a profile image
     */
    public function hasProfileImage()
    {
        return !empty($this->Profile);
    }
} 