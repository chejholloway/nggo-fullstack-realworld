import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, ActivatedRoute } from "@angular/router";
import { ArticlesService } from "@conduit/articles-data-access";

@Component({
  selector: "app-feature-editor",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./feature-editor.html",
  styleUrl: "./feature-editor.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureEditor implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private articlesService = inject(ArticlesService);

  title = signal("");
  description = signal("");
  body = signal("");
  tags = signal("");
  errors = signal<string[]>([]);
  loading = signal(false);
  isEdit = signal(false);
  slug = signal("");

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get("slug");
    if (slug) {
      this.isEdit.set(true);
      this.slug.set(slug);
      this.loadArticle(slug);
    }
  }

  loadArticle(slug: string) {
    this.articlesService.getArticle(slug).subscribe({
      next: (res) => {
        if (res.article) {
          this.title.set(res.article.title);
          this.description.set(res.article.description);
          this.body.set(res.article.body);
          this.tags.set(res.article.tagList.join(", "));
        }
      },
    });
  }

  async onSubmit() {
    this.errors.set([]);
    this.loading.set(true);

    const tagList = this.tags()
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);

    try {
      const response = this.isEdit()
        ? await this.articlesService.updateArticle(this.slug(), {
            title: this.title(),
            description: this.description(),
            body: this.body(),
          })
        : await this.articlesService.createArticle({
            title: this.title(),
            description: this.description(),
            body: this.body(),
            tagList,
          });

      if (response.article) {
        await this.router.navigate(["/article", response.article.slug]);
      }
    } catch (error: any) {
      this.errors.set([error.message || "Failed to save article"]);
    } finally {
      this.loading.set(false);
    }
  }
}
