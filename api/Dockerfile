FROM php:8.4-cli

# composer install に必要なツールと、MySQL 用の PDO 拡張
RUN apt-get update \
 && apt-get install -y --no-install-recommends git unzip \
 && rm -rf /var/lib/apt/lists/* \
 && docker-php-ext-install pdo_mysql

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/api

CMD ["sh", "docker/entrypoint.sh"]
