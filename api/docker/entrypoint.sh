#!/bin/sh
# API コンテナの起動処理。初回はライブラリのインストールに数分かかる
set -e

[ -f .env ] || cp .env.example .env

if [ ! -f vendor/autoload.php ]; then
  echo "composer install を実行しています（初回のみ・数分かかります）..."
  composer install --no-interaction --prefer-dist
fi

grep -q '^APP_KEY=base64:' .env || php artisan key:generate --force

php artisan migrate --force
php artisan db:seed --force

echo "API を起動しました: http://localhost:8000/api/health"
exec php artisan serve --host=0.0.0.0 --port=8000 --no-reload
