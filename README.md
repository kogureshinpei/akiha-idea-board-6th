# 秋ハアイデアボード（6期）

秋ハweek「開発講座」（6期）で使うスターターです。
アイデアを投稿して、みんなで見られる小さな掲示板を、**Laravel の API** と **React の SPA** を別々に立てて作ります。

```
 ブラウザ ── React（http://localhost:5173） ──fetch──▶ Laravel API（http://localhost:8000/api/…） ──▶ MySQL
            web/ ・ローカルの Node で動かす                api/ ・Docker で動かす                  Docker
```

## 起動手順

**API と SPA の 2 つを起動します。** Docker Desktop を起動しておいてください。

### 1. API（Laravel + MySQL）

```bash
git clone https://github.com/kogureshinpei/akiha-idea-board-6th.git
cd akiha-idea-board-6th
docker compose up -d
```

初回は composer install・マイグレーション・初期データ投入まで自動で行うので **2〜5 分かかります**。
http://localhost:8000/api/health が `"ok":true` を返せば API は起動完了です。
進み具合は `docker compose logs -f api` で見られます（`Server running on [http://0.0.0.0:8000]` が出たら完了。Ctrl+C で抜ける）。

### 2. SPA（React + Vite）

別のターミナルで：

```bash
cd akiha-idea-board-6th/web
npm install
npm run dev
```

http://localhost:5173 を開き、一覧の上に「**準備OK**」と表示されれば完了です。

止めるとき・データを初期状態に戻すとき：

```bash
# SPA は npm run dev のターミナルで Ctrl+C
docker compose down      # API を止める（データは残る）
docker compose down -v   # 止めてデータも消す（次の up で初期データに戻る）
```

## うまく動かないとき

| 症状 | 対処 |
|---|---|
| 「まだ準備できていません」「API に接続できませんでした」 | API の初回起動中です。`docker compose logs -f api` で `Server running` が出るまで待ってから再読み込み |
| 初回の `docker compose up -d` やその後の起動がとても長い | 初回は Docker イメージの取得と composer install があるため数分かかります。2 回目以降は数十秒です |
| `port is already allocated`（8000 / 3308） | 他のアプリがそのポートを使っています。止めるか、`docker-compose.yml` の `"8000:8000"` を `"8001:8000"` のように左側だけ変える。**API のポートを変えたら `web/.env` の `VITE_API_URL` も合わせて変え、`npm run dev` をやり直す** |
| `Port 5173 is in use` | Vite が自動で 5174 などを使います。表示された URL を開けば OK |
| `Cannot connect to the Docker daemon` | Docker Desktop を起動してからもう一度 `docker compose up -d` |
| マイグレーションを足したのに反映されない | `docker compose restart api`（起動時に `migrate` が走ります）。作り直したいときは `docker compose down -v && docker compose up -d` |
| `artisan` コマンドを使いたい | `docker compose exec api php artisan route:list` のように、コンテナの中で実行する |
| API のエラー内容を見たい | `docker compose logs api`、または `api/storage/logs/laravel.log` |
| DB の中身を直接見たい | `docker compose exec db mysql -uakiha -pakiha akiha`（または TablePlus などで `127.0.0.1:3308` / ユーザー `akiha` / パスワード `akiha`） |

## 操作ユーザーについて（講座用の簡略化）

ログイン機能は作っていません。SPA のヘッダーで操作ユーザーを選ぶと、ブラウザ（localStorage）に保存され、
API を呼ぶたびに **`X-User-Id` ヘッダー** で送られます。Laravel 側はミドルウェア
（`app/Http/Middleware/ResolveCurrentUser.php`）でそのユーザーを「現在のユーザー」にするので、
コントローラーでは `$request->user()` で取得できます。

> **本番では必ず認証（Laravel Sanctum など）を使います。** ヘッダーの値は誰でも書き換えられるので、
> 実際のサービスでこのやり方をしてはいけません。講座で認証の説明を省くための簡略化です。

- `X-User-Id` なし … 読み取り（GET）だけできる。書き込みは `401`
- `X-User-Id` が存在しないユーザー … `401`

## API の取り決め

レスポンスは API Resource で整形しており、本体は `data` の中に入ります。

| メソッド | パス | リクエスト | 成功時のレスポンス | 失敗時 |
|---|---|---|---|---|
| GET | `/api/health` | ― | `200 {"ok":true,"db":{"ok":true,"users_count":4},…}` | `503`（DB に接続できない等） |
| GET | `/api/users` | ― | `200 {"data":[{"id":1,"name":"山田"},…]}` | |
| GET | `/api/posts` | ― | `200 {"data":[Post,…]}`（新着順） | |
| GET | `/api/posts/{id}` | ― | `200 {"data":Post}` | `404` |
| POST | `/api/posts` | `X-User-Id` ＋ `{"title":"…","body":"…"}` | `201 {"data":Post}` | `401` / `422 {"message":"…","errors":{"title":["…"]}}` |
| POST | `/api/posts/{id}/like` | `X-User-Id` | `200 {"data":{"post_id":4,"likes_count":3,"liked_by_me":true}}`（いいね済みでも 200・重複しない） | `401` / `404` |
| DELETE | `/api/posts/{id}/like` | `X-User-Id` | `200 {"data":{"post_id":4,"likes_count":2,"liked_by_me":false}}`（自分のいいねだけ消える） | `401` / `404` |

