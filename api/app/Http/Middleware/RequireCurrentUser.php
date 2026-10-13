<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * 書き込み系の API 用。操作ユーザー（X-User-Id）が無ければ 401 を返す。
 */
class RequireCurrentUser
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() === null) {
            abort(401, '操作ユーザーを選んでください（X-User-Id ヘッダーが必要です）。');
        }

        return $next($request);
    }
}
