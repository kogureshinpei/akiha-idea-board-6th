# 気づきワーク解説：review/like-naive の問題点

`review/like-naive` は、AI に「いいね機能を作って」とだけ頼んだときに出てきそうな実装です。
コードは整っていて、普通に触る分には動きます。でも、次の 5 つの問題があります。

| # | 問題 | review/like-naive のどこ | 何が起きるか（再現方法） | answer/like での直し方 |
|---|---|---|---|---|
| 1 | **N+1 クエリ** | `api/app/Http/Controllers/Api/PostController.php` の `index()`：`foreach ($posts as $post)` の中で `$post->likes()->count()` などを実行 | 投稿が N 件あると SQL が 1 + 3N 回飛ぶ。投稿が増えるほど一覧が遅くなる | `Post::withLikeInfo()`（`withCount('likes')` ＋ `withExists`）で、いいね数と自分の状態を **1 回の SQL** で取る（`api/app/Models/Post.php`） |
| 2 | **重複いいね** | `database/migrations/…_create_likes_table.php` に UNIQUE 制約がない／`LikeController@store` が毎回 `create()` | ボタン連打や同時リクエストで同じ人のいいねが何行も入り、いいね数が増え続ける。`curl -X POST …/posts/1/likes -d user_id=1` を何回か送るとすぐ再現 | migration に `unique(['user_id', 'post_id'])` ＋ `createOrFirst()`（UNIQUE 違反なら既存行を使う）。2 回押しても 200 で状態は同じ |
| 3 | **他人として操作できる／本人チェックなし** | いいねする人を **リクエスト本文の `user_id`** で受け取っている（`X-User-Id` を見ていない）。`DELETE /api/likes/{like}` は ID だけで削除し、誰のいいねか確認していない。ルートも `current_user.required` の外 | `user_id` を書き換えれば誰としてでもいいねできる。いいね ID を変えれば **他人のいいねを消せる** | 現在のユーザーは `$request->user()`（ミドルウェアが `X-User-Id` から決めたもの）だけを使う。削除は `DELETE /api/posts/{id}/like` にして `where('user_id', 自分)` で自分の行だけ消す。ルートは `current_user.required` の中 |
| 4 | **楽観的更新を元に戻さない** | `web/src/components/LikeButton.jsx`：先に画面を変えるが、`catch` で `console.error` するだけ | API が落ちている・401 などで失敗しても、画面はいいね済みのまま。リロードすると数字が戻り「消えた」ように見える。再現：`docker compose stop api` してからボタンを押す | 押す前の状態 `before` を取っておき、`catch` で `onChange(before)` して元に戻す。エラーメッセージも表示。成功時はサーバーが返した値で上書き |
| 5 | **二重送信防止なし** | `LikeButton.jsx`：通信中でもクリックを受け付ける | 素早い連打で POST が複数飛ぶ（#2 と組み合わさって重複行ができる）。押す→取り消すが入れ違うと、画面とサーバーの状態がずれる | `useRef` の `pendingRef` で通信中のクリックを無視する（state だと連打の 2 回目に古い値が見えることがあるため ref） |

## 「AI への頼み方」に落とすと

問題はどれも、**頼むときに書いていなかった取り決め** から生まれています。たとえば次を最初に渡すだけで、ほとんど防げます。

```
いいね機能を作ってください。

API の取り決め：
- POST   /api/posts/{id}/like   いいねする。いいね済みなら何もしない（200）
- DELETE /api/posts/{id}/like   自分のいいねを取り消す（200）
- どちらもレスポンスは {"data":{"post_id","likes_count","liked_by_me"}}
- 現在のユーザーは $request->user() を使う（X-User-Id ミドルウェアで解決済み）。ユーザー ID をリクエストで受け取らない
- GET /api/posts に likes_count と liked_by_me を追加。N+1 にしない（withCount / withExists）

制約：
- likes は (user_id, post_id) で UNIQUE。投稿・ユーザー削除時は cascade
- 連打・同時リクエストでも重複しないこと

React：
- 楽観的更新。失敗したら元に戻してエラーを表示
- 通信中の連打は無視する
```

## 講師メモ：再現コマンド

`review/like-naive` で `docker compose down -v && docker compose up -d` したあと：

```bash
# 1. N+1：一覧 1 回で飛ぶ SQL を数える
docker compose exec db mysql -uroot -proot -e "SET GLOBAL general_log_file='/tmp/q.log'; SET GLOBAL general_log=1;"
curl -s localhost:8000/api/posts?user_id=1 > /dev/null
docker compose exec db mysql -uroot -proot -e "SET GLOBAL general_log=0;"
docker compose exec db sh -c "grep Execute /tmp/q.log | grep -c 'from \`likes\`'"   # 投稿数 × 3 回（answer/like では 1 回）

# 2. 重複：同じ人で 3 回いいね → 3 行入る（いいね数 3）
for i in 1 2 3; do curl -s -o /dev/null -X POST localhost:8000/api/posts/1/likes -H 'Accept: application/json' -H 'Content-Type: application/json' -d '{"user_id":1}'; done
curl -s 'localhost:8000/api/posts?user_id=1' | grep -o '"likes_count":[0-9]*' | tail -1

# 3. なりすまし・他人のいいね削除
#   山田（X-User-Id: 1）が、田中（user_id: 4）として いいねできてしまう → 201
curl -s -X POST localhost:8000/api/posts/2/likes -H 'X-User-Id: 1' -H 'Accept: application/json' -H 'Content-Type: application/json' -d '{"user_id":4}'
#   佐藤がいいね → 返ってきた id を、山田が消せてしまう → 204
curl -s -X POST localhost:8000/api/posts/3/likes -H 'X-User-Id: 2' -H 'Accept: application/json' -H 'Content-Type: application/json' -d '{"user_id":2}'
curl -s -o /dev/null -w '%{http_code}\n' -X DELETE localhost:8000/api/likes/<上で返った id> -H 'X-User-Id: 1' 
```

4・5 はブラウザで（`npm run dev`）：`docker compose stop api` してからいいねを押す（画面が戻らない）／DevTools の Network を開いてボタンを素早く連打する（リクエストが何本も飛ぶ）。
