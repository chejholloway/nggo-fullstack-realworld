import { Component, ChangeDetectionStrategy, inject, input, OnInit, signal } from "@angular/core";
import { CommonModule, NgIf } from "@angular/common";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CommentsService } from "@conduit/comments-data-access";
import { AuthStore } from "@conduit/auth-data-access";

@Component({
  selector: "conduit-ui-comments",
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: "./ui-comments.html",
  styleUrl: "./ui-comments.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiCommentsComponent implements OnInit {
  private commentsService = inject(CommentsService);
  protected authStore = inject(AuthStore);

  slug = input.required<string>();
  comments = signal<any[]>([]);
  commentBody = signal("");
  loading = signal(false);

  ngOnInit() {
    this.loadComments();
  }

  loadComments() {
    this.loading.set(true);
    this.commentsService.getComments(this.slug()).subscribe({
      next: (res) => {
        this.comments.set(res.comments);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  addComment() {
    if (!this.commentBody()) return;
    this.commentsService.addComment(this.slug(), this.commentBody()).subscribe({
      next: (res) => {
        this.comments.update(comments => [res.comment, ...comments]);
        this.commentBody.set("");
      },
      error: (err) => console.error(err),
    });
  }

  deleteComment(id: number) {
    this.commentsService.deleteComment(this.slug(), id).subscribe({
      next: () => {
        this.comments.update(comments => comments.filter(comment => comment.id !== id));
      },
      error: (err) => console.error(err),
    });
  }
}
