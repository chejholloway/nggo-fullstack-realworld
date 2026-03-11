import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { AuthStore } from "@conduit/auth-data-access";

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

interface ArticlesResponse { articles: Article[]; articlesCount: number; }
interface ArticleResponse  { article: Article; }

@Injectable({ providedIn: "root" })
export class ArticlesService {
  private http      = inject(HttpClient);
  private authStore = inject(AuthStore);

  private authHeaders(): HttpHeaders {
    const token = this.authStore.token();
    return token
      ? new HttpHeaders({ Authorization: `Token ${token}` })
      : new HttpHeaders();
  }

  /** Global feed — GET /api/articles */
  getFeed(offset = 0, limit = 20): Observable<ArticlesResponse> {
    const params = new HttpParams().set("limit", limit).set("offset", offset);
    return this.http.get<ArticlesResponse>(`${API_BASE}/articles`, {
      params,
      headers: this.authHeaders(),
    });
  }

  /** Personal feed (followed authors) — GET /api/articles/feed — requires auth */
  getMyFeed(offset = 0, limit = 20): Observable<ArticlesResponse> {
    const params = new HttpParams().set("limit", limit).set("offset", offset);
    return this.http.get<ArticlesResponse>(`${API_BASE}/articles/feed`, {
      params,
      headers: this.authHeaders(),
    });
  }

  /** Filter by tag — GET /api/articles?tag=X */
  getByTag(tag: string, offset = 0, limit = 20): Observable<ArticlesResponse> {
    const params = new HttpParams().set("tag", tag).set("limit", limit).set("offset", offset);
    return this.http.get<ArticlesResponse>(`${API_BASE}/articles`, {
      params,
      headers: this.authHeaders(),
    });
  }

  /** Articles by author — GET /api/articles?author=X */
  getByAuthor(username: string, offset = 0, limit = 20): Observable<ArticlesResponse> {
    const params = new HttpParams().set("author", username).set("limit", limit).set("offset", offset);
    return this.http.get<ArticlesResponse>(`${API_BASE}/articles`, {
      params,
      headers: this.authHeaders(),
    });
  }

  /** Articles favorited by a user — GET /api/articles?favorited=X */
  getFavoritedBy(username: string, offset = 0, limit = 20): Observable<ArticlesResponse> {
    const params = new HttpParams().set("favorited", username).set("limit", limit).set("offset", offset);
    return this.http.get<ArticlesResponse>(`${API_BASE}/articles`, {
      params,
      headers: this.authHeaders(),
    });
  }

  getArticle(slug: string): Observable<ArticleResponse> {
    return this.http.get<ArticleResponse>(`${API_BASE}/articles/${slug}`, {
      headers: this.authHeaders(),
    });
  }

  createArticle(data: {
    title: string; description: string; body: string; tagList: string[];
  }): Observable<ArticleResponse> {
    return this.http.post<ArticleResponse>(
      `${API_BASE}/articles`,
      { article: data },
      { headers: this.authHeaders() }
    );
  }

  updateArticle(slug: string, data: {
    title?: string; description?: string; body?: string;
  }): Observable<ArticleResponse> {
    return this.http.put<ArticleResponse>(
      `${API_BASE}/articles/${slug}`,
      { article: data },
      { headers: this.authHeaders() }
    );
  }

  deleteArticle(slug: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/articles/${slug}`, {
      headers: this.authHeaders(),
    });
  }

  favorite(slug: string): Observable<ArticleResponse> {
    return this.http.post<ArticleResponse>(
      `${API_BASE}/articles/${slug}/favorite`,
      {},
      { headers: this.authHeaders() }
    );
  }

  unfavorite(slug: string): Observable<ArticleResponse> {
    return this.http.delete<ArticleResponse>(
      `${API_BASE}/articles/${slug}/favorite`,
      { headers: this.authHeaders() }
    );
  }

  getTags(): Observable<{ tags: string[] }> {
    return this.http.get<{ tags: string[] }>(`${API_BASE}/tags`);
  }
}
