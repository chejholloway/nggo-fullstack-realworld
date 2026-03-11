import { Component, inject, signal, OnInit, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommentsService } from '@conduit/comments-data-access';
import { AuthStore } from '@conduit/auth-data-access';

@Component({
  selector: 'app-feature-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './feature-comments.component.html',
  styleUrl: './feature-comments.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureCommentsComponent implements OnInit {
  private commentsService = inject(CommentsService);
  private authStore = inject(AuthStore);

  // Input for article slug
  slug = input.required<string>();

  comments = signal<any[]>([]);
  loading = signal(true);
  submitting = signal(false);
  newComment = signal('');

  currentUser = this.authStore.user;
  isLoggedIn = this.authStore.isLoggedIn;

  ngOnInit() {
    this.loadComments();
  }

  loadComments() {
    this.loading.set(true);
    this.commentsService.getComments(this.slug()).subscribe({
      next: (response: any) => {
        this.comments.set(response.comments || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  submitComment() {
    const commentBody = this.newComment().trim();
    if (!commentBody) return;

    this.submitting.set(true);
    this.commentsService.addComment(this.slug(), commentBody).subscribe({
      next: (response: any) => {
        if (response.comment) {
          this.comments.update(prev => [response.comment, ...prev]);
          this.newComment.set('');
        }
        this.submitting.set(false);
      },
      error: () => {
        this.submitting.set(false);
      },
    });
  }

  deleteComment(commentId: number) {
    this.commentsService.deleteComment(this.slug(), commentId).subscribe({
      next: () => {
        this.comments.update(prev => prev.filter(comment => comment.id !== commentId));
      },
    });
  }

  canDeleteComment(comment: any): boolean {
    const user = this.currentUser();
    return user && comment.author?.username === user.username;
  }
}
