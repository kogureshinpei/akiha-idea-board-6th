<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * コメントに対して「誰が何をしてよいか」を決める。
 * Comment モデルに対応する Policy として自動で使われる（Gate::authorize('delete', $comment)）
 */
class CommentPolicy
{
    // 削除できるのはコメントを書いた本人だけ（それ以外は 403）
    public function delete(User $user, Comment $comment): Response
    {
        return $user->id === $comment->user_id
            ? Response::allow()
            : Response::deny('自分のコメントだけ削除できます。');
    }
}
