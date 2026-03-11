# Debugging Prompt: Angular 21 + RealWorld API — CORS and Data Fetch Failures

## Context

This is an Angular 21 (zoneless, signals, standalone components) implementation of
the RealWorld / Conduit spec — a Medium.com clone. The project is a Nx monorepo
managed with Bun, located in a `frontend/` directory. It was originally built with
a ConnectRPC (protobuf) transport layer targeting a local Go backend at
`http://localhost:8080`. That backend has been temporarily replaced with calls to
the public RealWorld REST API at `https://api.realworld.io/api`.

---

## The Two Errors

### Error 1 — CORS block in the browser console

```
Access to XMLHttpRequest at 'https://api.realworld.io/api/articles?limit=20&offset=0'
from origin 'http://localhost:4200' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Error 2 — No article data appears in the UI

The feed page renders, tabs render, but the article list stays empty or in a
loading state forever.

---

## Root Cause Analysis

### CORS (Error 1)

`api.realworld.io` does not send `Access-Control-Allow-Origin` headers for
browser requests originating from `localhost`. This is a known, unfixed upstream
bug. You cannot solve it from frontend JavaScript — the browser blocks the request
before any response arrives.

The fix is Angular's built-in dev-server proxy. When configured, the browser makes
requests to `localhost:4200/conduit-api/...` (same origin — no CORS check), and
the Angular dev server forwards them server-side to `api.realworld.io`. The remote
server sees a Node.js HTTP request, not a browser cross-origin request.

### Missing `proxy.conf.json` (Error 2 — primary cause)

A previous patch modified `apps/conduit/project.json` to add:

```json
"options": {
  "proxyConfig": "proxy.conf.json"
}
```

But `proxy.conf.json` is a **new file** that was never included in the patch
(git diffs don't include untracked files). The user never created it. Without
it, the dev server silently ignores the `proxyConfig` setting and every request
to `/conduit-api/...` returns a 404 from the Angular dev server itself.

### `CommentsService` still on ConnectRPC (secondary cause)

`comments/data-access/src/lib/comments.service.ts` was never migrated to
`HttpClient`. It still calls `http://localhost:8080` via protobuf binary protocol.
Any navigation to an article detail page will silently fail on comments load.

---

## Project Structure (relevant paths only)

```
frontend/                                   ← Nx workspace root, run commands here
├── proxy.conf.json                         ← MUST CREATE (see below)
├── apps/
│   └── conduit/
│       ├── project.json                    ← serve target needs proxyConfig
│       └── src/app/
│           ├── app.config.ts               ← needs provideHttpClient()
│           └── app.routes.ts
├── articles/
│   ├── data-access/src/lib/data-access/
│   │   └── articles.service.ts             ← already migrated to HttpClient ✓
│   ├── feature-feed/src/lib/feature-feed/
│   │   └── feature-feed.ts                 ← consumes res.articles ✓
│   └── ui-comments/src/lib/ui-comments/
│       └── ui-comments.ts                  ← imports CommentsService
├── comments/
│   └── data-access/src/lib/
│       └── comments.service.ts             ← STILL ON ConnectRPC — needs fix
├── auth/
│   ├── feature-login/src/lib/feature-login/
│   │   └── feature-login.ts                ← already migrated to HttpClient ✓
│   └── feature-register/src/lib/feature-register/
│       └── feature-register.ts             ← already migrated to HttpClient ✓
├── profile/
│   ├── data-access/src/lib/
│   │   └── profile.service.ts              ← already migrated to HttpClient ✓
│   └── feature-settings/src/lib/feature-settings/
│       └── feature-settings.ts             ← already migrated to HttpClient ✓
└── shared/
    └── data-access/src/
        ├── index.ts                        ← exports CONNECT_TRANSPORT token
        └── lib/transport.ts                ← kept for backward compat, harmless
```

**Important:** The `tsconfig.base.json` path alias `@conduit/comments-data-access`
resolves to `comments/data-access/src/index.ts` (the top-level `comments/`
directory, NOT `libs/comments/`). There is a duplicate `libs/comments/` that is
NOT used by the app — ignore it.

---

## Current State of Key Files

### `apps/conduit/project.json` — serve target (current, broken)

```json
"serve": {
  "continuous": true,
  "executor": "@angular/build:dev-server",
  "configurations": {
    "production": { "buildTarget": "conduit:build:production" },
    "development": { "buildTarget": "conduit:build:development" }
  },
  "defaultConfiguration": "development",
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

The `options.proxyConfig` key is there, but `proxy.conf.json` does not exist
on disk. This is the primary failure point.

### `apps/conduit/src/app/app.config.ts` (current, correct)

```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { CONNECT_TRANSPORT, connectTransport } from '@conduit/shared-data-access';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(),
    { provide: CONNECT_TRANSPORT, useValue: connectTransport },
  ],
};
```

### `articles/data-access/src/lib/data-access/articles.service.ts` (current, correct)

```typescript
import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

