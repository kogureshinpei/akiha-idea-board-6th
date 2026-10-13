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
            ->withLikeInfo($request->user())
            ->withCount('comments')
            ->latest()
            ->latest('id')
            ->get();

        return PostResource::collection($posts);
    }

    // POST /api/posts … 投稿する（バリデーションは StorePostRequest）
    public function store(StorePostRequest $request)
    {
        $post = $request->user()->posts()->create($request->validated());

        return (new PostResource($post->load('user')->loadLikeInfo($request->user())->loadCount('comments')))
            ->response()
            ->setStatusCode(201);
    }

    // GET /api/posts/{post} … 1件取得（存在しない ID なら自動で 404）
    public function show(Request $request, Post $post)
    {
        return new PostResource($post->load('user')->loadLikeInfo($request->user())->loadCount('comments'));
    }
}
