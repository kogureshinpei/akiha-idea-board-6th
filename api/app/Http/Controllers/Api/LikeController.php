<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Like;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class LikeController extends Controller
{
    // POST /api/posts/{post}/likes … いいねする
    public function store(Request $request, Post $post): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $like = $post->likes()->create($validated);

        return response()->json(['data' => $like], 201);
    }

    // DELETE /api/likes/{like} … いいねを取り消す
    public function destroy(Like $like): Response
    {
        $like->delete();

        return response()->noContent();
    }
}