| GET | `/api/posts/{id}/comments` | ― | `200 {"data":[Comment,…]}`（古い順） | `404` |
| POST | `/api/posts/{id}/comments` | `X-User-Id` ＋ `{"body":"…"}` | `201 {"data":Comment}` | `401` / `404` / `422` |
| DELETE | `/api/comments/{id}` | `X-User-Id` | `204`（本文なし） | `401` / `403`（本人以外）/ `404` |

> いいね（`/like`）は `answer/like` 以降、コメント（`/comments`）は `answer/comment` にあります。

```json
// Post
{ "id": 4, "title": "授業の質問を匿名で集めるボード", "body": "…",
  "user": { "id": 2, "name": "佐藤" }, "created_at": "2026-10-12T21:40:00+09:00",
  "likes_count": 3, "liked_by_me": true,    // ← answer/like 以降
  "comments_count": 3 }                     // ← answer/comment

// Comment
{ "id": 1, "post_id": 4, "body": "先生側の画面もあるといいかも。…",
  "user": { "id": 3, "name": "鈴木" }, "created_at": "2026-10-12T22:03:00+09:00" }
```

### コメント機能の決めごと（answer/comment）

| 項目 | 決めたこと | どこで実装しているか |
|---|---|---|
| 一覧の順番 | 古い順（会話の流れで読めるように） | `CommentController@index` |
| 入力チェック | 必須・500 文字以内 | `StoreCommentRequest` |
| 削除できる人 | 書いた本人だけ。他人は `403` | `CommentPolicy@delete` ＋ `Gate::authorize()` |
| **投稿が削除されたら** | **その投稿のコメントも一緒に削除する** | migration の `foreignId('post_id')->constrained()->cascadeOnDelete()` |
| ユーザーが削除されたら | そのユーザーのコメントも削除する | migration の `foreignId('user_id')->…->cascadeOnDelete()` |
| 一覧のコメント数 | `comments_count` を `withCount` で 1 回の SQL で取得 | `PostController@index` |
| 画面 | 読み込み中・エラー・0 件の表示／入力エラーを欄の下に表示／送信中はボタンを無効化して二重送信を防ぐ／自分のコメントにだけ削除ボタン（確認ダイアログあり） | `web/src/components/CommentSection.jsx` |

> 投稿の削除機能はまだありませんが、作ったときにコメントが「親のいない」状態で残らないよう、先に DB で決めています。

気づきワークの解説（`review/like-naive` の問題点と直し方）は [`docs/review-answer.md`](docs/review-answer.md) にあります。

## フォルダ構成

```
akiha-idea-board-6th/
├── docker-compose.yml        … API と DB をまとめて起動
├── api/                      … Laravel（API 専用）
│   ├── Dockerfile / docker/entrypoint.sh
│   ├── routes/api.php
│   ├── app/Http/Controllers/Api/
│   ├── app/Http/Requests/
│   ├── app/Http/Resources/
│   ├── app/Http/Middleware/
│   ├── app/Models/
│   └── database/migrations/ ・ database/seeders/
└── web/                      … React + Vite（JavaScript）
    ├── .env
    └── src/
        ├── api/ ・ pages/ ・ components/ ・ hooks/ ・ lib/
        ├── App.jsx ・ main.jsx
        └── index.css
```

| 場所 | 役割 |
|---|---|
| `docker-compose.yml` | `api`（PHP 8.4 + `php artisan serve`）と `db`（MySQL 8.0）を起動 |
| `api/docker/entrypoint.sh` | API 起動時の処理。`.env` 作成 → composer install（初回）→ `migrate` → `db:seed` → サーバー起動 |
| `api/routes/api.php` | URL とコントローラーの対応（ここに書いたルートは `/api/` から始まる） |
| `api/app/Http/Controllers/Api/` | リクエストを受けて処理する（`PostController` / `UserController` / `HealthController`） |
| `api/app/Http/Requests/` | 入力チェック（バリデーション）。`StorePostRequest` |
| `api/app/Http/Resources/` | レスポンスの形を決める。`PostResource` / `UserResource` |
| `api/app/Http/Middleware/` | `X-User-Id` から現在のユーザーを決める（`ResolveCurrentUser`）、書き込みにユーザーを必須にする（`RequireCurrentUser`） |
| `api/app/Models/` | テーブルに対応するモデルとリレーション。`User` / `Post` |
| `api/database/migrations/` | テーブル定義 |
| `api/database/seeders/DatabaseSeeder.php` | 初期データ（users 4人・posts 4件）。何度実行しても同じ状態になる |
| `web/.env` | API の URL（`VITE_API_URL`） |
| `web/src/api/` | API を呼ぶ関数。`client.js` の `apiFetch` が `X-User-Id` 付与とエラー処理をまとめて行う |
| `web/src/pages/` | 画面。`PostListPage`（一覧）/ `PostNewPage`（新規投稿）/ `PostDetailPage`（詳細） |
| `web/src/components/` | 部品。`Header`（ユーザー切替）/ `HealthStatus`（準備OK）/ `PostCard` / `Status`（読み込み中・エラー・0件）など |
| `web/src/hooks/useCurrentUser.js` | 操作ユーザーをどの画面からでも使うためのフック |
| `web/src/index.css` | 見た目（7期版と同じデザイン） |

