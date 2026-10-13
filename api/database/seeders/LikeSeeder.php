<?php

namespace Database\Seeders;

use App\Models\Like;
use Illuminate\Database\Seeder;

class LikeSeeder extends Seeder
{
    public function run(): void
    {
        // [user_id, post_id]
        foreach ([[1, 4], [3, 4], [4, 4], [2, 3], [4, 3], [1, 2]] as [$userId, $postId]) {
            Like::firstOrCreate(['user_id' => $userId, 'post_id' => $postId]);
        }
    }
}
