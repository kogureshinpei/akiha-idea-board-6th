<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'title', 'body'])]
class Post extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function likes(): HasMany
    {
        return $this->hasMany(Like::class);
    }

    /**
     * いいね数（likes_count）と、$user がいいねしているか（liked_by_me）を
     * 1回の SQL でまとめて取得する（投稿ごとに数えると N+1 になる）
     */
    #[Scope]
    protected function withLikeInfo(Builder $query, ?User $user): void
    {
        $query->withCount('likes')
            ->withExists(['likes as liked_by_me' => fn (Builder $q) => $q->where('user_id', $user?->id)]);
    }

    /**
     * 取得済みの1件に、withLikeInfo と同じ情報を読み込む
     */
    public function loadLikeInfo(?User $user): static
    {
        return $this->loadCount('likes')
            ->loadExists(['likes as liked_by_me' => fn (Builder $q) => $q->where('user_id', $user?->id)]);
    }
}
