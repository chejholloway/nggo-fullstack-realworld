import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { Observable } from "rxjs";
import { ArticlesService, Article } from "@conduit/articles-data-access";
import { AuthStore } from "@conduit/auth-data-access";

type FeedTab = "global" | "personal" | "tag";

@Component({
  selector: "app-feature-feed",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./feature-feed.html",
  styleUrl: "./feature-feed.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureFeed implements OnInit {
  private articlesService = inject(ArticlesService);
  private authStore       = inject(AuthStore);

  articles   = signal<Article[]>([]);
  loading    = signal(true);
  activeTab  = signal<FeedTab>("global");
  activeTag  = signal<string | null>(null);
  isLoggedIn = computed(() => this.authStore.isLoggedIn());

  ngOnInit() { this.loadArticles(); }

  loadArticles() {
    this.loading.set(true);
    const tag = this.activeTag();
    const source$ = tag
      ? this.articlesService.getByTag(tag)
      : this.articlesService.getFeed();

    source$.subscribe({
      next: (res) => {
        this.articles.set(res.articles || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setTab(tab: FeedTab) {
    this.activeTab.set(tab);
    this.activeTag.set(null);
    this.loadArticles();
  }

  setTag(tag: string) {
    this.activeTag.set(tag);
    this.activeTab.set("tag");
    this.loadArticles();
  }

  toggleFavorite(article: Article) {
    const action$: Observable<any> = article.favorited
      ? this.articlesService.unfavorite(article.slug)
      : this.articlesService.favorite(article.slug);

    action$.subscribe({
      next: (res: any) => {
        if (res.article) {
          const updated = res.article;
          this.articles.update(prev =>
            prev.map(a => a.slug === updated.slug ? updated : a)
          );
        }
      },
      error: (err: any) => console.error('Failed to toggle favorite:', err),
    });
  }
}