const API_BASE = "/conduit-api";

export interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author?: { username: string; bio: string; image: string; following: boolean };
}

interface ArticlesResponse {
  articles: Article[];
  articlesCount: number;
}

interface ArticleResponse {
  article: Article;
}

@Injectable({ providedIn: "root" })
export class ArticlesService {
  private http = inject(HttpClient);

  getFeed(offset = 0, limit = 20): Observable<ArticlesResponse> {
    const params = new HttpParams().set("limit", limit).set("offset", offset);
    return this.http.get<ArticlesResponse>(`${API_BASE}/articles`, { params });
  }

  getByTag(tag: string, offset = 0, limit = 20): Observable<ArticlesResponse> {
    const params = new HttpParams().set("tag", tag).set("limit", limit).set("offset", offset);
    return this.http.get<ArticlesResponse>(`${API_BASE}/articles`, { params });
  }

  getArticle(slug: string): Observable<ArticleResponse> {
    return this.http.get<ArticleResponse>(`${API_BASE}/articles/${slug}`);
  }

  createArticle(data: { title: string; description: string; body: string; tagList: string[] }): Observable<ArticleResponse> {
    return this.http.post<ArticleResponse>(`${API_BASE}/articles`, { article: data });
  }

  updateArticle(slug: string, data: { title?: string; description?: string; body?: string }): Observable<ArticleResponse> {
    return this.http.put<ArticleResponse>(`${API_BASE}/articles/${slug}`, { article: data });
  }

