import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ArticlesService } from "@conduit/articles-data-access";
import { AuthStore } from "@conduit/auth-data-access";

@Component({
  selector: "app-feature-article",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./feature-article.html",
  styleUrl: "./feature-article.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureArticle implements OnInit {
  private route = inject(ActivatedRoute);
  private articlesService = inject(ArticlesService);
  protected authStore = inject(AuthStore);

  article = signal<any>(null);
  loading = signal(true);
  comments = signal<any[]>([]);

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get("slug");
    if (slug) {
      this.loadArticle(slug);
    }
  }

  loadArticle(slug: string) {
    this.loading.set(true);
    this.articlesService.getArticle(slug).subscribe({
      next: (res) => {
        this.article.set(res.article);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleFavorite() {
    const article = this.article();
    if (!article) return;

    const action$ = article.favorited
      ? this.articlesService.unfavorite(article.slug)
      : this.articlesService.favorite(article.slug);

    action$.subscribe({
      next: (res) => this.article.set(res.article),
    });
  }
}
