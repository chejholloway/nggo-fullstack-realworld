import { inject, Injectable } from "@angular/core";
import { from, Observable } from "rxjs";
import { createClient } from "@connectrpc/connect";
import { CommentService as ConnectCommentService } from "@conduit/gen/comments";
import { CONNECT_TRANSPORT } from "@conduit/shared-data-access";
import {
  GetCommentsRequest,
  GetCommentsRequestSchema,
  GetCommentsResponse,
  AddCommentRequest,
  AddCommentRequestSchema,
  AddCommentResponse,
  DeleteCommentRequest,
  DeleteCommentRequestSchema,
  DeleteCommentResponse,
} from "@conduit/gen/comments";

@Injectable({ providedIn: "root" })
export class CommentsService {
  private transport = inject(CONNECT_TRANSPORT);
  private client = createClient(ConnectCommentService, this.transport);

  getComments(articleSlug: string): Observable<GetCommentsResponse> {
    return from(this.client['getComments']({ slug: articleSlug }));
  }

  addComment(articleSlug: string, body: string): Observable<AddCommentResponse> {
    return from(this.client['addComment']({ slug: articleSlug, body }));
  }

  deleteComment(articleSlug: string, id: number): Observable<DeleteCommentResponse> {
    return from(this.client['deleteComment']({ slug: articleSlug, id }));
  }
}
