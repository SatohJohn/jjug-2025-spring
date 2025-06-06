# 2025 Spring Boot + Kotlin + React + OpenFeature サンプル

## 開発環境
- Java 21
- Spring Boot 3.5.0
- Gradle 8.14
- React 18
- OpenFeature + flagd + DevCycle

---

## アプリケーションの起動方法

### Docker Composeを使用する場合

1. プロジェクトルートで以下のコマンドを実行します：

```sh
docker compose up -d
```

これにより、以下のサービスが起動します：
- Spring Bootアプリケーション（ポート8080）
- PostgreSQL（ポート5432）
- flagd（ポート8013）

2. アプリケーションにアクセス：
- ブラウザで http://localhost:8080 にアクセス

3. 停止する場合：

```sh
docker compose down
```

### ローカル開発環境で実行する場合

1. フロントエンドの開発サーバーを起動：

```sh
cd frontend
npm install
npm run dev
```

2. バックエンドのSpring Bootアプリケーションを起動：

```sh
./gradlew bootRun
```

3. アプリケーションにアクセス：
- フロントエンド: http://localhost:5173
- バックエンド: http://localhost:8080

注意：
- ローカル開発時は、PostgreSQLとflagdを別途起動する必要があります。以下のコマンドで起動できます：

```sh
# PostgreSQLとflagdのみを起動
docker compose up -d db flagd

# 停止する場合
docker compose down
```

- フロントエンドの開発サーバーとバックエンドの両方を起動する必要があります

---

## 環境変数の設定

アプリケーションは以下の環境変数を使用します：

```sh
# Feature Flag Provider設定
OPENFEATURE_PROVIDER=flagd  # デフォルト: flagd
OPENFEATURE_PROVIDERS_FLAGD_HOST=flagd  # デフォルト: flagd
OPENFEATURE_PROVIDERS_FLAGD_PORT=8013  # デフォルト: 8013
OPENFEATURE_PROVIDERS_FLAGD_TIMEOUT=30000  # デフォルト: 30000

# DevCycle設定（DevCycleを使用する場合）
DEVCYCLE_SERVER_SDK_KEY=your-sdk-key

# データベース設定
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/postgres
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
```

これらの環境変数は`.envrc`ファイルで管理することを推奨します：

```sh
# .envrc
export OPENFEATURE_PROVIDER=flagd
export OPENFEATURE_PROVIDERS_FLAGD_HOST=flagd
export OPENFEATURE_PROVIDERS_FLAGD_PORT=8013
export OPENFEATURE_PROVIDERS_FLAGD_TIMEOUT=30000
export DEVCYCLE_SERVER_SDK_KEY=your-sdk-key
export SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/postgres
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=postgres
```

---

## flagd の Docker 起動手順

1. サンプルのフラグ定義ファイル（`flags.json`）を作成します。

```json
{
  "flags": {
    "showHello": {
      "state": "ENABLED",
      "variants": {
        "on": true,
        "off": false
      },
      "defaultVariant": "on"
    }
  }
}
```

2. 上記ファイルをプロジェクトルートに `flags.json` という名前で保存します。

3. 下記コマンドで flagd のDockerコンテナを起動します。

```sh
docker run --rm -p 8013:8013 -v $(pwd)/flags.json:/flags.json ghcr.io/open-feature/flagd:latest start --uri file:/flags.json --port 8013
```

- `8013` ポートで gRPC サーバーが立ち上がります。
- Spring Bootアプリはデフォルトでこのポートのflagdに接続します。

4. Spring Bootアプリを起動し、`/` にアクセスしてフラグによる出し分けを確認してください。

---

## 備考
- フラグ値を `on`/`off` で切り替えるには `flags.json` を編集してください（flagdはファイルの変更を自動で検知します。コンテナの再起動は不要です）。
- DevCycle連携やOpenFeatureの詳細は公式ドキュメントも参照してください。
- 環境変数は`application.properties`の設定よりも優先されます。

# PostgreSQL（Docker）起動手順

1. プロジェクトルートで以下のコマンドを実行してください。

```sh
docker run --name sample-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=postgres -p 5432:5432 -d postgres:16
```

- ユーザー名：postgres
- パスワード：postgres
- データベース名：postgres
- ポート：5432（ローカルと同じ）

2. アプリケーションの `application.properties` はこの設定に合わせてあります。

3. 停止する場合は

```sh
docker stop sample-postgres
```

コンテナを削除する場合は

```sh
docker rm sample-postgres
```

---

# 既存のflagdやDevCycleの手順と併せてご利用ください。 