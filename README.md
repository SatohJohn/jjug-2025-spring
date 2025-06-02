# 2025 Spring Boot + Kotlin + React + OpenFeature サンプル

## 開発環境
- Java 21
- Kotlin 1.9.25
- Spring Boot 3.5.0
- Gradle 8.14
- React 18 (CDN)
- OpenFeature + flagd + DevCycle

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