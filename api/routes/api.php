<?php

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

Route::post('/posts/{post}/likes', [LikeController::class, 'store']);
Route::delete('/likes/{like}', [LikeController::class, 'destroy']);

// 書き込み系は操作ユーザー（X-User-Id）が必要
Route::middleware('current_user.required')->group(function () {
    Route::post('/posts', [PostController::class, 'store']);
});
