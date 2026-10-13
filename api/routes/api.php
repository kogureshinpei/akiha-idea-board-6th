<?php

use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\LikeController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// ここに書いたルートは自動で /api/ から始まる

Route::get('/health', HealthController::class);
Route::get('/users', [UserController::class, 'index']);

Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{post}', [PostController::class, 'show']);
Route::get('/posts/{post}/comments', [CommentController::class, 'index']);

// 書き込み系は操作ユーザー（X-User-Id）が必要
Route::middleware('current_user.required')->group(function () {
    Route::post('/posts', [PostController::class, 'store']);

    Route::post('/posts/{post}/like', [LikeController::class, 'store']);
    Route::delete('/posts/{post}/like', [LikeController::class, 'destroy']);

    Route::post('/posts/{post}/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);
});
