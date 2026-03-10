import { inject, Injectable } from "@angular/core";
import { from, Observable } from "rxjs";
import { createClient } from "@connectrpc/connect";
import { ArticleService } from "@conduit/gen/articles";
import { CONNECT_TRANSPORT } from "@conduit/shared-data-access";
import type { 
  ListArticlesResponse, 
  GetArticleResponse, 
  CreateArticleResponse, 
  UpdateArticleResponse, 
  DeleteArticleResponse,
  FavoriteArticleResponse,
  UnfavoriteArticleResponse
} from "@conduit/gen/articles";

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
  private readonly transport = inject(CONNECT_TRANSPORT);
  private readonly client = createClient(ArticleService, this.transport);

  getFeed(offset = 0, limit = 20): Observable<ListArticlesResponse> {
    return from(
      this.client.listArticles({ offset, limit, tag: "", author: "", favorited: "" })
    );
  }

  getByTag(tag: string, offset = 0, limit = 20): Observable<ListArticlesResponse> {
    return from(
      this.client.listArticles({ offset, limit, tag, author: "", favorited: "" })
    );
  }

  getArticle(slug: string): Observable<GetArticleResponse> {
    return from(this.client.getArticle({ slug }));
  }

  createArticle(data: { title: string; description: string; body: string; tagList: string[] }): Observable<CreateArticleResponse> {
    return from(this.client.createArticle(data));
  }

  updateArticle(slug: string, data: { title?: string; description?: string; body?: string }): Observable<UpdateArticleResponse> {
    return from(this.client.updateArticle({ slug, ...data }));
  }

  deleteArticle(slug: string): Observable<DeleteArticleResponse> {
    return from(this.client.deleteArticle({ slug }));
  }

  favorite(slug: string): Observable<FavoriteArticleResponse> {
    return from(this.client.favoriteArticle({ slug }));
  }

  unfavorite(slug: string): Observable<UnfavoriteArticleResponse> {
    return from(this.client.unfavoriteArticle({ slug }));
  }
}
