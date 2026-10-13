<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * 初期データ。docker compose up のたびに実行されるので、何度実行しても同じ状態になるように書く
     */
    public function run(): void
    {
        foreach ([1 => '山田', 2 => '佐藤', 3 => '鈴木', 4 => '田中'] as $id => $name) {
            User::updateOrCreate(['id' => $id], ['name' => $name]);
        }

        // すでに投稿がある（＝2回目以降の起動）なら何もしない
        if (Post::exists()) {
            return;
        }

        $posts = [
            [4, 'ゼミの日程調整を一発で', '候補日を出すと全員の空き状況が一覧になって、一番集まれる日がすぐ分かるようにしたい。', '2026-10-10 09:15:00'],
            [3, '学食の混雑をみんなで共有', '今どれくらい混んでいるかをワンタップで報告して、空いている時間帯が分かるようにしたい。', '2026-10-11 12:30:00'],
            [1, 'サークルの備品貸し出し管理', '誰がいつ何を借りているか分からなくなるので、貸し出しと返却をスマホで記録できるようにしたい。', '2026-10-12 18:05:00'],
            [2, '授業の質問を匿名で集めるボード', '講義中に手を挙げづらい質問を匿名で投稿できて、先生が最後にまとめて答えられるようにしたい。質問ごとに「自分も知りたい」を押せると、多くの人が気になっている質問から答えてもらえる。', '2026-10-12 21:40:00'],
        ];
        foreach ($posts as [$userId, $title, $body, $createdAt]) {
            $post = new Post(['user_id' => $userId, 'title' => $title, 'body' => $body]);
            $post->created_at = $createdAt;
            $post->updated_at = $createdAt;
            $post->save();
        }
    }
}
