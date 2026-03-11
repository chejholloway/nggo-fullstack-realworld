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
    const params = new HttpParams()
      .set("limit", limit)
      .set("offset", offset);
    return this.http.get<ArticlesResponse>(`${API_BASE}/articles`, { params });
  }

  getByTag(tag: string, offset = 0, limit = 20): Observable<ArticlesResponse> {
    const params = new HttpParams()
      .set("tag", tag)
      .set("limit", limit)
      .set("offset", offset);
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
