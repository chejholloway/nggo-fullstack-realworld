import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { Observable } from "rxjs";
import { ArticlesService, Article } from "@conduit/articles-data-access";
import { AuthStore } from "@conduit/auth-data-access";
import { ProfileService } from "@conduit/profile-data-access";

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
  public  authStore       = inject(AuthStore);
  private profileService  = inject(ProfileService);

  articles   = signal<Article[]>([]);
  loading    = signal(true);
  activeTab  = signal<FeedTab>("global");
  activeTag  = signal<string | null>(null);
  isLoggedIn = computed(() => this.authStore.isLoggedIn());

  ngOnInit() { this.loadArticles(); }

  loadArticles() {
    this.loading.set(true);
    const tag = this.activeTag();
    const tab = this.activeTab();

    let source$: Observable<any>;
    if (tag) {
      source$ = this.articlesService.getByTag(tag);
    } else if (tab === "personal" && this.isLoggedIn()) {
      source$ = this.articlesService.getMyFeed();
    } else {
      source$ = this.articlesService.getFeed();
    }

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

  toggleFavorite(article: Article) {
    const action$: Observable<any> = article.favorited
      ? this.articlesService.unfavorite(article.slug)
      : this.articlesService.favorite(article.slug);

    action$.subscribe({
      next: (res: any) => {
        if (res?.article) {
          this.articles.update(prev =>
            prev.map(a => a.slug === res.article.slug ? res.article : a)
          );
        }
      },
      error: (err: any) => console.error("Failed to toggle favorite:", err),
    });
  }

  toggleFollowAuthor(authorUsername: string, isFollowing: boolean) {
    const action$ = isFollowing
      ? this.profileService.unfollowUser(authorUsername)
      : this.profileService.followUser(authorUsername);

    action$.subscribe({
      next: (res: any) => {
        this.articles.update(articles =>
          articles.map(a =>
            a.author?.username === authorUsername
              ? { ...a, author: res.profile }
              : a
          )
        );
      },
      error: (err: any) => console.error(err),
    });
  }
}
