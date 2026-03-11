import { Injectable, inject } from "@angular/core";
import { createClient } from "@connectrpc/connect";
import { from } from "rxjs";
import { CONNECT_TRANSPORT } from "@conduit/shared-data-access";
import { ArticleService } from "@conduit/gen/articles";

@Injectable({ providedIn: "root" })
export class ArticlesService {
  private transport = inject(CONNECT_TRANSPORT);
  private client    = createClient(ArticleService, this.transport);

  getFeed(offset = 0, limit = 20) {
    return from(this.client.listArticles({ offset, limit }));
  }

  getMyFeed(offset = 0, limit = 20) {
    return from(this.client.listArticles({ offset, limit }));
  }

  getByTag(tag: string, offset = 0, limit = 20) {
    return from(this.client.listArticles({ tag, offset, limit }));
  }

  getArticle(slug: string) {
    return from(this.client.getArticle({ slug }));
  }

  createArticle(data: { title: string; description: string; body: string; tagList: string[] }) {
    return from(this.client.createArticle(data));
  }

  updateArticle(slug: string, data: { title?: string; description?: string; body?: string }) {
    return from(this.client.updateArticle({ slug, ...data }));
  }

  deleteArticle(slug: string) {
    return from(this.client.deleteArticle({ slug }));
  }

  favorite(slug: string) {
    return from(this.client.favoriteArticle({ slug }));
  }

  unfavorite(slug: string) {
    return from(this.client.unfavoriteArticle({ slug }));
  }

  getByAuthor(author: string, offset = 0, limit = 20) {
    return from(this.client.listArticles({ author, offset, limit }));
  }

  getFavoritedBy(favorited: string, offset = 0, limit = 20) {
    return from(this.client.listArticles({ favorited, offset, limit }));
  }
}
