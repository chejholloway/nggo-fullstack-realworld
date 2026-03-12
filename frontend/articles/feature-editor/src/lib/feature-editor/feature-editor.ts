import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ArticlesService } from '@conduit/articles-data-access';
import { fromObservable, ApiError } from '@conduit/shared-data-access';

@Component({
  selector: 'app-feature-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feature-editor.html',
  styleUrl: './feature-editor.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureEditor implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private articlesService = inject(ArticlesService);

  title = signal('');
  description = signal('');
  body = signal('');
  tags = signal('');
  errors = signal<string[]>([]);
  loading = signal(false);
  isEdit = signal(false);
  slug = signal('');

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.isEdit.set(true);
      this.slug.set(slug);
      this.loadArticle(slug);
    }
  }

  loadArticle(slug: string) {
    // Read operation — stays as Observable with .subscribe()
    this.articlesService.getArticle(slug).subscribe({
      next: (res) => {
        // Bug fix: article is optional in the proto type — guard before access
        if (res.article) {
          this.title.set(res.article.title);
          this.description.set(res.article.description);
          this.body.set(res.article.body);
          this.tags.set(res.article.tagList.join(', '));
        }
      },
    });
  }

  async onSubmit() {
    this.errors.set([]);
    this.loading.set(true);

    const tagList = this.tags()
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const handleError = (error: ApiError) => {
      const msgs = Object.entries(error.fields).flatMap(([f, ms]) => ms.map((m) => `${f} ${m}`));
      this.errors.set(msgs.length ? msgs : [error.message || 'Failed to save article.']);
    };

    // Bug fix: do NOT assign the ternary to a shared variable before calling fromObservable.
    // TypeScript infers the ternary as Observable<UpdateResponse> | Observable<CreateResponse>
    // (two nominally distinct types), and fromObservable<T> cannot resolve T from a union.
    // Calling fromObservable inside each branch lets TypeScript resolve T independently.
    if (this.isEdit()) {
      const result = await fromObservable(
        this.articlesService.updateArticle(this.slug(), {
          title: this.title(),
          description: this.description(),
          body: this.body(),
        }),
      );
      result.match(
        // Bug fix: article is optional in the proto type — use optional chaining
        (res) => {
          if (res.article?.slug) this.router.navigate(['/article', res.article.slug]);
        },
        handleError,
      );
    } else {
      const result = await fromObservable(
        this.articlesService.createArticle({
          title: this.title(),
          description: this.description(),
          body: this.body(),
          tagList,
        }),
      );
      result.match((res) => {
        if (res.article?.slug) this.router.navigate(['/article', res.article.slug]);
      }, handleError);
    }

    this.loading.set(false);
  }
}
