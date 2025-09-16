<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PersonalityType;

class PersonalityTypesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     */
    public function run(): void
    {
        $personalityTypes = [
            ['type' => 'ISTJ', 'title' => 'The Inspector', 'description' => 'Practical, responsible, and organized. They value tradition and order.'],
            ['type' => 'ISFJ', 'title' => 'The Protector', 'description' => 'Warm, caring, and loyal. They are dedicated to helping others.'],
            ['type' => 'INFJ', 'title' => 'The Counselor', 'description' => 'Insightful, creative, and idealistic. They seek meaning and connection.'],
            ['type' => 'INTJ', 'title' => 'The Mastermind', 'description' => 'Strategic, analytical, and independent. They are driven by logic and efficiency.'],
            ['type' => 'ISTP', 'title' => 'The Craftsman', 'description' => 'Flexible, logical, and practical. They excel at hands-on problem solving.'],
            ['type' => 'ISFP', 'title' => 'The Composer', 'description' => 'Artistic, gentle, and adaptable. They value harmony and personal space.'],
            ['type' => 'INFP', 'title' => 'The Healer', 'description' => 'Idealistic, creative, and compassionate. They seek authenticity and meaning.'],
            ['type' => 'INTP', 'title' => 'The Architect', 'description' => 'Analytical, innovative, and independent. They love exploring complex theories.'],
            ['type' => 'ESTP', 'title' => 'The Dynamo', 'description' => 'Energetic, practical, and spontaneous. They thrive on action and excitement.'],
            ['type' => 'ESFP', 'title' => 'The Performer', 'description' => 'Enthusiastic, friendly, and fun-loving. They bring joy and energy to others.'],
            ['type' => 'ENFP', 'title' => 'The Champion', 'description' => 'Enthusiastic, creative, and sociable. They inspire others with their passion.'],
            ['type' => 'ENTP', 'title' => 'The Visionary', 'description' => 'Innovative, strategic, and quick-witted. They love intellectual challenges.'],
            ['type' => 'ESTJ', 'title' => 'The Supervisor', 'description' => 'Practical, organized, and decisive. They are natural leaders and managers.'],
            ['type' => 'ESFJ', 'title' => 'The Provider', 'description' => 'Warm, responsible, and sociable. They are dedicated to helping others.'],
            ['type' => 'ENFJ', 'title' => 'The Teacher', 'description' => 'Charismatic, inspiring, and diplomatic. They are natural mentors and leaders.'],
            ['type' => 'ENTJ', 'title' => 'The Commander', 'description' => 'Strategic, confident, and decisive. They are born leaders and organizers.']
        ];

        foreach ($personalityTypes as $type) {
            PersonalityType::updateOrCreate(
                ['type' => $type['type']],
                $type
            );
        }
    }
} 