<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * X-User-Id ヘッダーで送られてきたユーザーを「現在のユーザー」にする。
 * これ以降は $request->user() や Policy でそのユーザーが使える。
 *
 * ※ 講座用の簡略化。本番ではログイン（Sanctum などの認証）を使い、ヘッダーを信用してはいけない。
 */
class ResolveCurrentUser
{
    public function handle(Request $request, Closure $next): Response
    {
        $userId = $request->header('X-User-Id');

        if ($userId !== null) {
            $user = User::find($userId);
            if ($user === null) {
                abort(401, 'X-User-Id のユーザーが存在しません。');
            }
            Auth::setUser($user);
        }

        return $next($request);
    }
}