  deleteArticle(slug: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/articles/${slug}`);
  }

  favorite(slug: string): Observable<ArticleResponse> {
    return this.http.post<ArticleResponse>(`${API_BASE}/articles/${slug}/favorite`, {});
  }

  unfavorite(slug: string): Observable<ArticleResponse> {
    return this.http.delete<ArticleResponse>(`${API_BASE}/articles/${slug}/favorite`);
  }

  getTags(): Observable<{ tags: string[] }> {
    return this.http.get<{ tags: string[] }>(`${API_BASE}/tags`);
  }
}
```

### `comments/data-access/src/lib/comments.service.ts` (current, BROKEN — ConnectRPC)

```typescript
import { inject, Injectable } from "@angular/core";
import { from, Observable } from "rxjs";
import { createClient } from "@connectrpc/connect";
import { CommentService as ConnectCommentService } from "@conduit/gen/comments";
import { CONNECT_TRANSPORT } from "@conduit/shared-data-access";
import {
  GetCommentsResponse,
  AddCommentResponse,
  DeleteCommentResponse,
} from "@conduit/gen/comments";

@Injectable({ providedIn: "root" })
export class CommentsService {
  private transport = inject(CONNECT_TRANSPORT);
  private client = createClient(ConnectCommentService, this.transport);

  getComments(articleSlug: string): Observable<GetCommentsResponse> {
    return from(this.client['getComments']({ slug: articleSlug }));
  }

  addComment(articleSlug: string, body: string): Observable<AddCommentResponse> {
    return from(this.client['addComment']({ slug: articleSlug, body }));
  }

  deleteComment(articleSlug: string, id: number): Observable<DeleteCommentResponse> {
    return from(this.client['deleteComment']({ slug: articleSlug, id }));
  }
}
```

---

## RealWorld API Reference

Base URL (via proxy): `/conduit-api` → proxied to `https://api.realworld.io/api`

Authentication header: `Authorization: Token <jwt>`

### Endpoints needed

| Method | Path | Auth | Returns |
|--------|------|------|---------|
| GET | `/api/articles` | optional | `{ articles: Article[], articlesCount: number }` |
| GET | `/api/articles/feed` | required | `{ articles: Article[], articlesCount: number }` |
| GET | `/api/articles/:slug` | optional | `{ article: Article }` |
| POST | `/api/articles/:slug/favorite` | required | `{ article: Article }` |
| DELETE | `/api/articles/:slug/favorite` | required | `{ article: Article }` |
| GET | `/api/articles/:slug/comments` | optional | `{ comments: Comment[] }` |
| POST | `/api/articles/:slug/comments` | required | `{ comment: Comment }` |
| DELETE | `/api/articles/:slug/comments/:id` | required | 200 empty |
| GET | `/api/profiles/:username` | optional | `{ profile: Profile }` |
| POST | `/api/profiles/:username/follow` | required | `{ profile: Profile }` |
| DELETE | `/api/profiles/:username/follow` | required | `{ profile: Profile }` |
| POST | `/api/users/login` | none | `{ user: User }` |
| POST | `/api/users` | none | `{ user: User }` |
| GET | `/api/user` | required | `{ user: User }` |
| PUT | `/api/user` | required | `{ user: User }` |
| GET | `/api/tags` | none | `{ tags: string[] }` |

**Note:** As of 2024-08-16, `GET /api/articles` and `GET /api/articles/feed`
no longer return the `body` field on articles in the list. The `body` field
is only present on single article responses (`GET /api/articles/:slug`).

### Comment shape

```typescript
interface Comment {
  id: number;
  createdAt: string;
  updatedAt: string;
  body: string;
  author: {
    username: string;
    bio: string;
    image: string;
    following: boolean;
  };
}
```

---

## What You Need To Do

### Fix 1 — Create `frontend/proxy.conf.json`

Create this file at `frontend/proxy.conf.json` (the Nx workspace root, same
level as `package.json`):

```json
{
  "/conduit-api": {
    "target": "https://api.realworld.io",
    "secure": true,
    "changeOrigin": true,
    "pathRewrite": {
      "^/conduit-api": "/api"
    },
    "logLevel": "info"
  }
}
```

How it works: the Angular dev server intercepts any request to
`/conduit-api/*`, strips the `/conduit-api` prefix, and forwards it to
`https://api.realworld.io/api/*`. The browser only ever talks to
`localhost:4200`, so no CORS headers are needed.

### Fix 2 — Rewrite `comments/data-access/src/lib/comments.service.ts`

Replace the ConnectRPC client with `HttpClient`. The `ui-comments` component
expects `res.comments` (array) from `getComments`, `res.comment` (single) from
`addComment`, and void from `deleteComment`.

The auth token must be sent as `Authorization: Token <jwt>` for any
authenticated call. Read it from `AuthStore` which is already provided as
`@Injectable({ providedIn: "root" })` and exposes a `token` computed signal.

Complete replacement file:

```typescript
import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { AuthStore } from "@conduit/auth-data-access";

const API_BASE = "/conduit-api";

export interface Comment {
  id: number;
  createdAt: string;
  updatedAt: string;
  body: string;
  author: {
    username: string;
    bio: string;
    image: string;
    following: boolean;
  };
}

interface CommentsResponse { comments: Comment[]; }
interface CommentResponse  { comment: Comment; }

@Injectable({ providedIn: "root" })
export class CommentsService {
  private http      = inject(HttpClient);
  private authStore = inject(AuthStore);

  private authHeaders(): HttpHeaders {
    const token = this.authStore.token();
    return token
      ? new HttpHeaders({ Authorization: `Token ${token}` })
      : new HttpHeaders();
  }

  getComments(articleSlug: string): Observable<CommentsResponse> {
    return this.http.get<CommentsResponse>(
      `${API_BASE}/articles/${articleSlug}/comments`,
      { headers: this.authHeaders() }
    );
  }

  addComment(articleSlug: string, body: string): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(
      `${API_BASE}/articles/${articleSlug}/comments`,
      { comment: { body } },
      { headers: this.authHeaders() }
    );
  }

  deleteComment(articleSlug: string, id: number): Observable<void> {
    return this.http.delete<void>(
      `${API_BASE}/articles/${articleSlug}/comments/${id}`,
      { headers: this.authHeaders() }
    );
  }
}
```

### Fix 3 — Update `comments/data-access/src/index.ts`

Make sure this file exports the new `Comment` type as well:

```typescript
export * from "./lib/comments.service";
export type { Comment } from "./lib/comments.service";
```

---

## Verification Steps

After applying all three fixes, run:

```bash
cd frontend
bun run nx serve conduit
```

Then test in order:

1. `http://localhost:4200/` — article cards load with author names and tags
2. Open DevTools Network tab — requests go to `/conduit-api/articles`, respond
   200 with JSON (not blocked by CORS)
3. Click any article title — article detail page loads with body text
4. Scroll to comments section — comments load (or show empty state)
5. `http://localhost:4200/login` — form submits, redirects to home on success
6. After login, the "Your Feed" tab appears and loads followed-user articles

---

## What NOT to Change

- `app.config.ts` — `provideHttpClient()` is already there, leave it
- `apps/conduit/project.json` — `proxyConfig` is already wired, leave it
- `articles/data-access/articles.service.ts` — already correct
- `auth/feature-login/feature-login.ts` — already correct
- `auth/feature-register/feature-register.ts` — already correct
- `profile/data-access/profile.service.ts` — already correct
- `profile/feature-settings/feature-settings.ts` — already correct
- The `shared/data-access/transport.ts` ConnectRPC token — leave it,
  it's still imported by `app.config.ts` as a no-op provider. Removing it
  would require touching more files for no gain right now.
- Any files under `libs/` — those are unused duplicates not resolved by
  the tsconfig path aliases.
