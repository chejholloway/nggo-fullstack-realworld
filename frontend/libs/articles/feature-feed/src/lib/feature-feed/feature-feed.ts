import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArticlesService } from '@conduit/articles-data-access';
import { AuthStore } from '@conduit/auth-data-access';

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

  articles   = signal<any[]>([]);
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
      next: (res: any) => {
        this.articles.set(res.articles ?? []);
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

  toggleFavorite(article: any) {
    const action$ = article.favorited
      ? this.articlesService.unfavorite(article.slug)
      : this.articlesService.favorite(article.slug);

    // cast to any to avoid union-type subscribe incompatibility
    (action$ as any).subscribe((res: any) => {
      this.articles.update(prev =>
        prev.map((a: any) => a.slug === article.slug ? (res?.article ?? a) : a)
      );
    });
  }
}
