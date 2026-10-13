<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    // GET /api/posts … 新着順の一覧
    public function index(Request $request)
    {
        $posts = Post::with('user')   // 投稿者をまとめて取得（N+1 を避ける）
            ->latest()
            ->latest('id')
            ->get();

        // いいね数と、自分のいいねを付ける
        foreach ($posts as $post) {
            $this->attachLikes($post, $request->query('user_id'));
        }

        return PostResource::collection($posts);
    }

    // POST /api/posts … 投稿する（バリデーションは StorePostRequest）
    public function store(StorePostRequest $request)
    {
        $post = $request->user()->posts()->create($request->validated());

        return (new PostResource($post->load('user')))
            ->response()
            ->setStatusCode(201);
    }

    // GET /api/posts/{post} … 1件取得（存在しない ID なら自動で 404）
    public function show(Request $request, Post $post)
    {
        $this->attachLikes($post->load('user'), $request->query('user_id'));

        return new PostResource($post);
    }

    private function attachLikes(Post $post, $userId): void
    {
        $post->likes_count = $post->likes()->count();
        $post->liked_by_me = $post->likes()->where('user_id', $userId)->exists();
        $post->my_like_id = $post->likes()->where('user_id', $userId)->value('id');
    }
}