## 1つの機能 ＝ API の取り決め → Laravel → React

機能を足すときは、**先に API の取り決め（エンドポイント・リクエスト・レスポンス）を決めて**、
それから Laravel と React をそれぞれ作ります。取り決めがあれば、フロントとバックを別の人（や AI）が同時に作れます。
「投稿する」機能を例にすると、こうつながっています。

```
① API の取り決め
   POST /api/posts   X-User-Id: 2   {"title":"…","body":"…"}
   → 201 {"data": Post}    / 入力エラーは 422 {"errors":{"title":["…"]}}

② Laravel（api/）                                   ③ React（web/src/）
   database/migrations/…_create_posts_table.php       api/posts.js
     posts テーブル（user_id, title, body）              createPost({ title, body })
   app/Models/Post.php                                    → apiFetch('/posts', { method: 'POST', body })
     user() リレーション / Fillable                     pages/PostNewPage.jsx
   routes/api.php                                         state: title, body, errors, submitting
     Route::post('/posts', [PostController, 'store'])     送信 → 成功なら一覧へ / 422 なら errors を表示
   app/Http/Requests/StorePostRequest.php                 送信中はボタンを無効化（二重送信防止）
     title: required|max:100, body: required          pages/PostListPage.jsx
   app/Http/Controllers/Api/PostController@store          fetchPosts() → 読み込み中 / エラー / 0件 / 一覧
     $request->user()->posts()->create(…)
   app/Http/Resources/PostResource.php
     id, title, body, user, created_at を返す
```

Laravel 側は **migration → model → route → request → controller → resource**、
React 側は **api 呼び出し → state → 画面** の順に考えると迷いにくいです。

## 講座の課題

### 気づきワーク（全員）：お題「いいね」

AI に「いいね機能を作って」とだけ頼むと、どんなコードが出てくるでしょうか。
`review/like-naive` ブランチの実装をレビューして、問題点を探してみましょう。
そのあと、自分なら AI にどう頼むか（API の取り決め・制約・エッジケース）を書き出します。

```bash
git switch review/like-naive
docker compose down -v && docker compose up -d   # DB を作り直す（likes テーブルができる）
```

### 演習（ペア）：コメント機能

フロント得意 × バック得意のペアで、**各自が苦手な側を AI と一緒に実装**します。
開始地点は `answer/like` ブランチ（いいね機能の完成版）です。

1. ペアで要件を機能要件に落とし込む（誰が・何を・どこで・できないことは？）
2. API の取り決めを書く（エンドポイント・リクエスト・レスポンス・エラー）
3. 取り決めを渡して、先を見越したプロンプトで AI に実装させる
   - Laravel 担当：migration / model / route / request / controller / resource（＋認可）
   - React 担当：api 呼び出し / state / 画面（読み込み中・エラー・送信中）
4. 相互レビュー：相手の側のコードを読んで、取り決めどおりか・抜けがないか確認する

コメント機能の要件：

- 投稿詳細でコメントの一覧を見られる
- コメントを投稿できる（空はエラー）
- 自分のコメントだけ削除できる（他人のコメントは消せない）
- 投稿が消えたらコメントはどうする？（決めて書く）

```bash
git switch answer/like
docker compose down -v && docker compose up -d   # review/like-naive の likes テーブルを消して作り直す
git switch -c feature/comments    # 自分たちのブランチを切って作業
```

## ブランチ

| ブランチ | 内容 | 使うタイミング |
|---|---|---|
| `main` | スターター（一覧・新規投稿・詳細・ユーザー切替・準備OK） | 講義中の clone と起動確認 |
| `review/like-naive` | AI に丸投げした風のいいね実装。**問題を含んでいます** | 気づきワークのレビュー教材 |
| `answer/like` | いいね機能の模範解答 | 気づきワークの答え合わせ・演習の開始地点 |
| `answer/comment` | `answer/like` ＋ コメント機能の模範解答 | 講師がレビュー時に参照 |

**ブランチを切り替えたら `docker compose down -v && docker compose up -d` で DB を作り直してください。**
ブランチごとにテーブルの形が違う（例：`review/like-naive` と `answer/like` の likes テーブル）ため、作り直さないと前のブランチのテーブルが残ります。
`web/` に新しいパッケージが増えた場合は `npm install` もやり直してください。

GitHub 上でペアのブランチ・PR を作る場合は、このページの **Use this template → Create a new repository** で
**「Include all branches」にチェックを入れて** 自分たちのリポジトリを作ってください（チェックしないと main 以外がコピーされません）。
