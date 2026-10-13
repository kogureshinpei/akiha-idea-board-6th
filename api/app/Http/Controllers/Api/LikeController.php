<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    // POST /api/posts/{post}/like … いいねする（すでにいいね済みなら何もしない）
    public function store(Request $request, Post $post): JsonResponse
    {
        // createOrFirst：まず INSERT し、UNIQUE 制約に引っかかったら既存の行を使う（連打・同時アクセスでも重複しない）
        $post->likes()->createOrFirst(['user_id' => $request->user()->id]);

        return $this->likeState($request, $post);
    }

    // DELETE /api/posts/{post}/like … いいねを取り消す（自分のいいねだけが消える）
    public function destroy(Request $request, Post $post): JsonResponse
    {
        $post->likes()->where('user_id', $request->user()->id)->delete();

        return $this->likeState($request, $post);
    }

    // 画面がそのまま使えるように、操作後のいいね数と状態を返す
    private function likeState(Request $request, Post $post): JsonResponse
    {
        $post->loadLikeInfo($request->user());

        return response()->json([
            'data' => [
                'post_id' => $post->id,
                'likes_count' => $post->likes_count,
                'liked_by_me' => (bool) $post->liked_by_me,
            ],
        ]);
    }
}
