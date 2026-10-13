<?php

namespace Database\Seeders;

use App\Models\Comment;
use Illuminate\Database\Seeder;

class CommentSeeder extends Seeder
{
    public function run(): void
    {
        // [post_id, user_id, body, created_at]（モックアップのコメント）
        $comments = [
            [4, 3, '先生側の画面もあるといいかも。答えた質問に印を付けられるとか。', '2026-10-12 22:03:00'],
            [4, 1, '匿名だと荒れないかが心配。投稿前に確認する仕組みはいる？', '2026-10-12 22:15:00'],
            [4, 2, '確かに。最初は先生だけが見られる形にしてもいいかも。', '2026-10-12 22:40:00'],
            [3, 4, '部室の鍵の貸し出しにも使えそう。', '2026-10-12 19:20:00'],
        ];
        foreach ($comments as [$postId, $userId, $body, $createdAt]) {
            $comment = new Comment(['user_id' => $userId, 'body' => $body]);
            $comment->post_id = $postId;
            $comment->created_at = $createdAt;
            $comment->updated_at = $createdAt;
            $comment->save();
        }
    }
}
