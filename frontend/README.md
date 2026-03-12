# conduit-frontend

Angular 21 frontend for the [Real World App (Conduit)](https://realworld-docs.netlify.app/) spec. Built with the latest Angular APIs — zoneless change detection, signal inputs, signal-based state — managed in an Nx monorepo with Sheriff enforcing domain boundaries.

---

## Stack

| Concern              | Tool                                           |
| -------------------- | ---------------------------------------------- |
| Framework            | Angular 21                                     |
| Monorepo             | Nx                                             |
| Boundary enforcement | Sheriff (`@softarc/sheriff-core`)              |
| Styling              | TailwindCSS with `@apply` semantic class names |
| Package manager      | Bun                                            |
| API client           | ConnectRPC (`@connectrpc/connect-web`)         |
| Runtime validation   | Zod                                            |
| Type utilities       | type-fest                                      |
| Tests                | Vitest                                         |

---

## Angular 21 patterns used

**Zoneless change detection** — no Zone.js. `provideZonelessChangeDetection()` in `app.config.ts`. The signal graph drives all updates.

**Signal inputs** — `input.required<T>()` instead of `@Input()`. Components declare what they need at the type level and the compiler enforces it.

**Signal-based state** — `AuthStore` uses `signal()`, `computed()`, and `asReadonly()`. No NgRx for local state, no BehaviorSubject, no subscriptions to manage.

**Standalone components everywhere** — no NgModules. Every component declares its own imports.

**`@for` / `@if` / `@defer`** — the new control flow syntax. `@defer (on viewport)` for lazily rendering below-the-fold content.

**`OnPush` change detection on every component** — combined with signals, this means Angular only checks components when their signal dependencies actually change.

**Functional guards and interceptors** — `authGuard` and `authInterceptor` are plain functions, not classes.

---

## Structure

```
frontend/
├── sheriff.config.ts             # Domain boundary rules
├── tsconfig.base.json            # @conduit/* path aliases
├── apps/
│   └── conduit/
│       └── src/
│           └── app/
│               ├── app.ts        # Root component
│               ├── app.config.ts # provideZonelessChangeDetection, router, HTTP, transport
│               ├── app.routes.ts # Lazy-loaded routes
│               └── auth.interceptor.ts # Attaches JWT token to requests
└── libs/
    ├── articles/
    │   ├── data-access/          # ArticlesService — ConnectRPC client calls
    │   ├── feature-feed/         # Home feed — global + personal + tag filtering
    │   ├── feature-article/      # Single article view + comments
    │   ├── feature-editor/       # Create and edit articles
    │   └── ui-article-preview/   # Article card — pure presentational component
    ├── auth/
    │   ├── data-access/          # AuthStore — signal-based, persists to localStorage
    │   ├── feature-login/        # Login page
    │   └── feature-register/     # Register page
    ├── profile/
    │   ├── data-access/          # ProfileService
    │   ├── feature-profile/      # User profile page + their articles
    │   └── ui-avatar/            # Avatar image component
    └── shared/
        ├── data-access/          # ConnectRPC transport config + CONNECT_TRANSPORT token
        ├── ui-layout/            # Nav bar + footer
        └── util-auth/            # authGuard functional guard
```

---

## Path aliases

All libs are importable via `@conduit/*` — defined in `tsconfig.base.json`:

| Alias                                  | Points to                                  |
| -------------------------------------- | ------------------------------------------ |
| `@conduit/articles-feature-feed`       | `articles/feature-feed/src/index.ts`       |
| `@conduit/articles-feature-article`    | `articles/feature-article/src/index.ts`    |
| `@conduit/articles-feature-editor`     | `articles/feature-editor/src/index.ts`     |
| `@conduit/articles-ui-article-preview` | `articles/ui-article-preview/src/index.ts` |
| `@conduit/articles-data-access`        | `articles/data-access/src/index.ts`        |
| `@conduit/auth-feature-login`          | `auth/feature-login/src/index.ts`          |
| `@conduit/auth-feature-register`       | `auth/feature-register/src/index.ts`       |
| `@conduit/auth-data-access`            | `auth/data-access/src/index.ts`            |
| `@conduit/profile-feature-profile`     | `profile/feature-profile/src/index.ts`     |
| `@conduit/profile-ui-avatar`           | `profile/ui-avatar/src/index.ts`           |
| `@conduit/profile-data-access`         | `profile/data-access/src/index.ts`         |
| `@conduit/shared-data-access`          | `shared/data-access/src/index.ts`          |
| `@conduit/shared-ui-layout`            | `shared/ui-layout/src/index.ts`            |
| `@conduit/shared-util-auth`            | `shared/util-auth/src/index.ts`            |

---

## Prerequisites

- [Bun](https://bun.sh) — `powershell -c "irm bun.sh/install.ps1 | iex"`
- Node.js 20+ (Nx still needs it under the hood even though Bun handles installs)

---

## Getting Started

### 1. Install dependencies

```powershell
bun install
```

### 2. Serve the app

```powershell
bun run nx serve conduit
# Frontend running on http://localhost:4200
```

### 3. Build for production

```powershell
bun run nx build conduit
```

### 4. Run tests

```powershell
# All libs
bun run nx run-many -t test

# Single lib
bun run nx test articles-feature-feed
```

### 5. Lint

```powershell
bun run nx run-many -t lint
```

---

## Domain boundaries (Sheriff)

Sheriff enforces module boundaries via ESLint. The rules live in `sheriff.config.ts`.

```
articles domain  →  can use articles/*, shared/*
auth domain      →  can use auth/*, shared/*
profile domain   →  can use profile/*, shared/*
shared domain    →  can only use shared/*

type:feature     →  can use type:data-access, type:ui, type:shared
type:ui          →  can use type:ui, type:shared only
```

Importing across domain boundaries is an ESLint error — caught at lint time, before anything runs.

---

## ConnectRPC transport

The backend connection is configured once in `shared/data-access` and injected everywhere via the `CONNECT_TRANSPORT` token:

```typescript
// shared/data-access/src/lib/transport.ts
export const CONNECT_TRANSPORT = new InjectionToken<Transport>('CONNECT_TRANSPORT');

export const connectTransport = createConnectTransport({
  baseUrl: 'http://localhost:8080',
});
```

Services inject the token and create typed clients from it:

```typescript
private transport = inject(CONNECT_TRANSPORT);
private client = createClient(ArticleService, this.transport);
```

Change `baseUrl` in one place and every service picks it up.

---

## Styling approach

Tailwind utility classes are composed behind semantic class names using `@apply` in component stylesheets. Templates stay readable, class names are descriptive, and Angular's component encapsulation scopes everything automatically.

```css
/* article-preview.component.css */
.preview-card {
  @apply border-b border-gray-200 py-6;
}
.author-name {
  @apply text-green-500 font-medium hover:text-green-400;
}
.favorite-btn {
  @apply border border-green-500 text-green-500 px-2 py-1 rounded;
}
.favorite-btn.active {
  @apply bg-green-500 text-white;
}
```

```html
<!-- article-preview.component.html -->
<article class="preview-card">
  <a class="author-name">{{ article().author?.username }}</a>
  <button class="favorite-btn" [class.active]="article().favorited">
    ♥ {{ article().favoritesCount }}
  </button>
</article>
```

---

## Nx project graph

View the full dependency graph in the browser:

```powershell
bun run nx graph
```
