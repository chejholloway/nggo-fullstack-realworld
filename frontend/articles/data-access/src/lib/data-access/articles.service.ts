import { Injectable } from "@angular/core";
import { of } from "rxjs";

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

@Injectable({ providedIn: "root" })
export class ArticlesService {
  getFeed(offset = 0, limit = 20) {
    return of({ articles: [] as Article[], articlesCount: 0 });
  }
  getByTag(tag: string, offset = 0, limit = 20) {
    return of({ articles: [] as Article[], articlesCount: 0 });
  }
  getArticle(slug: string) {
    return of({ article: null as Article | null });
  }
  createArticle(data: { title: string; description: string; body: string; tagList: string[] }) {
    return of({ article: null as Article | null });
  }
  updateArticle(slug: string, data: { title?: string; description?: string; body?: string }) {
    return of({ article: null as Article | null });
  }
  deleteArticle(slug: string) {
    return of({});
  }
  favorite(slug: string) {
    return of({ article: null as Article | null });
  }
  unfavorite(slug: string) {
    return of({ article: null as Article | null });
  }
}
