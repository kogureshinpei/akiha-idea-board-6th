<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Throwable;

class HealthController extends Controller
{
    // GET /api/health … 環境確認用。DB につながるか・初期データが入っているかを返す
    public function __invoke()
    {
        try {
            $usersCount = User::count();
            $ok = $usersCount > 0;

            return response()->json([
                'ok' => $ok,
                'php' => PHP_VERSION,
                'laravel' => app()->version(),
                'db' => ['ok' => true, 'users_count' => $usersCount],
            ], $ok ? 200 : 503);
        } catch (Throwable $e) {
            return response()->json([
                'ok' => false,
                'db' => ['ok' => false, 'error' => $e->getMessage()],
            ], 503);
        }
    }
}
