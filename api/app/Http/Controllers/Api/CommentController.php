<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class CommentController extends Controller
{
    // GET /api/posts/{post}/comments … 古い順の一覧
    public function index(Post $post)
    {
        $comments = $post->comments()
            ->with('user')
            ->oldest()
            ->oldest('id')
            ->get();

        return CommentResource::collection($comments);
    }

    // POST /api/posts/{post}/comments … コメントする（書いた人は現在のユーザー）
    public function store(StoreCommentRequest $request, Post $post)
    {
        $comment = $post->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $request->validated('body'),
        ]);

        return (new CommentResource($comment->load('user')))
            ->response()
            ->setStatusCode(201);
    }

    // DELETE /api/comments/{comment} … 削除（本人以外は CommentPolicy で 403）
    public function destroy(Comment $comment): Response
    {
        Gate::authorize('delete', $comment);

        $comment->delete();

        return response()->noContent();
    }
}
