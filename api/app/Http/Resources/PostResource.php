<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    /**
     * API のレスポンスに出す項目はここで決める（DB のカラムをそのまま全部は出さない）
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'body' => $this->body,
            'user' => new UserResource($this->whenLoaded('user')),
            'likes_count' => $this->likes_count ?? 0,
            'liked_by_me' => (bool) $this->liked_by_me,
            'my_like_id' => $this->my_like_id,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
