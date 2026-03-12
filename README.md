# nggo-fullstack-realworld

A full-stack implementation of the [Real World App (Conduit)](https://realworld-docs.netlify.app/) spec — a Medium.com clone used to showcase real-world usage of a given tech stack.

This version is built to demonstrate modern full-stack development across the entire stack: a high-performance Go backend serving typed binary data via ConnectRPC, and an Angular 21 frontend using the latest signal-based APIs, all managed in a single monorepo.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Angular 21 (zoneless, signals, standalone components) |
| Frontend monorepo | Nx with Sheriff boundary enforcement |
| Styling | TailwindCSS with `@apply` semantic class names |
| Package manager | Bun |
| Backend language | Go 1.23+ |
| API layer | ConnectRPC (ProtoBufs over HTTP/2) |
| Schema generation | Buf |
| Database | PostgreSQL 16 (Docker) |
| Query layer | sqlc (type-safe generated Go from SQL) |
| Migrations | golang-migrate |

---

## Why this stack?

**ConnectRPC instead of REST** — Proto definitions are the API contract. `buf generate` produces both the Go server stubs and the TypeScript client in one command. No hand-written HTTP calls, no drift between client and server types.

**sqlc instead of an ORM** — SQL queries live in `.sql` files. sqlc reads them and generates fully typed Go functions. The query is readable, the output is type-safe, and there's no runtime magic.

**Angular 21 signals** — Zoneless change detection, signal inputs (`input.required<T>()`), signal-based state, and `@defer` for lazy rendering. No Zone.js, no `async` pipe gymnastics.

**Nx + Sheriff** — 15 libs across 4 domains (articles, auth, profile, shared). Sheriff enforces that feature libs can't reach across domain boundaries at the ESLint level — violations are build errors, not suggestions.

---

## Project Structure

```
nggo-fullstack-realworld/
├── buf.gen.yaml                  # Buf code generation config
├── buf.work.yaml                 # Buf workspace config
├── proto/                        # Source of truth for all API contracts
│   ├── articles/v1/articles.proto
│   ├── auth/v1/auth.proto
│   ├── profile/v1/profile.proto
│   └── comments/v1/comments.proto
├── backend/                      # Go backend
│   ├── go.mod
│   ├── cmd/server/main.go        # Entry point
│   ├── gen/                      # buf generate output — do not edit
│   ├── db/
│   │   ├── sqlc.yaml
│   │   ├── migrations/           # golang-migrate SQL files
│   │   ├── queries/              # sqlc input SQL files
│   │   └── generated/            # sqlc output — do not edit
│   └── internal/
│       ├── articles/handler.go
│       ├── auth/handler.go
│       ├── profile/handler.go
│       ├── comments/handler.go
│       ├── middleware/auth.go
│       └── store/store.go
└── frontend/                     # Angular 21 + Nx monorepo
    ├── sheriff.config.ts         # Domain boundary rules
    ├── tsconfig.base.json        # Path aliases (@conduit/*)
    ├── apps/conduit/             # Main application shell
    └── libs/
        ├── articles/
        │   ├── data-access/      # ArticlesService + proto client
        │   ├── feature-feed/     # Home feed page
        │   ├── feature-article/  # Single article view
        │   ├── feature-editor/   # Create/edit article
        │   └── ui-article-preview/ # Article card component
        ├── auth/
        │   ├── data-access/      # AuthStore (signal-based)
        │   ├── feature-login/    # Login page
        │   └── feature-register/ # Register page
        ├── profile/
        │   ├── data-access/      # ProfileService
        │   ├── feature-profile/  # User profile page
        │   └── ui-avatar/        # Avatar component
        └── shared/
            ├── data-access/      # ConnectRPC transport config
            ├── ui-layout/        # Nav + footer
            └── util-auth/        # Auth guard + token utilities
```

---

## Prerequisites

- [Windows Terminal](https://aka.ms/terminal) — PowerShell 7+
- [Bun](https://bun.sh) — `powershell -c "irm bun.sh/install.ps1 | iex"`
- [Go 1.23+](https://go.dev/dl/) — via `.msi` installer
- [Docker Desktop](https://www.docker.com/products/docker-desktop) — for PostgreSQL
- [Buf CLI](https://buf.build/docs/installation) — `scoop install buf`
- [sqlc](https://sqlc.dev) — download `.exe`, add to PATH
- [golang-migrate](https://github.com/golang-migrate/migrate) — `scoop install migrate`

---

## Getting Started

### 1. Clone and install frontend dependencies

```powershell
git clone https://github.com/chejholloway/nggo-fullstack-realworld
cd nggo-fullstack-realworld\frontend
bun install
```

### 2. Start PostgreSQL

```powershell
docker run --name conduit-db `
  -e POSTGRES_USER=conduit `
  -e POSTGRES_PASSWORD=conduit `
  -e POSTGRES_DB=conduit `
  -p 5432:5432 `
  -d postgres:16
```

### 3. Run database migrations

```powershell
migrate `
  -path backend\db\migrations `
  -database "postgresql://conduit:conduit@localhost:5432/conduit?sslmode=disable" `
  up
```

### 4. Generate code from protos

```powershell
# From the root
buf generate
```

### 5. Generate database query code

```powershell
cd backend
sqlc generate
```

### 6. Run the backend

```powershell
cd backend
go run .\cmd\server
# Backend running on :8080
```

### 7. Run the frontend

```powershell
cd frontend
bun run nx serve conduit
# Frontend running on http://localhost:4200
```

---

## Regenerating code

Both `gen/` folders are generated — never edit them by hand.

| Changed | Command | Run from |
|---|---|---|
| Any `.proto` file | `buf generate` | repo root |
| Any `.sql` query file | `sqlc generate` | `backend/` |

---

## Domain boundaries (Sheriff)

Sheriff enforces these rules at the ESLint level — violations are errors, not warnings.

- Feature libs can import from their own domain's `data-access` and `ui` libs, and from `shared/*`
- UI libs can only import from other UI libs and `shared/*`
- `shared/*` can only import from other `shared/*` libs
- No feature lib can import directly from another domain's feature lib

---

## API

The backend exposes four ConnectRPC services, all on `:8080`:

| Service | Methods |
|---|---|
| `ArticleService` | ListArticles, GetArticle, CreateArticle, UpdateArticle, DeleteArticle, FavoriteArticle, UnfavoriteArticle |
| `AuthService` | Register, Login, GetCurrentUser, UpdateUser |
| `ProfileService` | GetProfile, Follow, Unfollow |
| `CommentService` | AddComment, GetComments, DeleteComment |

Test any endpoint directly:

```powershell
curl.exe -X POST http://localhost:8080/articles.v1.ArticleService/ListArticles `
  -H "Content-Type: application/json" `
  -d "{}"
```

---

The application is now feature-complete and production-ready.
