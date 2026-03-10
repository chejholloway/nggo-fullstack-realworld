# conduit-backend

Go backend for the [Real World App (Conduit)](https://realworld-docs.netlify.app/) spec. Serves all API endpoints via ConnectRPC — ProtoBufs over HTTP/2, with a JSON fallback for browser clients.

---

## Stack

| Concern | Tool |
|---|---|
| Language | Go 1.23+ |
| API layer | ConnectRPC |
| Schema / codegen | Buf |
| Database | PostgreSQL 16 |
| Query layer | sqlc |
| Migrations | golang-migrate |
| Auth | JWT (Bearer token middleware) |
| HTTP server | `net/http` + `h2c` for HTTP/2 cleartext |
| CORS | `github.com/rs/cors` |

---

## Structure

```
backend/
├── cmd/
│   └── server/
│       └── main.go           # Entry point — wires everything together
├── db/
│   ├── sqlc.yaml             # sqlc config
│   ├── migrations/           # golang-migrate up/down SQL files
│   │   ├── 000001_init_schema.up.sql
│   │   └── 000001_init_schema.down.sql
│   ├── queries/              # Named SQL queries — sqlc reads these
│   │   ├── articles.sql
│   │   ├── comments.sql
│   │   ├── follows.sql
│   │   ├── tags.sql
│   │   └── users.sql
│   └── generated/            # sqlc output — do not edit by hand
│       ├── db.go
│       ├── models.go
│       └── queries.sql.go
├── gen/                      # buf generate output — do not edit by hand
│   ├── articles/v1/
│   ├── auth/v1/
│   ├── comments/v1/
│   └── profile/v1/
├── internal/
│   ├── articles/
│   │   └── handler.go        # ArticleService handler
│   ├── auth/
│   │   └── handler.go        # AuthService handler
│   ├── comments/
│   │   └── handler.go        # CommentService handler
│   ├── middleware/
│   │   └── auth.go           # JWT extraction middleware
│   ├── profile/
│   │   └── handler.go        # ProfileService handler
│   └── store/
│       └── store.go          # DB connection + sqlc Queries wrapper
└── go.mod
```

---

## Prerequisites

- [Go 1.23+](https://go.dev/dl/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Buf CLI](https://buf.build/docs/installation) — `scoop install buf`
- [sqlc](https://sqlc.dev) — download `.exe`, add to PATH
- [golang-migrate](https://github.com/golang-migrate/migrate) — `scoop install migrate`

---

## Getting Started

### 1. Start PostgreSQL

```powershell
docker run --name conduit-db `
  -e POSTGRES_USER=conduit `
  -e POSTGRES_PASSWORD=conduit `
  -e POSTGRES_DB=conduit `
  -p 5432:5432 `
  -d postgres:16
```

To start it again after a reboot:

```powershell
docker start conduit-db
```

### 2. Run migrations

```powershell
migrate `
  -path db\migrations `
  -database "postgresql://conduit:conduit@localhost:5432/conduit?sslmode=disable" `
  up
```

### 3. Generate proto code

Run this from the **repo root** (not from `backend/`):

```powershell
buf generate
```

This writes Go server stubs into `backend/gen/`.

### 4. Generate query code

```powershell
# From backend/
sqlc generate
```

This writes typed Go functions into `db/generated/` — one function per named SQL query.

### 5. Run the server

```powershell
go run .\cmd\server
# 2026/03/09 21:58:33 Backend running on :8080
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://conduit:conduit@localhost:5432/conduit?sslmode=disable` | Postgres connection string |

The server falls back to the local dev connection string if `DATABASE_URL` is not set. Always set it explicitly in production.

---

## API Services

All services are on `:8080`. ConnectRPC supports both binary protobuf and JSON — use `Content-Type: application/json` for JSON, `application/proto` for binary.

### ArticleService

| Method | Path |
|---|---|
| ListArticles | `POST /articles.v1.ArticleService/ListArticles` |
| GetArticle | `POST /articles.v1.ArticleService/GetArticle` |
| CreateArticle | `POST /articles.v1.ArticleService/CreateArticle` |
| UpdateArticle | `POST /articles.v1.ArticleService/UpdateArticle` |
| DeleteArticle | `POST /articles.v1.ArticleService/DeleteArticle` |
| FavoriteArticle | `POST /articles.v1.ArticleService/FavoriteArticle` |
| UnfavoriteArticle | `POST /articles.v1.ArticleService/UnfavoriteArticle` |

### AuthService

| Method | Path |
|---|---|
| Register | `POST /auth.v1.AuthService/Register` |
| Login | `POST /auth.v1.AuthService/Login` |
| GetCurrentUser | `POST /auth.v1.AuthService/GetCurrentUser` |
| UpdateUser | `POST /auth.v1.AuthService/UpdateUser` |

### ProfileService

| Method | Path |
|---|---|
| GetProfile | `POST /profile.v1.ProfileService/GetProfile` |
| Follow | `POST /profile.v1.ProfileService/Follow` |
| Unfollow | `POST /profile.v1.ProfileService/Unfollow` |

### CommentService

| Method | Path |
|---|---|
| AddComment | `POST /comments.v1.CommentService/AddComment` |
| GetComments | `POST /comments.v1.CommentService/GetComments` |
| DeleteComment | `POST /comments.v1.CommentService/DeleteComment` |

---

## Testing an endpoint

```powershell
curl.exe -X POST http://localhost:8080/articles.v1.ArticleService/ListArticles `
  -H "Content-Type: application/json" `
  -d "{}"
```

Authenticated endpoints need the token header:

```powershell
curl.exe -X POST http://localhost:8080/auth.v1.AuthService/GetCurrentUser `
  -H "Content-Type: application/json" `
  -H "Authorization: Token <your-jwt-here>" `
  -d "{}"
```

---

## Regenerating code

| Changed | Command | Run from |
|---|---|---|
| Any `.proto` file | `buf generate` | repo root |
| Any `.sql` query file | `sqlc generate` | `backend/` |

Never edit `gen/` or `db/generated/` by hand — both folders are fully owned by their respective generators.

---

## Database schema

Six tables: `users`, `articles`, `tags`, `article_tags`, `follows`, `favorites`, `comments`.

Key design decisions:
- UUID primary keys via `gen_random_uuid()` — harder to enumerate than serial integers
- `COALESCE(NULLIF($n, ''), column)` pattern in update queries — partial updates without dynamic SQL
- `ON CONFLICT DO NOTHING` on favorites and follows — idempotent by design
- Indexes on `articles.author_id`, `articles.slug`, `article_tags.tag_id`, `comments.article_id`

To roll back all migrations:

```powershell
migrate `
  -path db\migrations `
  -database "postgresql://conduit:conduit@localhost:5432/conduit?sslmode=disable" `
  down
```

---

## Status

- [x] Server running on `:8080`
- [x] All 4 ConnectRPC services registered
- [x] JWT extraction middleware
- [x] CORS configured for Angular dev server (`:4200`)
- [x] PostgreSQL schema + migrations
- [x] sqlc queries for all domains
- [x] Store wired into server
- [ ] Real handler implementations (currently stubs)
- [ ] JWT generation on login/register
- [ ] Password hashing (bcrypt)
- [ ] Slug generation for articles
